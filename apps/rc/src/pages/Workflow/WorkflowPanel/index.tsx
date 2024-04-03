import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'
import {
  ConnectionLineType,
  Edge,
  MarkerType,
  Node,
  NodeProps,
  ReactFlowProvider,
  useEdges,
  useEdgesState,
  useNodes,
  useNodesState,
  useViewport,
  XYPosition
} from 'reactflow'


import { Card, Loader, Modal, ModalType }            from '@acx-ui/components'
import {
  useGetWorkflowActionDefinitionListQuery,
  useGetWorkflowStepsByIdQuery,
  useLazyGetWorkflowActionRequiredDefinitionsQuery
} from '@acx-ui/rc/services'
import {
  ActionType,
  ActionTypeTitle,
  findFirstStep,
  getInitialNodes,
  SplitOption,
  toStepMap, WorkflowActionDef,
  WorkflowStep
} from '@acx-ui/rc/utils'

import ActionsLibraryDrawer from '../ActionLibraryDrawer/ActionsLibraryDrawer'
import AddSplitOptionDrawer from '../AddSplitOptionDrawer'
import StepDrawer           from '../StepDrawer/StepDrawer'
import ActionGenericForm    from '../WorkflowActionForm/ActionGenericForm'

import WorkflowCanvas from './WorkflowCanvas'


interface WorkflowPanelProps {
  workflowId: string,
  isEditMode?: boolean
  height?: string,
  width?: string
}

interface ActionDrawerState {
  visible: boolean,
  onOpen: (node?: NodeProps) => void,
  onClose: () => void
}

interface StepDrawerState {
  visible: boolean,
  selectedActionDef?: WorkflowActionDef,
  onOpen: (definitionId: string, actionType: ActionType) => void,
  onClose: () => void
}

interface EditActionModalState {
  visible: boolean,
  onOpen: (actionType: ActionType, actionId: string) => void,
  onClose: () => void
  actionType: ActionType,
  selectedActionId?: string,
}

interface SplitOptionDrawerState {
  visible: boolean,
  onOpen: () => void,
  onClose: () => void
}

interface WorkflowContextProps {
  actionDefMap: Map<string, ActionType>,
  setActionDefMap: (defMap: Map<string, ActionType>) => void,

  stepDrawerState: StepDrawerState,
  actionDrawerState: ActionDrawerState,
  actionModalState: EditActionModalState,
  splitOptionDrawerState: SplitOptionDrawerState,

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
  const [interactedNode, setInteractedNode] = useState<NodeProps | undefined>()

  const [actionDrawerVisible, setActionDrawerVisible] = useState(false)
  const [existingDependencies, setExistingDependencies] = useState<Set<ActionType>>(new Set())

  const [stepDrawerVisible, setStepDrawerVisible] = useState(false)
  const [stepDrawerActionDef, setStepDrawerActionDef] = useState<WorkflowActionDef | undefined>()

  const [actionModalVisible, setActionModalVisible] = useState(false)
  const [selectedActionId, setSelectedActionId] = useState<string | undefined>()
  const [modalActionType, setModalActionType] = useState<ActionType>(ActionType.AUP)

  const [splitOptionDrawerVisible, setSplitOptionDrawerVisible] = useState(false)

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

      splitOptionDrawerState: {
        visible: splitOptionDrawerVisible,
        onOpen: () => {
          setSplitOptionDrawerVisible(true)
          setActionDrawerVisible(false)
        },
        onClose: () => {
          setSplitOptionDrawerVisible(false)
        }
      },

      stepDrawerState: {
        visible: stepDrawerVisible,
        selectedActionDef: stepDrawerActionDef,
        onOpen: (definitionId, actionType) => {
          setStepDrawerVisible(true)
          setStepDrawerActionDef({ id: definitionId, actionType })
        },
        onClose: () => {
          setStepDrawerVisible(false)
          setActionDrawerVisible(false)
          setStepDrawerActionDef(undefined)
        }
      },

      actionDrawerState: {
        visible: actionDrawerVisible,
        onOpen: (node?: NodeProps) => {
          console.log('OpenActionDrawer', node)
          setActionDrawerVisible(true)
          setSplitOptionDrawerVisible(false)
        },
        onClose: () => {
          console.log('CloseActionDrawer')
          setActionDrawerVisible(false)
        }
      },

