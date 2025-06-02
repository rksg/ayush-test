import 'reactflow/dist/style.css' // Very important css must be imported!

import { ReactElement, useCallback, useEffect, useRef } from 'react'

import { useIntl } from 'react-intl'
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
  NodeDimensionChange,
  getNodesBounds
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
  const { workflowId } = useWorkflowContext()
  const isFirstRender = useRef(true)
  const isDesignMode = mode === WorkflowPanelMode.Design
  const isEditMode = mode === WorkflowPanelMode.Edit
  const reactFlowInstance = useReactFlow()
  const { $t } = useIntl()
  const [nodes, setNodes, onNodesChange] = useNodesState(props?.initialNodes ?? [])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const [attachSteps] = useAttachStepBeneathStepMutation()

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


  const onNodeDragStop = useCallback((event:React.MouseEvent, node:Node) => {
    const nodeMap = new Map<string, Node>()
    nodes.forEach(n => {nodeMap.set(n.id, n)})

    // get intersecting nodes of the dragged node
    const currentBranchBounds = getNodesBounds([node])
    const allIntersectingNodes = reactFlowInstance.getIntersectingNodes(node, true)

    let otherBranchIntersectingNodes = undefined
    if(allIntersectingNodes) {
      otherBranchIntersectingNodes =
        allIntersectingNodes.filter(n => n.id != node.id && n.parentNode != node.id)
    }

    // if no intersecting nodes were found then look for nodes that the plus drag handle is covering
    if(!otherBranchIntersectingNodes || otherBranchIntersectingNodes.length === 0) {
      // calculate bounding box for plus drag handle
      // (plus is 16 pixels wide and 30 pixels from the top of the subflow)
      const topPlusBounds = { x: currentBranchBounds.x + ((currentBranchBounds.width / 2) - 8),
        y: currentBranchBounds.y - 30, height: 30, width: 16 }
      const topPlusIntersectingNodes = reactFlowInstance.getIntersectingNodes(topPlusBounds)
      otherBranchIntersectingNodes = topPlusIntersectingNodes
    }

    if(!otherBranchIntersectingNodes || otherBranchIntersectingNodes.length === 0) {
      // we are not intersecting other nodes
      return
    }

    // find the final node of the branch we are intersecting with
    let idsInIntersectedBranch = new Set()

    let startingNode = undefined
    startingNode = otherBranchIntersectingNodes[0]
    // check if this node is a parent node (subflow) and get it's child if so
    if(startingNode.type === 'DISCONNECTED_BRANCH') {
      idsInIntersectedBranch.add(startingNode.id)
      let firstMemberId = startingNode.id.split('parent')[0]
      startingNode = nodeMap.get(firstMemberId)
      if(!startingNode) { return }
    }


    // find the top node from the current node
    // (this is necessary so we can determine if we are overlapping multiple branches)
    idsInIntersectedBranch.add(startingNode.id)
    let currentNode:undefined | Node = startingNode
    while(currentNode?.data?.priorStepId) {
      const previousNode = nodeMap.get(currentNode.data.priorStepId)
      if(previousNode && previousNode.data.type !== StepType.Start) {
        idsInIntersectedBranch.add(previousNode.id)
        currentNode = previousNode
      } else {
        currentNode = undefined
      }
    }

    // get the final node of the branch that was intersected with so we can attach to it
    let finalIntersectedNode = startingNode
    if (finalIntersectedNode.data?.nextStepId) {
      let nextNode = nodeMap.get(finalIntersectedNode.data.nextStepId)
      while(nextNode) {
        if(nextNode.data.type === StepType.End) {
          nextNode = undefined
        } else {
          idsInIntersectedBranch.add(nextNode.id)
          finalIntersectedNode = nextNode
          nextNode = nextNode.data.nextStepId ? nodeMap.get(nextNode.data.nextStepId) : undefined
        }
      }
    }

    // if we are intersecting multiple branches do nothing
    let isMultipleBranches = (otherBranchIntersectingNodes.length > idsInIntersectedBranch.size
      || otherBranchIntersectingNodes.filter(n => !idsInIntersectedBranch.has(n.id)).length > 0)
    if(isMultipleBranches) {
      return
    }

    // get the id of the step we want to attach below the intersected branch
    let stepIdToAttach = node.id
    if(stepIdToAttach && stepIdToAttach.endsWith('parent')) {
      stepIdToAttach = node.id.split('parent')[0]
    }

    const title = $t(
      { defaultMessage: 'Attach to Action "{formattedName}"?' },
      { formattedName: $t(ActionTypeTitle[finalIntersectedNode.type as ActionType]) }
    )

    showActionModal({
      type: 'confirm',
      title: title,
      content: $t({
        defaultMessage:
          'Are you sure you want to attach the branch below the step of type "{formattedName}"'
      }, { formattedName: $t(ActionTypeTitle[finalIntersectedNode.type as ActionType]) }),
      okText: $t({ defaultMessage: 'Attach Actions' }),
      onOk: () => {
        attachSteps({ params: { policyId: workflowId, stepId: finalIntersectedNode.id,
          detachedStepId: stepIdToAttach } }).unwrap()
      }
    })




  }, [nodes])



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
      onNodeDragStop={workflowValidationEnhancementFFToggle ? onNodeDragStop : undefined}
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
