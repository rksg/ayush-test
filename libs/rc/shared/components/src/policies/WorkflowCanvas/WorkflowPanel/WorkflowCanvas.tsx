import 'reactflow/dist/style.css' // Very important css must be imported!

import { useEffect } from 'react'

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
  useReactFlow
} from 'reactflow'

import { ActionType, WorkflowPanelMode } from '@acx-ui/rc/utils'

import {
  AupNode,
  DataPromptNode,
  DisplayMessageNode,
  DpskNode,
  MacRegistrationNode,
  StartNode
} from './WorkflowStepNode'



const nodeTypes: NodeTypes = {
  START: StartNode, // This is a special type for the starter node displaying
  [ActionType.AUP]: AupNode,
  [ActionType.DATA_PROMPT]: DataPromptNode,
  [ActionType.DISPLAY_MESSAGE]: DisplayMessageNode,
  [ActionType.DPSK]: DpskNode,
  [ActionType.MAC_REG]: MacRegistrationNode
}

interface WorkflowProps {
  mode?: WorkflowPanelMode,
  initialNodes?: Node[],
  initialEdges?: Edge[]
}

export default function WorkflowCanvas (props: WorkflowProps) {
  const { mode = WorkflowPanelMode.Default } = props
  const isDesignMode = mode === WorkflowPanelMode.Design
  const reactFlowInstance = useReactFlow()
  const { $t } = useIntl()
  const [nodes, setNodes, onNodesChange] = useNodesState(props?.initialNodes ?? [])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const onCustomNodesChange = (changes: NodeChange[]) => {
    onNodesChange(changes)

    // only trigger fitView at the first time and nodes changes
    if (changes.findIndex(c => c.type === 'dimensions') !== -1) {
      reactFlowInstance.fitView({ nodes: props.initialNodes })
    }
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
      nodesDraggable={false}
      nodesConnectable={false}
      minZoom={0.1}
      attributionPosition={'bottom-left'}
      elementsSelectable={isDesignMode}
      style={{ background: isDesignMode ? 'var(--acx-neutrals-15)' : '' }}
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
    </ReactFlow>
  )
}