      actionModalState: {
        visible: actionModalVisible,
        selectedActionId,
        actionType: modalActionType,
        onOpen: (actionType, actionId) => {
          setSelectedActionId(actionId)
          setModalActionType(actionType)
          setActionModalVisible(true)
        },
        onClose: () => {
          setActionModalVisible(false)
        }
      }
    }}
  >
    {props.children}
  </WorkflowContext.Provider>
}

const mockWorkflowSteps: WorkflowStep[] = [
  {
    id: '03e4448c-9bfa-4dee-aa42-f55e9746c196',
    nextStepId: 'e4f3e1ad-b65a-46e3-b945-a8e5989c8a92',
    enrollmentActionId: 'ae753f73-c6fd-4579-a352-95de84ec6618',
    actionDefinitionId: 'd1342c9e-c379-4fe6-9a18-8eec67e34eb6',
    actionType: 'AUP'
  },
  {
    id: 'dccb59d2-19f7-4d57-8188-ab0b1b7256f0',
    priorStepId: 'e4f3e1ad-b65a-46e3-b945-a8e5989c8a92',
    nextStepId: 'e31e756b-8358-4182-81d3-c1054e0c861f',
    enrollmentActionId: '83de20f7-bf2e-4b81-b447-ade4c913b00d',
    actionDefinitionId: 'd1342c9e-c379-4fe6-9a18-8eec67e34eb6',
    actionType: 'AUP'
  },
  // @ts-ignore
  {
    id: 'e31e756b-8358-4182-81d3-c1054e0c861f',
    priorStepId: 'dccb59d2-19f7-4d57-8188-ab0b1b7256f0',
    actionDefinitionId: 'fe3c0896-8dbc-4da8-9271-96b196319283',
    actionType: 'USER_SELECTION_SPLIT',
    splitOptionsList: [
      {
        id: '5aaf42de-9580-4412-b596-230109cf7ce7',
        optionName: 'FirstOption',
        enrollmentActionId: 'fe3c0896-8dbc-4da8-9271-96b196319283',
        actionDefinitionId: 'fe3c0896-8dbc-4da8-9271-96b196319283',
        actionType: 'USER_SELECTION_SPLIT',
        // FIXME: Make sure the 'nextStepId' would include in SplitOption
        nextStepId: '371ae19d-e898-4de6-9dec-1b5290680032'
      },
      {
        id: 'c6f39470-deb5-43ee-b204-662ee9ddb5d6',
        optionName: 'SecondOption',
        enrollmentActionId: 'fe3c0896-8dbc-4da8-9271-96b196319283',
        actionDefinitionId: 'fe3c0896-8dbc-4da8-9271-96b196319283',
        actionType: 'USER_SELECTION_SPLIT'
      }
    ]
  },
  {
    id: '371ae19d-e898-4de6-9dec-1b5290680032',
    splitOptionId: '5aaf42de-9580-4412-b596-230109cf7ce7',
    enrollmentActionId: 'ae753f73-c6fd-4579-a352-95de84ec6618',
    actionDefinitionId: 'd1342c9e-c379-4fe6-9a18-8eec67e34eb6',
    actionType: 'AUP'
  },
  {
    id: 'e4f3e1ad-b65a-46e3-b945-a8e5989c8a92',
    priorStepId: '03e4448c-9bfa-4dee-aa42-f55e9746c196',
    nextStepId: 'dccb59d2-19f7-4d57-8188-ab0b1b7256f0',
    enrollmentActionId: 'fff1347a-8fe1-480f-b89c-de67af93c4ee',
    actionDefinitionId: '580584f1-a3f4-407f-b3ac-a62addea530e',
    actionType: 'DATA_PROMPT'
  }
]

const composeSplitOptions = (
  splitStep: WorkflowStep,
  options: SplitOption[],
  nodes: Node[], edges: Edge[],
  currentX: number, currentY: number
) => {
  const splitCount = options.length

  options.forEach((option, index) => {
    const { optionName, enrollmentActionId } = option
    nodes.push({
      id: option.id,
      position: { x: currentX + 200*index, y: currentY },
      data: {
        label: enrollmentActionId,
        enrollmentActionId,
        splitStepId: splitStep.id,
        optionName
      },
      type: option.actionType
    })

    edges.push({
      id: `${splitStep.id} -- ${option.id}`,
      source: splitStep.id,
      target: option.id,
      // FIXME: if there are two/more sources, it need to specific the `sourceHandler`
      sourceHandle: '0',
      type: ConnectionLineType.Step,
      markerEnd: {
        type: MarkerType.Arrow
      }
    })
  })
}

