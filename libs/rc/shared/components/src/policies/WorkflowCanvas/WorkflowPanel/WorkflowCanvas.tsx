import 'reactflow/dist/style.css' // Very important css must be imported!

import { ReactElement, useEffect, useRef } from 'react'

import { useIntl }      from 'react-intl'
import ReactFlow, {
  Panel,
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Node,
  NodeChange,
  NodeTypes,
  useEdgesState,
  useNodesState,
  useReactFlow,
  NodeDimensionChange
} from 'reactflow'

import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { ActionType, WorkflowPanelMode } from '@acx-ui/rc/utils'

import {
  AupNode,
  CertTemplateNode,
  DataPromptNode,
  DisplayMessageNode,
  DpskNode,
  MacRegistrationNode,
  StartNode
} from './WorkflowStepNode'
import DisconnectedBranchNode from './WorkflowStepNode/DisconnectedBranchNode'



const nodeTypes: NodeTypes = {
  START: StartNode, // This is a special type for the starter node displaying
  DISCONNECTED_BRANCH: DisconnectedBranchNode,
  [ActionType.AUP]: AupNode,
  [ActionType.DATA_PROMPT]: DataPromptNode,
  [ActionType.DISPLAY_MESSAGE]: DisplayMessageNode,
  [ActionType.DPSK]: DpskNode,
  [ActionType.MAC_REG]: MacRegistrationNode,
  [ActionType.CERT_TEMPLATE]: CertTemplateNode
}

interface WorkflowProps {
  mode?: WorkflowPanelMode,
  initialNodes?: Node[],
  initialEdges?: Edge[],
  customPanel?: ReactElement<typeof Panel>
}

const MIN_STEP_COUNT = 5

export default function WorkflowCanvas (props: WorkflowProps) {
  const { initialNodes, mode = WorkflowPanelMode.Default, customPanel } = props
  const isFirstRender = useRef(true)
  const isDesignMode = mode === WorkflowPanelMode.Design
  const isEditMode = mode === WorkflowPanelMode.Edit
  const reactFlowInstance = useReactFlow()
  const { $t } = useIntl()
  const [nodes, setNodes, onNodesChange] = useNodesState(props?.initialNodes ?? [])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const workflowValidationEnhancementFFToggle =
    useIsSplitOn(Features.WORKFLOW_ENHANCED_VALIDATION_ENABLED)

  const fitFirstView = () => {
    if (!initialNodes) return

    reactFlowInstance.fitView({
      padding: isEditMode ? 0.1 : 0.3,
      nodes: initialNodes,
      duration: isDesignMode ? 800 : undefined,
      maxZoom: isEditMode ? (initialNodes.length < MIN_STEP_COUNT + 2 ? 1.1 : undefined) : 1.1
    })

    isFirstRender.current = false
  }

  const onCustomNodesChange = (changes: NodeChange[]) => {
    onNodesChange(changes)

    // only trigger fitView at the first time and nodes changes
    if (changes.findIndex(c => c.type === 'dimensions') !== -1) {
      if (isFirstRender.current) {
        fitFirstView()
      } else {
        if (isDesignMode) { // only change the viewport in Design mode
          const currentZoom = reactFlowInstance.getViewport().zoom
          const targetId = (changes.shift() as NodeDimensionChange).id
          const targetNode = initialNodes?.find(n => n.id === targetId)

          if (targetNode) {
            reactFlowInstance.setCenter(
              targetNode.position.x + 110,  // a half of the Node width
              targetNode.position.y + 128,  // two times of the Node height
              { zoom: currentZoom, duration: 800 }
            )
          }
        } else {
          fitFirstView()
        }
      }
    }
  }

  const onCustomNodeDrag = (event: React.MouseEvent, node: Node) => {

    const { movementX, movementY, screenX, screenY } = event
    const flowOldPosition = reactFlowInstance.screenToFlowPosition({
      x: (screenX + movementX),
      y: (screenY + movementY) })
    const flowNewPosition = reactFlowInstance.screenToFlowPosition({ x: screenX, y: screenY })
    const deltaX = (flowOldPosition.x - flowNewPosition.x)
    const deltaY = (flowOldPosition.y - flowNewPosition.y)


    const nodeMap = new Map<string, Node>()
    nodes.forEach(n => {nodeMap.set(n.id, n)})

    // TODO: update to handle splits in both directions

    // update parents
    let currentNodeId:string|null = node.id
    while(currentNodeId) {
      let currentNode = nodeMap.get(currentNodeId)
      if(currentNode) {
        currentNode.position = {
          x: currentNode.position.x + deltaX,
          y: currentNode.position.y + deltaY
        }
      }

      currentNodeId = currentNode?.data.priorStepId ?? null
    }

    // update children
    currentNodeId = node.data?.nextStepId ?? null
    while(currentNodeId) {
      let currentNode = nodeMap.get(currentNodeId)
      if(currentNode) {
        currentNode.position = {
          x: currentNode.position.x + deltaX,
          y: currentNode.position.y + deltaY
        }
      }

      currentNodeId = currentNode?.data?.nextStepId ?? null
    }

    reactFlowInstance.setNodes(Array.from(nodeMap.values()))
  }

  useEffect(() => {
    if (props.initialNodes) {
      setNodes(props.initialNodes)
    }

    if (props.initialEdges) {
      setEdges(props.initialEdges)
    }
  }, [props.initialNodes, props.initialEdges])

  return (
    <ReactFlow
      key={'id'}
      snapToGrid
      snapGrid={[5, 5]}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onCustomNodesChange}
      onEdgesChange={onEdgesChange}
      // TODO: (remove this???) onNodeDrag={onCustomNodeDrag}
      nodesDraggable={workflowValidationEnhancementFFToggle ? true : false}
      nodesConnectable={false}
      minZoom={0.1}
      attributionPosition={'bottom-left'}
      elementsSelectable={isDesignMode}
      // setting elevate edges and nodes to false to prevent selection from hiding edges or nodes
      // The zIndex for nodes and edges is being set manually within workflowUtils.toReactFlowData
      // because the automatic behavior was not handling zIndexes properly causing strange rendering
      elevateEdgesOnSelect={false}
      elevateNodesOnSelect={false}
      style={{ background: isDesignMode ? 'var(--acx-neutrals-15)' : '' }}
      proOptions={{ hideAttribution: true }}
    >
      { isDesignMode &&
        <>
          <Controls
            fitViewOptions={{ maxZoom: 1 }}
            position={'bottom-right'}
          />
          <Background
            color='#ccc'
            variant={BackgroundVariant.Dots}
          />
        </>
      }

      { mode === WorkflowPanelMode.Default &&
        <Panel position={'top-left'} style={{ fontWeight: 600 }}>
          {$t({ defaultMessage: 'Active Workflow Design' })}
        </Panel>
      }
      {
        mode === WorkflowPanelMode.Custom && customPanel
      }
    </ReactFlow>
  )
}
