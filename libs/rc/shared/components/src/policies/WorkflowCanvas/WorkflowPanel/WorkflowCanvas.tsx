import 'reactflow/dist/style.css' // Very important css must be imported!

import { MouseEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react'

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

  // TODO: it might be better to use on selection change...
  const onNodeDragStart = useCallback((event:React.MouseEvent, node:Node) => {
    // TODO: memoize nodemap
    const nodeMap = new Map<string, Node>()
    nodes.forEach(n => {nodeMap.set(n.id, n)})

    if(node.type !== 'DISCONNECTED_BRANCH') {
      // this shouldn't be possible
      return
    }

    const branchStartNodeId = node.id.split('parent')[0]

    // get all node ids in the branch
    let currentNode = nodeMap.get(branchStartNodeId)
    let nodeIdSet = new Set()
    while(currentNode) {
      if(currentNode.data.type === StepType.End) {
        currentNode = undefined
      } else {
        nodeIdSet.add(currentNode.id)
        currentNode =
          currentNode.data.nextStepId ? nodeMap.get(currentNode.data.nextStepId) : undefined
      }
    }

    // NOTE: this is based on reactflow defaults, all nodes are set to 1000 initially and
    // are raised to 2000 when dragged. When created we are manually setting the edges within
    // subflows to 1000 to match the nodes so that this will work.
    // Also, reactflow seems to only update these levels on drag start, so we are following suit
    
    edges.forEach(e => {
      if(nodeIdSet.has(e.source)) {
        // TODO: add 1000
        e.zIndex = e.zIndex ? (e.zIndex > 2000 ? e.zIndex : e.zIndex + 1000) : 1000;
      } else {
        // TODO: if set and over 2000 subtract 1000, else leave alone
        // TODO: clean up
        e.zIndex = e.zIndex ? (e.zIndex > 2000 ? e.zIndex - 1000 : e.zIndex) : undefined
      }
    })

    reactFlowInstance.setEdges(edges)

  }, [nodes, edges])

  const [currentSelectedId, setCurrentSelectedId] = useState('')

// TODO: double check the behavior with opaque subflows and see if that would be ok, in which case skip all of this goofiness

  // the passed handler has to be memoized, otherwise the hook will not work correctly
  const onSelectionChange = useCallback((params: { nodes: Node[]; edges: Edge[] }) => {
    console.log("SELECT change!!!!!!!!!!!!!!", params.nodes)

    const selectedNode = params.nodes.length > 0 ? params.nodes[0] : undefined
    if(!selectedNode) {
      console.log("SKIP 1")
      return
    }

    if(selectedNode?.id === currentSelectedId) {
      console.log("SKIP 2")
      return
    } else {
      setCurrentSelectedId(selectedNode?.id ?? '')
    }

    // TODO: try using this - or start/stop for selection to make the node/edge zIndex changes

    // TODO: memoize nodemap
    const nodeMap = new Map<string, Node>()
    nodes.forEach(n => {nodeMap.set(n.id, n)})

    // find selected node: TODO: may not need this
    // let selectedNode = undefined;
    // selectedNode = params.nodes.find(n => n.selected)
    // console.log("SELECTED", selectedNode)



    //TODO: handle non subflow
    let parentNodeId = undefined
    if(selectedNode?.parentNode) {
      parentNodeId = selectedNode.parentNode
    } else if(selectedNode?.type === 'DISCONNECTED_BRANCH') {
      parentNodeId = selectedNode.id
    }
    
    let nodeIdSet = new Set()
    let branchStartNodeId = undefined;
    if(parentNodeId) {
      console.log("PARENT node", parentNodeId)
      branchStartNodeId = parentNodeId.split('parent')[0]
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
    
    nodeIdSet.add(parentNodeId)
    while(currentNode) {
      if(currentNode.data.type === StepType.End) {
        currentNode = undefined
      } else {
        nodeIdSet.add(currentNode.id)
        currentNode =
          currentNode.data.nextStepId ? nodeMap.get(currentNode.data.nextStepId) : undefined
      }
    }

    // TODO: make this more efficient
    // TODO: move this into the setNodes callback?
    const updatedNodes:Node<any, string | undefined>[] = []; // TODO: update this
    nodes.forEach(n => {
      if(nodeIdSet.has(n.id)) {
        // TODO: add 1000
        updatedNodes.push({...n, zIndex: n.zIndex ? (n.zIndex > 2000 ? n.zIndex : n.zIndex + 1000) : 1000 })
        // n.zIndex = n.zIndex ? (n.zIndex > 2000 ? n.zIndex : n.zIndex + 1000) : 1000;
      } else {
        // TODO: if set and over 2000 subtract 1000, else leave alone
        // TODO: clean up
        // n.zIndex = n.zIndex ? (n.zIndex > 2000 ? n.zIndex - 1000 : n.zIndex) : undefined
        updatedNodes.push({...n, zIndex: n.zIndex ? (n.zIndex > 2000 ? n.zIndex - 1000 : n.zIndex) : undefined })
      }
    })

  
    
    const updatedEdges:Edge<any>[] = [];
    edges.forEach(e => {
      if(nodeIdSet.has(e.source)) {
        // TODO: add 1000
        // e.zIndex = e.zIndex ? (e.zIndex > 2000 ? e.zIndex : e.zIndex + 1000) : 1000;
        updatedEdges.push({...e, zIndex: e.zIndex ? (e.zIndex > 2000 ? e.zIndex : e.zIndex + 1000) : 1000})
      } else {
        // TODO: if set and over 2000 subtract 1000, else leave alone
        // TODO: clean up
        // e.zIndex = e.zIndex ? (e.zIndex > 2000 ? e.zIndex - 1000 : e.zIndex) : undefined
        updatedEdges.push({...e, zIndex:  e.zIndex ? (e.zIndex > 2000 ? e.zIndex - 1000 : e.zIndex) : undefined})
      }
    })

    setNodes(updatedNodes);
    setEdges(updatedEdges)

    // reactFlowInstance.setEdges(edges)
    // reactFlowInstance.setNodes(nodes) // if I depend on the nodes then this creates an infinite loop

    

    // see if I can elevate/lower the entire subflow when one of it's nodes is selected/deselected
  }, [nodes, edges]) // TODO: do I need nodes and edges?

  

  const onSelectionStart = useCallback((event:React.MouseEvent) => {
    console.log("SELECTION START", event)
  }, [])



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
      // onNodeDragStop={workflowValidationEnhancementFFToggle ? onNodeDragStop : undefined}
      nodesConnectable={false}
      onNodeDragStart={onNodeDragStart}
      minZoom={0.1}
      elevateNodesOnSelect={false}
      elevateEdgesOnSelect={false}
      onSelectionChange={onSelectionChange}
      // onSelectionStart={onSelectionStart}
      attributionPosition={'bottom-left'}
      elementsSelectable={isDesignMode}
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
