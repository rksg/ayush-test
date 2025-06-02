import 'reactflow/dist/style.css' // Very important css must be imported!

import { ReactElement, useCallback, useEffect, useRef } from 'react'

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
  NodeDimensionChange,
  getNodesBounds
} from 'reactflow'

import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { ActionType, ActionTypeTitle, StepType, WorkflowPanelMode } from '@acx-ui/rc/utils'

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
import { showActionModal } from '@acx-ui/components'
import { useAttachStepBeneathStepMutation } from '@acx-ui/rc/services'
import { useWorkflowContext } from './WorkflowContextProvider'



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
  const {workflowId} = useWorkflowContext()
  const isFirstRender = useRef(true)
  const isDesignMode = mode === WorkflowPanelMode.Design
  const isEditMode = mode === WorkflowPanelMode.Edit
  const reactFlowInstance = useReactFlow()
  const { $t } = useIntl()
  const [nodes, setNodes, onNodesChange] = useNodesState(props?.initialNodes ?? [])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const [attachSteps, {isLoading: isAttachStepLoading} ] = useAttachStepBeneathStepMutation()

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
    console.log('Node STOPPED dragging =======================================================')
    //TODO: if parent node of the node's chain is overlapping the final node of another chain then connect those two chains
    // TODO: also if final node is over another chains parent node
    const nodeMap = new Map<string, Node>()
    nodes.forEach(n => {nodeMap.set(n.id, n)})
    console.log("NODE MAP", nodeMap)

    // TODO: get parent and/or tail node -- for now I'll just use the current node
    // TODO: should I just verify the current node is either tail or parent and then only allow connecting if it is?

    /** Behavior per Gil (and my additions)
     * - The branch being dragged will be attached to the end of the branch it is dragged on top of 
     * - if the dragged branch is on top of multiple other branches no attachement will occur -- show error
     * - I will only highlight the last step in the parent branch and the first step in the child branch to highlight how things will reconnect
     */

    // TODO: this should be the subflow node
    console.log("DRAGGEd node type", node.type)
    


    // // get all nodes in branch
    // let branchNodes = new Array<Node>()

    // // get parents
    // let currentNodeId:string|null = node.id
    // while(currentNodeId) {
    //   let currentNode = nodeMap.get(currentNodeId)

    //   if(currentNode && currentNode?.data.type !== StepType.Start && currentNode?.data.type !== StepType.End) {
    //     branchNodes.push(currentNode)
    //   }

    //   currentNodeId = currentNode?.data.priorStepId ?? null
    // }

    // get children
    // currentNodeId = node.data?.nextStepId ?? null
    // while(currentNodeId) {
    //   let currentNode = nodeMap.get(currentNodeId)
    //   if(currentNode && currentNode?.data.type !== StepType.Start && currentNode?.data.type !== StepType.End) {
    //     branchNodes.push(currentNode)
    //   }

    //   currentNodeId = currentNode?.data?.nextStepId ?? null
    // }

    // console.log('BRANCH NODES', branchNodes)

    const currentBranchBounds = getNodesBounds([node])
    const intersectingNodes = reactFlowInstance.getIntersectingNodes(node, true)

    console.log("NODE", node)
    console.log('BOUNDING:', currentBranchBounds)
    console.log('INTERSECTING NODES', intersectingNodes)

    // TODO: update all of this to handle connecting to a branch with a parent node
    // TODO: rename other nodes
    let otherNodes = undefined
    if(intersectingNodes) {
      otherNodes = intersectingNodes.filter(n => n.id != node.id && n.parentNode != node.id)
    }

    console.log("OTHER nodes INTERMEDIATE", otherNodes)

    if(!otherNodes || otherNodes.length === 0) {
      // calculate bounding box for plus drag handle (plus is 16 pixels wide and 30 pixels from the top of the subflow)
      const topPlusBounds = {x: currentBranchBounds.x + ((currentBranchBounds.width / 2) - 8), y: currentBranchBounds.y - 30, height: 30, width: 16}
      const topPlusIntersectingNodes = reactFlowInstance.getIntersectingNodes(topPlusBounds)
      otherNodes = topPlusIntersectingNodes
      console.log("TOP PLUS BOUNDS", topPlusBounds)
      console.log("PLUS INTERSECTION", topPlusIntersectingNodes)
    }



    // if(!otherNodes || otherNodes.length === 0) {
    //   // find node under the mouse position in case the branch is being dragged by the plus
    //   // const mouseFlowPosition = reactFlowInstance.screenToFlowPosition({ x: event.clientX,  y: event.clientY })
    //   const mouseFlowPosition = reactFlowInstance.screenToFlowPosition({ x: event.clientX,  y: event.clientY })
    //   const intersectingMouse = reactFlowInstance.getIntersectingNodes({...mouseFlowPosition, width: 10, height: 10}, true)
    //   otherNodes = intersectingMouse
    //   // NOTE: if intersecting mouse is used and there are 3 or more intersections then there are multiple branches, also the mouse doesn't intersect with its own nodes
    //   console.log("MOUSE FLOW POSITION", mouseFlowPosition)
    //   console.log("INTERSECTING MOUSE", intersectingMouse)
    // }

    console.log("OTHER nodes", otherNodes)




    // from other nodes determine final node
    if(otherNodes && otherNodes.length > 0) {

      let idsInBranch = new Set()

      let startingNode = undefined
      startingNode = otherNodes[0]
      // check if this node is a parent node
      // TODO: clean this up
      if(startingNode.type === 'DISCONNECTED_BRANCH') {
        idsInBranch.add(startingNode.id)
        let firstMemberId = startingNode.id.split('parent')[0]
        console.log("CURRENT MEMBER ID", firstMemberId)
        startingNode = nodeMap.get(firstMemberId)
        console.log("CURRENT node", startingNode)
        if(!startingNode) { return }
      }


      // find the top node from the current node
      idsInBranch.add(startingNode.id)
      let currentNode:undefined | Node = startingNode
      while(currentNode?.data?.priorStepId) { //TODO: fix this
        const previousNode = nodeMap.get(currentNode.data.priorStepId)
        if(previousNode && previousNode.data.type !== StepType.Start) {
          idsInBranch.add(previousNode.id)
          currentNode = previousNode
        } else {
          currentNode = undefined
        }
      }

    

      let finalNode = startingNode
      // TODO: clean this up
      if (finalNode.data?.nextStepId) {
        let nextNode = nodeMap.get(finalNode.data.nextStepId)
        while(nextNode) {
          console.log("NEXTNode", nextNode)
          if(nextNode.data.type === StepType.End) {
            nextNode = undefined
          } else {
            idsInBranch.add(nextNode.id)
            finalNode = nextNode
            nextNode = nextNode.data.nextStepId ? nodeMap.get(nextNode.data.nextStepId) : undefined
          }
        }
      }
      console.log("ATTACH TO", finalNode)
      console.log("IDS", idsInBranch)

      // TODO: ----------- START HERE --------------------
      // TODO: this isn't working when dragging mouse over a subflow -- because the ID in the otherNodes is the parent, which isn't in the idsInBranch
      // are there ids that don't belong to the chosen branch?
      let isMultipleBranches = otherNodes.length > idsInBranch.size || otherNodes.filter(n => !idsInBranch.has(n.id)).length > 0
      console.log("IS multiple branches?", isMultipleBranches)

      if(isMultipleBranches) {
        // TODO: show popup?
        return
      }

      // TODO: display popup to reconnect

      // showActionModal({
      //   type: 'confirm',
      //   customContent: {
      //     action: 'DELETE',
      //     entityName: $t({ defaultMessage: 'Action' }),
      //     entityValue: $t(ActionTypeTitle[finalNode.type as ActionType])
      //       ?? $t({ defaultMessage: 'Step' })
      //   },
      //   // content:
      //   //   $t({ defaultMessage: 'Do you want to attach to this step?' }),
      //   onOk: () => {
      //     console.log("OK --------")
      //     // deleteStep({ params: { policyId: workflowId, stepId: nodeId } }).unwrap()
      //   }
      // })

      let stepIdToAttach = node.id
      if(stepIdToAttach && stepIdToAttach.endsWith('parent')) {
        stepIdToAttach = node.id.split('parent')[0]
      }

      const title = $t(
        { defaultMessage: 'Attach to Action "{formattedName}"?' },
        { formattedName: $t(ActionTypeTitle[finalNode.type as ActionType]) }
      )

      showActionModal({
        type: 'confirm',
        title: title,
        content: $t({
          defaultMessage: 
            `Are you sure you want to attach the branch below the step of type "{formattedName}"`
          }, { formattedName: $t(ActionTypeTitle[finalNode.type as ActionType]) }),
        okText: $t({ defaultMessage: 'Attach Actions' }),
        onOk: () => {
          console.log("OK --------", finalNode)
          attachSteps({ params: { policyId: workflowId, stepId: finalNode.id, detachedStepId: stepIdToAttach } }).unwrap()
        }
      })


    }
  









    // TODO: find parent node - if it is overlapping another chains final node highlight that final node (maybe add a custom property to the node that changes it's CSS styling)

    // from reactflow example
    // const closestNode = Array.from(nodeLookup.values()).reduce(
    //   (res, n) => {
    //     if (n.id !== internalNode.id) {
    //       const dx =
    //         n.internals.positionAbsolute.x -
    //         internalNode.internals.positionAbsolute.x;
    //       const dy =
    //         n.internals.positionAbsolute.y -
    //         internalNode.internals.positionAbsolute.y;
    //       const d = Math.sqrt(dx * dx + dy * dy);

    //       if (d < res.distance && d < MIN_DISTANCE) {
    //         res.distance = d;
    //         res.node = n;
    //       }
    //     }

    //     return res;
    //   },
    //   {
    //     distance: Number.MAX_VALUE,
    //     node: null,
    //   },
    // );

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