const composeNext = (
  stepId: string, stepMap: Map<string, WorkflowStep>,
  nodes: Node[], edges: Edge[],
  currentX: number, currentY: number
) => {
  const step = stepMap.get(stepId)
  if (!step) return

  console.log('Compose Next step : ', step)

  const { id, nextStepId, enrollmentActionId, splitOptionId, type } = step
  const actionType: ActionType = (type === ActionType.USER_SELECTION_SPLIT && !enrollmentActionId)
    ? ActionType.USER_SELECTION_SPLIT : type as ActionType

  console.log('Step :: ', actionType, type, enrollmentActionId)

  nodes.push({
    id,
    type: actionType,
    position: { x: currentX, y: currentY },
    data: {
      label: enrollmentActionId,
      enrollmentActionId
    }
  })

  if (actionType === ActionType.USER_SELECTION_SPLIT && step.splitOptionsList) {
    console.log('[SplitStep] :: ', step)
    composeSplitOptions(step, step.splitOptionsList, nodes, edges, currentX, currentY + 100)
    step.splitOptionsList.forEach((option, index) => {
      if (option.nextStepId) {
        edges.push({
          id: `${option.id} -- ${option.nextStepId}`,
          source: option.id,
          target: option.nextStepId,
          // FIXME: if there are two/more sources, it need to specific the `sourceHandler`
          sourceHandle: '0',
          type: ConnectionLineType.Step,
          markerEnd: {
            type: MarkerType.Arrow
          }
        })
        composeNext(option.nextStepId, stepMap, nodes, edges, currentX + 200*index, currentY + 200)
      }
    })
  }

  if (nextStepId) {
    edges.push({
      id: `${id} -- ${nextStepId}`,
      source: id,
      target: nextStepId,
      // FIXME: if there are two/more sources, it need to specific the `sourceHandler`
      sourceHandle: '0',
      type: ConnectionLineType.Step,
      markerEnd: {
        type: MarkerType.Arrow
      }
    })

    composeNext(nextStepId, stepMap, nodes, edges, currentX, currentY + 100)
  }
}

// TODO:
//  If I want to use the ContextProvider, I need to move these functions into Canvas component.
//  => It is fine actually, because of no others needed.
//  => I need the ActionDefinitions to determine the ActionType
function toReactflowData (steps: WorkflowStep[], definitionMap: Map<string, ActionType>)
  : { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const startX = 100
  const startY = 0

  if (steps.length === 0) {
    return { nodes: getInitialNodes(startX, startY), edges }
  }

  const firstStep = findFirstStep(steps)
  const stepMap = toStepMap(steps, definitionMap)

  if (firstStep) {
    composeNext(firstStep.id, stepMap, nodes, edges, startX, startY)
  }

  return { nodes, edges }
}

export interface RequiredDependency {
  type: 'NONE' | 'ONE_OF' | 'ALL',
  required: Set<ActionType>
}

const useRequiredDependency = () => {
  const { data: actionDefsData, isLoading } = useGetWorkflowActionDefinitionListQuery({
    params: { pageSize: '1000', page: '0', sort: 'name,asc' }
  })
  const [getRequiredDefinitionByIdQuery] = useLazyGetWorkflowActionRequiredDefinitionsQuery()
  const requiredDependency: Partial<Record<ActionType, RequiredDependency>> = { }
  const [data, setData] = useState<Partial<Record<ActionType, RequiredDependency>>>({})

  useEffect(() => {
    if (isLoading || !actionDefsData) return
    const gen = async () => {
      for (const def of actionDefsData?.content) {
        if (def.dependencyType === 'NONE' && def.actionType !== ActionType.USER_SELECTION_SPLIT) {
          console.log('NONE - ', def)
          requiredDependency[def.actionType] = {
            type: def.dependencyType,
            required: new Set()
          }
        } else {
          console.log('Other - ', def)
          await getRequiredDefinitionByIdQuery({
            params: { definitionId: def.id }
          })
            .then(result => {
              console.log('Required = ', result)
              requiredDependency[def.actionType] = {
                type: def.dependencyType ?? 'NONE',
                required: result?.data?.content?.reduce((set, def) =>
                  set.add(def?.actionType)
                , new Set<ActionType>()) ?? new Set()
              }
            })
        }
      }
    }

    gen().then(() => {
      setData(requiredDependency)
    })

  }, [actionDefsData, isLoading])

  return {
    requiredDependency: data,
    isLoading: isLoading
  }
}


