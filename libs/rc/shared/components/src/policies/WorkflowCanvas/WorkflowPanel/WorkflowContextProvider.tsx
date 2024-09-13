import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import {
  NodeProps,
  useEdges,
  useNodes
} from 'reactflow'

import { ActionType } from '@acx-ui/rc/utils'


interface ActionDrawerState {
  visible: boolean,
  onOpen: () => void,
  onClose: () => void
}

interface StepDrawerState {
  visible: boolean,
  isEdit: boolean,
  selectedActionType?: ActionType,
  onOpen: (isEdit: boolean, actionType: ActionType) => void,
  onClose: () => void
}

export interface WorkflowContextProps {
  workflowId: string,

  stepDrawerState: StepDrawerState,
  actionDrawerState: ActionDrawerState,

  nodeState: {
      interactedNode?: NodeProps,
      setInteractedNode: (node?: NodeProps) => void,
      existingDependencies: Set<ActionType>
  }
}

export const WorkflowContext = createContext<WorkflowContextProps>({} as WorkflowContextProps)
export const useWorkflowContext = () => useContext(WorkflowContext)

export const WorkflowContextProvider = (props: { workflowId: string, children: ReactNode }) => {
  // Which Step Node is selecting for now
  const [interactedNode, setInteractedNode] = useState<NodeProps | undefined>()

  const [actionDrawerVisible, setActionDrawerVisible] = useState(false)
  const [existingDependencies, setExistingDependencies] = useState<Set<ActionType>>(new Set())

  const [stepDrawerVisible, setStepDrawerVisible] = useState(false)
  const [stepDrawerEditMode, setStepDrawerEditMode] = useState(false)
  const [stepDrawerActionType, setStepDrawerActionType] = useState<ActionType | undefined>()


  const nodes = useNodes()
  const edges = useEdges()

  useEffect(() => {
    const findDependencies = (startId: string, dependencies: Set<ActionType>): Set<ActionType> => {

      const node = nodes.find(node => node.id === startId)
      if (!node) return dependencies

      dependencies.add(node.type as ActionType)

      const priorEdge = edges.find(edge => edge.target === node.id)
      if (!priorEdge) return dependencies

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
      workflowId: props.workflowId,
      nodeState: {
        interactedNode: interactedNode,
        setInteractedNode: setInteractedNode,
        existingDependencies: existingDependencies
      },

      stepDrawerState: {
        visible: stepDrawerVisible,
        isEdit: stepDrawerEditMode,
        selectedActionType: stepDrawerActionType,
        onOpen: (isEdit, actionType) => {
          setStepDrawerVisible(true)
          setStepDrawerEditMode(isEdit)
          setStepDrawerActionType(actionType)
        },
        onClose: () => {
          setStepDrawerVisible(false)
          setStepDrawerEditMode(false)
          setActionDrawerVisible(false)
          setStepDrawerActionType(undefined)
        }
      },

      actionDrawerState: {
        visible: actionDrawerVisible,
        onOpen: () => {
          setStepDrawerVisible(false)
          setActionDrawerVisible(true)
        },
        onClose: () => {
          setActionDrawerVisible(false)
        }
      }
    }}
  >
    {props.children}
  </WorkflowContext.Provider>
}
