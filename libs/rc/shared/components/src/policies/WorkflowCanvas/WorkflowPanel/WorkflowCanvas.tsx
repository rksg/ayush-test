
import { useEffect } from 'react'

import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Node,
  NodeTypes,
  useEdgesState,
  useNodesState
} from 'reactflow'

import { ActionType } from '@acx-ui/rc/utils'

import {
  AupNode,
  DataPromptNode,
  DisplayMessageNode,
  StartNode
} from '../WorkflowStepNode'


const nodeTypes: NodeTypes = {
  START: StartNode, // This is a special type for the starter node displaying
  [ActionType.AUP]: AupNode,
  [ActionType.DATA_PROMPT]: DataPromptNode,
  [ActionType.DISPLAY_MESSAGE]: DisplayMessageNode
}

interface WorkflowProps {
  isEditMode?: boolean,
  initialNodes?: Node[],
  initialEdges?: Edge[]
}

export default function WorkflowCanvas (props: WorkflowProps) {
  const { isEditMode } = props
  const [nodes, setNodes, onNodesChange] = useNodesState(props?.initialNodes ?? [])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

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
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodesDraggable={false}
      nodesConnectable={false}
      minZoom={0.1}
      attributionPosition={'bottom-left'}
      elementsSelectable={!!isEditMode}
      // style={{ background: isEditMode ? 'var(--acx-neutrals-15)' : '' }}
    >
      {/*<MiniMap position={'bottom-left'} />*/}
      {isEditMode &&
        <>
          <Controls fitViewOptions={{ maxZoom: 1 }} position={'bottom-right'} />
          <Background color='#ccc' variant={BackgroundVariant.Dots} />
        </>
      }
    </ReactFlow>
  )
}