function WorkflowPanelWrapper (props: WorkflowPanelProps) {
  const { $t } = useIntl()
  const { workflowId: serviceId } = props
  const {
    nodeState,
    stepDrawerState, splitOptionDrawerState,
    actionDrawerState, actionModalState
  } = useWorkflowContext()
  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges] = useEdgesState([])
  const { x, y, zoom } = useViewport()
  const [originalPosition, setOriginalPosition] = useState<XYPosition>()

  const requiredDependency = useRequiredDependency()
  console.log('const requiredDependency = useRequiredDependency()', requiredDependency)

  const { data: stepsData, ...stepQuery } = useGetWorkflowStepsByIdQuery({
    params: { serviceId, pageSize: '1000', page: '0', sort: 'id,ASC' }
  }, { skip: !serviceId })

  const { data: actionDefsData, ...defQuery } = useGetWorkflowActionDefinitionListQuery({
    params: { pageSize: '1000', page: '0', sort: 'name,asc' }
  })

  useEffect(() => {
    if (!actionDefsData || !stepsData ) return

    const defsMap = actionDefsData?.content
      ?.reduce((map, def) => map.set(def.id, def.actionType), new Map())
    console.log(`(${serviceId})Steps List = ${stepsData?.content}`)
    const {
      nodes: inputNodes,
      edges: inputEdges
    } = toReactflowData(stepsData?.content, defsMap)
    setNodes(inputNodes)
    setEdges(inputEdges)
    console.log('USE effect = ', inputNodes, inputEdges)
  }, [stepsData, actionDefsData])

  const onClickAction = (definitionId: string, type: ActionType) => {
    stepDrawerState.onOpen(definitionId, type)
  }

  return (
    <Loader states={[
      stepQuery,
      defQuery
    ]}>
      <WorkflowCanvas
        initialNodes={nodes}
        initialEdges={edges}
      />

      {
        actionDrawerState.visible &&
        <ActionsLibraryDrawer
          visible={actionDrawerState.visible}
          onClose={actionDrawerState.onClose}
          onClickAction={onClickAction}
          existingActionTypes={nodeState.existingDependencies}
          relationshipMap={requiredDependency.requiredDependency}
        />
      }
      {
        (stepDrawerState.visible && stepDrawerState.selectedActionDef) &&
        <StepDrawer
          workflowId={serviceId}
          actionType={stepDrawerState?.selectedActionDef.actionType}
          selectedActionDef={stepDrawerState.selectedActionDef}
          visible={stepDrawerState.visible}
          onClose={stepDrawerState.onClose}
          priorNode={nodeState.interactedNode}
        />
      }

      {
        (splitOptionDrawerState.visible && nodeState.interactedNode) &&
        <AddSplitOptionDrawer
          visible={true}
          workflowId={serviceId}
          stepId={nodeState.interactedNode.id}
          optionType={nodeState.interactedNode.type as ActionType}
          onClose={splitOptionDrawerState.onClose}
        />
      }

      {
        actionModalState.visible &&
        <Modal
          visible={true}
          destroyOnClose={true}
          title={$t({ defaultMessage: 'Edit' }) + ' '
            + $t(ActionTypeTitle[actionModalState.actionType])}
          type={ModalType.ModalStepsForm}
          width={800}
          children={
            <ActionGenericForm
              isEdit={true}
              actionId={actionModalState.selectedActionId}
              // FIXME: DEMO only support AUP, DataPrompt in BE
              actionType={actionModalState.actionType}
              modalCallback={() => {
                console.log('Outer Modal callback')
                actionModalState.onClose()
              }}
            />}
          onCancel={actionModalState.onClose}
        />
      }
    </Loader>
  )
}

export default function WorkflowPanel (props: WorkflowPanelProps) {
  const { width = '80vw', height = '80vh' } = props
  return (
    <Card>
      <ReactFlowProvider>
        <WorkflowContextProvider>
          {/* TODO: The height, width calculate by parent? or based on content size? */}
          <div style={{ width, height }}>
            <WorkflowPanelWrapper
              {...props}
            />
          </div>
        </WorkflowContextProvider>
      </ReactFlowProvider>
    </Card>
  )
}
