import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import {
  Node,
  NodeProps
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
      setNodeMap: (nodeMap: Map<string, Node>) => void,
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
  const [nodeMap, setNodeMap] = useState<Map<string, Node>>(new Map())

  useEffect(() => {
    const findDependencies = (startId: string, dependencies: Set<ActionType>): Set<ActionType> => {
      const node = nodeMap.get(startId)
      if (!node) return dependencies

      dependencies.add(node.type as ActionType)

      const priorStepId = node.data.priorStepId
      if (!priorStepId) return dependencies

      return findDependencies(priorStepId, dependencies)
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
        // NOTE: set node map is only being updated when the steps change, so the position and
        // selection data won't be up to date. But that's ok given the current usage. if we update
        // the map more frequently it is likely to cause infinite loops on dragging nodes.
        setNodeMap: setNodeMap,
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
