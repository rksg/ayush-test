import 'reactflow/dist/style.css' // Very important css must be imported!

import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'

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

import { showActionModal }                                          from '@acx-ui/components'
import { Features, useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { useAttachStepBeneathStepMutation }                         from '@acx-ui/rc/services'
import { ActionType, ActionTypeTitle, StepType, WorkflowPanelMode } from '@acx-ui/rc/utils'

import { useWorkflowContext } from './WorkflowContextProvider'
import {
  AupNode,
  CertTemplateNode,
  DataPromptNode,
  DisplayMessageNode,
  DpskNode,
  MacRegistrationNode,
  StartNode,
  SamlAuthNode
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
  [ActionType.CERT_TEMPLATE]: CertTemplateNode,
  [ActionType.SAML_AUTH]: SamlAuthNode
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
  const { workflowId } = useWorkflowContext()
  const isFirstRender = useRef(true)
  const isDesignMode = mode === WorkflowPanelMode.Design
  const isEditMode = mode === WorkflowPanelMode.Edit
  const reactFlowInstance = useReactFlow()
  const { $t } = useIntl()
  const [nodes, setNodes, onNodesChange] = useNodesState(props?.initialNodes ?? [])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [currentSelectedId, setCurrentSelectedId] = useState('')

  const [attachSteps] = useAttachStepBeneathStepMutation()

  const workflowValidationEnhancementFFToggle =
    useIsSplitOn(Features.WORKFLOW_ENHANCED_VALIDATION_ENABLED)

  const nodeMap = useMemo(() => {
    const nodeMap = new Map<string, Node>()
    if(nodes && nodes.length > 0) {
      nodes.forEach(n => {nodeMap.set(n.id, n)})
    }
    return nodeMap
  }, [nodes])

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

  const onNodeDrag = useCallback((event:React.MouseEvent, node:Node) => {
    const mousePosition = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    })

    const intersectedNodes = reactFlowInstance.getIntersectingNodes(
      { x: mousePosition.x, y: mousePosition.y, height: 1, width: 1 })

    let highestZIndex = -1
    let intersectedNode:Node | undefined = undefined
    intersectedNodes.forEach(n => {
      const nodeZIndex = n.zIndex ?? 0

      if(nodeZIndex > highestZIndex) {
        intersectedNode = nodeZIndex > highestZIndex ? n : intersectedNode
        highestZIndex = nodeZIndex
      }
    })

    // update nodes to have hover effect if intersected
    const updatedNodes:Node[] = []
    nodes.forEach(n => {
      if(n.id === node.id) {
        updatedNodes.push({ ...node, data: {
          ...node.data,
          attachCandidate: n.id === intersectedNode?.id
        } })
      } else {
        updatedNodes.push({ ...n, data: {
          ...n.data,
          attachCandidate: n.id === intersectedNode?.id
        } })
      }
    })


    setNodes(updatedNodes)

  }, [nodes])

  const onNodeDragStop = useCallback((event:React.MouseEvent, node:Node) => {

    const mousePosition = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    })

    const intersectedNodes = reactFlowInstance.getIntersectingNodes(
      { x: mousePosition.x, y: mousePosition.y, height: 1, width: 1 })

    let highestZIndex = -1
    let intersectedNode:Node | undefined = undefined
    for(const n of intersectedNodes) {
      const nodeZIndex = n.zIndex ?? 0

      if(nodeZIndex > highestZIndex) {
        intersectedNode = nodeZIndex > highestZIndex ? n : intersectedNode
        highestZIndex = nodeZIndex
      }
    }

    if(intersectedNode === undefined
      || intersectedNode.type === 'DISCONNECTED_BRANCH'
      || intersectedNode.hidden) {
      return
    }

    // get the id of the step we want to attach below the intersected branch
    let stepIdToAttach = node.id
    if(stepIdToAttach && stepIdToAttach.endsWith('parent')) {
      stepIdToAttach = node.id.split('parent')[0]
    }

    const title = $t(
      { defaultMessage: 'Attach to Step "{formattedName}"?' },
      { formattedName: $t(ActionTypeTitle[intersectedNode.type as ActionType]) }
    )

    showActionModal({
      type: 'confirm',
      title: title,
      content: $t({
        defaultMessage:
          'Are you sure you want to attach the branch below the step of type "{formattedName}"'
      }, { formattedName: $t(ActionTypeTitle[intersectedNode.type as ActionType]) }),
      okText: $t({ defaultMessage: 'Attach Steps' }),
      onOk: () => {
        attachSteps({ params: { policyId: workflowId, stepId: intersectedNode?.id,
          detachedStepId: stepIdToAttach } }).unwrap()
      }
    })

  }, [nodes])

  const onSelectionChange = useCallback((params: { nodes: Node[]; edges: Edge[] }) => {

    const selectedNode = params.nodes.length > 0 ? params.nodes[0] : undefined

    let parentNodeId = undefined
    if(selectedNode?.parentNode) {
      parentNodeId = selectedNode.parentNode
    } else if(selectedNode?.type === 'DISCONNECTED_BRANCH') {
      parentNodeId = selectedNode.id
    }

    // prevent uneccessary updates
    if(!selectedNode || selectedNode?.id === currentSelectedId
      || (parentNodeId && parentNodeId === currentSelectedId)) {
      return
    }

    setCurrentSelectedId(parentNodeId ?? (selectedNode?.id ?? ''))

    let nodeIdSet = new Set()

    let branchStartNodeId = undefined
    if(parentNodeId) {
      branchStartNodeId = parentNodeId.split('parent')[0]
      nodeIdSet.add(parentNodeId)
    } else {
      branchStartNodeId = selectedNode.id
      // find all previous nodes
      let nonDetachedCurrentNodeId = selectedNode.id
      while(nonDetachedCurrentNodeId) {
        nodeIdSet.add(nonDetachedCurrentNodeId)
        nonDetachedCurrentNodeId = nodeMap.get(nonDetachedCurrentNodeId)?.data?.priorStepId
      }
    }

    // get all node ids in the branch
    let currentNode = nodeMap.get(branchStartNodeId)
    // nodeIdSet.add(parentNodeId)
    while(currentNode) {
      if(currentNode.data.type === StepType.End) {
        currentNode = undefined
      } else {
        nodeIdSet.add(currentNode.id)
        currentNode =
          currentNode.data.nextStepId ? nodeMap.get(currentNode.data.nextStepId) : undefined
      }
    }

    // update nodes
    const updatedNodes:Node[] = []
    nodes.forEach(n => {
      if(nodeIdSet.has(n.id)) {
        updatedNodes.push(
          { ...n, zIndex: n.zIndex ? (n.zIndex > 2000 ? n.zIndex : n.zIndex + 1000) : 1000 })
      } else {
        updatedNodes.push(
          { ...n, zIndex: n.zIndex ? (n.zIndex > 2000 ? n.zIndex - 1000 : n.zIndex) : undefined })
      }
    })

    // update edges
    const updatedEdges:Edge[] = []
    edges.forEach(e => {
      if(nodeIdSet.has(e.source)) {
        updatedEdges.push(
          { ...e, zIndex: e.zIndex ? (e.zIndex > 2000 ? e.zIndex : e.zIndex + 1000) : 1000 })
      } else {
        updatedEdges.push(
          { ...e, zIndex: e.zIndex ? (e.zIndex > 2000 ? e.zIndex - 1000 : e.zIndex) : undefined })
      }
    })

    setNodes(updatedNodes)
    setEdges(updatedEdges)

  }, [nodes, edges])



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
      nodesDraggable={workflowValidationEnhancementFFToggle && isDesignMode ? true : false}
      onNodeDrag={workflowValidationEnhancementFFToggle ? onNodeDrag : undefined}
      onNodeDragStop={workflowValidationEnhancementFFToggle ? onNodeDragStop : undefined}
      nodesConnectable={false}
      minZoom={0.1}
      elevateNodesOnSelect={false}
      elevateEdgesOnSelect={false}
      onSelectionChange={onSelectionChange}
      attributionPosition={'bottom-left'}
      elementsSelectable={isDesignMode}
      style={{ background: isDesignMode ? 'var(--acx-neutrals-15)' : '' }}
      proOptions={{ hideAttribution: true }}
    >

      <>
        <Controls
          fitViewOptions={{ maxZoom: 1 }}
          position={'bottom-right'}
          showInteractive={false}
        />
        { isDesignMode &&
          <Background
            color='#ccc'
            variant={BackgroundVariant.Dots}
          />

        }
      </>

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
