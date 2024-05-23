import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import {
  NodeProps,
  useEdges,
  useNodes
} from 'reactflow'

import { ActionType, WorkflowActionDef }           from '@acx-ui/rc/utils'


interface ActionDrawerState {
  visible: boolean,
  onOpen: (node?: NodeProps) => void,
  onClose: () => void
}

interface StepDrawerState {
  visible: boolean,
  isEdit: boolean,
  selectedActionDef?: WorkflowActionDef,
  onOpen: (isEdit: boolean, definitionId: string, actionType: ActionType) => void,
//   onOpenEditMode: () => void,
  onClose: () => void
}

interface WorkflowContextProps {
  actionDefMap: Map<string, ActionType>,
  setActionDefMap: (defMap: Map<string, ActionType>) => void,

  stepDrawerState: StepDrawerState,
  actionDrawerState: ActionDrawerState,

  nodeState: {
      interactedNode?: NodeProps,
      setInteractedNode: (node?: NodeProps) => void,
      existingDependencies: Set<ActionType>
  }
}

// TODO: Move the ContextProvider to another file for more clearly
const WorkflowContext = createContext<WorkflowContextProps>({} as WorkflowContextProps)
export const useWorkflowContext = () => useContext(WorkflowContext)

export const WorkflowContextProvider = (props: { children: ReactNode }) => {
  // Which Step Node is selecting for now
  const [interactedNode, setInteractedNode] = useState<NodeProps | undefined>()

  const [actionDrawerVisible, setActionDrawerVisible] = useState(false)
  const [existingDependencies, setExistingDependencies] = useState<Set<ActionType>>(new Set())

  const [stepDrawerVisible, setStepDrawerVisible] = useState(false)
  const [stepDrawerEditMode, setStepDrawerEditMode] = useState(false)
  const [stepDrawerActionDef, setStepDrawerActionDef] = useState<WorkflowActionDef | undefined>()

  const [selectedActionId, setSelectedActionId] = useState<string | undefined>()

  const [definitionMap, setDefinitionMap] = useState<Map<string, ActionType>>(new Map())


  const nodes = useNodes()
  const edges = useEdges()

  useEffect(() => {
    const findDependencies = (startId: string, dependencies: Set<ActionType>): Set<ActionType> => {
      console.log('1. Current State : Node = ', nodes, ' and \nEdge = ', edges)

      const node = nodes.find(node => node.id === startId)
      if (!node) return dependencies

      console.log(`2. Found Node(${node.id}) with ActionType = ${node.type}`)
      dependencies.add(node.type as ActionType)

      const priorEdge = edges.find(edge => edge.target === node.id)
      if (!priorEdge) return dependencies

      console.log(`3. Found prior Node(${priorEdge.source})`)

      return findDependencies(priorEdge.source, dependencies)
    }

    if (interactedNode !== undefined) {
      setExistingDependencies(findDependencies(interactedNode.id, new Set()))
    } else {
      setExistingDependencies(new Set())
    }
  }, [interactedNode])

  return <WorkflowContext.Provider
    value={{
      nodeState: {
        interactedNode: interactedNode,
        setInteractedNode: setInteractedNode,
        existingDependencies: existingDependencies
      },

      actionDefMap: definitionMap,
      setActionDefMap: setDefinitionMap,

      stepDrawerState: {
        visible: stepDrawerVisible,
        isEdit: stepDrawerEditMode,
        selectedActionDef: stepDrawerActionDef,
        onOpen: (isEdit, definitionId, actionType) => {
        //   setActionDrawerVisible(false)
          setStepDrawerVisible(true)
          setStepDrawerEditMode(isEdit)
          setStepDrawerActionDef({ id: definitionId, actionType })
        },
        // onOpenEditMode: (definitionId, actionType) => {
        //   setStepDrawerVisible(true)
        //   setStepDrawerEditMode(true)
        //   setStepDrawerActionDef({ id: definitionId, actionType })
        // },
        onClose: () => {
          console.log('step drawer onClose')
          setStepDrawerVisible(false)
          setStepDrawerEditMode(false)
          setActionDrawerVisible(false)
          setStepDrawerActionDef(undefined)
          setSelectedActionId(undefined)
        }
      },

      actionDrawerState: {
        visible: actionDrawerVisible,
        onOpen: (node?: NodeProps) => {
          console.log('OpenActionDrawer', node)
          setStepDrawerVisible(false)
          setActionDrawerVisible(true)
        },
        onClose: () => {
          console.log('CloseActionDrawer')
          setActionDrawerVisible(false)
        }
      }
    }}
  >
    {props.children}
  </WorkflowContext.Provider>
}
