import { MouseEvent, useCallback, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'
import ReactFlow, {
  addEdge, Background, BackgroundVariant,
  Connection,
  ConnectionLineType, Controls,
  Edge,
  MarkerType, Node, NodeTypes,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useViewport,
  XYPosition
} from 'reactflow'

import { ActionType } from '@acx-ui/rc/utils'


import AupNode            from '../WorkflowNode/AupNode'
import DataPromptNode     from '../WorkflowNode/DataPromptNode'
import DisplayMessageNode from '../WorkflowNode/DisplayMessageNode'
import DpskNode           from '../WorkflowNode/DpskNode'
import SplitOptionNode    from '../WorkflowNode/SplitOptionNode'
import StartNode          from '../WorkflowNode/StartNode'


// TODO: Use enum to make sure new type adding
const nodeTypes: NodeTypes = {
  START: StartNode,
  [ActionType.AUP]: AupNode,
  [ActionType.DPSK]: DpskNode,
  [ActionType.DATA_PROMPT]: DataPromptNode,
  [ActionType.USER_SELECTION_SPLIT]: SplitOptionNode,
  [ActionType.DISPLAY_MESSAGE]: DisplayMessageNode
}

const findMaxPosition = (nodes: Node[]): XYPosition | undefined => {
  if (nodes.length === 0) return undefined

  return nodes.reduce(
    (max, node) => ({
      x: node.position.x > max.x ? node.position.x : max.x,
      y: node.position.y > max.y ? node.position.y : max.y
    })
    , { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY }
  )
}

interface WorkflowProps {
  isEditMode?: boolean,
  initialNodes?: Node[],
  initialEdges?: Edge[]
}

export default function WorkflowCanvas (props: WorkflowProps) {
  const { $t } = useIntl()
  const [nodes, setNodes, onNodesChange] = useNodesState(props?.initialNodes ?? [])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { x, y, zoom } = useViewport()
  const reactFlowInstance = useReactFlow()
  const [originalPosition, setOriginalPosition] = useState<XYPosition>()

  useEffect(() => {
    if (props.initialNodes) {
      setNodes(props.initialNodes)
    }

    if (props.initialEdges) {
      setEdges(props.initialEdges)
    }
  }, [props.initialNodes, props.initialEdges])

  const onConnect = useCallback(
    (newConnection: Edge<never> | Connection) => {
      console.log('[onConnect]', newConnection)

      // Avoid connect to itself
      if (newConnection.source === newConnection.target) { return }

      setEdges((eds) => addEdge(
        { ...newConnection,
          type: ConnectionLineType.Step,
          // label: 'new step',
          markerEnd: {
            type: MarkerType.Arrow
          }
        },
        eds))
    },
    [setEdges]
  )

  // TODO: avoid nodes overlapping issue
  // 1. if overlap, move the dragged node to original position (it need to make sure every nodes are correct)
  // 2. if overlap, move the dragged node to the near by of the intersection node (it would move to cause another intersection issue)
  const onNodeDragStop = (event: MouseEvent, node: Node, nodes: Node[]) => {
    console.log('[onNodeDragStop] :: ', node, nodes)
    let overlapNodes = reactFlowInstance.getIntersectingNodes({ id: node.id })
    if (overlapNodes.length !== 0) {
      const maxPosition = findMaxPosition(overlapNodes)
      const overlapNode = overlapNodes[0]
      setNodes((nds: Node[]) => {
        const existIndex = nds.findIndex(n => n.id === node.id)
        nds[existIndex] = {
          ...nds[existIndex],
          position: originalPosition ?? nds[existIndex].position
        }
        // nds[existIndex] = { ...nds[existIndex], position: {
        //   x: maxPosition!.x + (overlapNode?.width ?? 100),
        //   y: maxPosition!.y + (overlapNode?.height ?? 100)
        // } }
        setOriginalPosition(undefined)
        return nds
      })
    }
  }

  return (
    <>
      <ReactFlow
        key={'id'}
        snapToGrid
        snapGrid={[5, 5]}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable={false}
        onNodeDragStart={(_, node) => {
          console.log('[onNodeDragStart] :: ', node)
          setOriginalPosition(node.position)
        }}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        minZoom={0.1}
        attributionPosition={'top-right'}
      >
        {/*<MiniMap position={'bottom-left'} />*/}
        <Controls fitViewOptions={{ maxZoom: 1 }} position={'bottom-right'} />
        <Background color='#ccc' variant={BackgroundVariant.Dots} />
      </ReactFlow>

      {/*<Button onClick={() => setVisible(true)}>*/}
      {/*  {'Open Library'}*/}
      {/*</Button>*/}

      {/*<div>*/}
      {/*  <div>Viewport State:</div>*/}
      {/*  <div>{`x: ${x}, y: ${y}, zoom: ${zoom}`}</div>*/}
      {/*  <div>Nodes:</div>*/}
      {/*  <div>{nodes.map((node, index) => <div key={index}>{JSON.stringify(node)}</div>)}</div>*/}
      {/*  <div>Edges:</div>*/}
      {/*  <div>{edges.map((edge, index) => <div key={index}>{JSON.stringify(edge)}</div>)}</div>*/}
      {/*  <div>InteractionNodes:</div>*/}
      {/*  /!*{nodes.length > 0 &&*!/*/}
      {/*  /!*  // <div>{JSON.stringify(reactFlowInstance.getIntersectingNodes(nodes[0]))}</div>*!/*/}
      {/*  /!*}*!/*/}
      {/*</div>*/}
    </>
  )
}
