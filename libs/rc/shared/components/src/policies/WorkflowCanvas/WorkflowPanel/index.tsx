import 'reactflow/dist/style.css' // Very important css must be imported!

import { useEffect, useState } from 'react'

import {
  ConnectionLineType,
  Edge,
  Node,
  ReactFlowProvider,
  useEdgesState,
  useNodesState
} from 'reactflow'


import { Loader }                                    from '@acx-ui/components'
import {
  useGetWorkflowActionDefinitionListQuery,
  useGetWorkflowStepsByIdQuery,
  useLazyGetWorkflowActionRequiredDefinitionsQuery
} from '@acx-ui/rc/services'
import { ActionType, findFirstStep, getInitialNodes, StepType, toStepMap, WorkflowStep } from '@acx-ui/rc/utils'

import ActionLibraryDrawer from '../ActionLibraryDrawer'
import StepDrawer          from '../StepDrawer/StepDrawer'

import * as UI                                         from './styledComponents'
import WorkflowCanvas                                  from './WorkflowCanvas'
import { useWorkflowContext, WorkflowContextProvider } from './WorkflowContextProvider'

export enum PanelType {
  Default = 'default',
  NoCard = 'noCard'
}

export enum PanelMode {
  Default = 'default',
  Edit = 'edit',
  View = 'view'
}

interface WorkflowPanelProps {
  workflowId: string,
  mode?: PanelMode,
  type?: PanelType
}

const composeNext = (
  stepId: string, stepMap: Map<string, WorkflowStep>,
  nodes: Node<WorkflowStep, ActionType>[], edges: Edge[],
  currentX: number, currentY: number,
  isStart?: boolean
) => {
  const SPACE_OF_NODES = 110
  const step = stepMap.get(stepId)

  if (!step) return

  const {
    id,
    nextStepId,
    type,
    actionType
  } = step
  const nodeType: ActionType = (actionType ?? 'START') as ActionType
  const nextStep = stepMap.get(nextStepId ?? '')

  // console.log('Step :: ', nodeType, type, enrollmentActionId)

  nodes.push({
    id,
    type: nodeType,
    position: { x: currentX, y: currentY },
    data: {
      ...step,
      isStart,
      isEnd: nextStep?.type === StepType.End
    },

    hidden: type === StepType.End || (type === StepType.Start && stepMap.size !== 2),
    deletable: false
  })

  if (nextStepId) {
    edges.push({
      id: `${id} -- ${nextStepId}`,
      source: id,
      target: nextStepId,
      type: ConnectionLineType.Step,
      style: { stroke: 'var(--acx-primary-black)' },

      deletable: false
    })

    composeNext(nextStepId, stepMap, nodes, edges,
      currentX, currentY + SPACE_OF_NODES, type === StepType.Start)
  }
}

function toReactFlowData (steps: WorkflowStep[], definitionMap: Map<string, ActionType>)
  : { nodes: Node[], edges: Edge[] } {
  const nodes: Node<WorkflowStep, ActionType>[] = []
  const edges: Edge[] = []
  const START_X = 100
  const START_Y = 0

  if (steps.length === 0) {
    return { nodes: getInitialNodes(START_X, START_Y), edges }
  }

  const firstStep = findFirstStep(steps)
  const stepMap = toStepMap(steps, definitionMap)

  if (firstStep) {
    composeNext(firstStep.id, stepMap, nodes, edges,
      START_X, START_Y, firstStep.type === StepType.Start)
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
        if (def.dependencyType === 'NONE') {
          requiredDependency[def.actionType] = {
            type: def.dependencyType,
            required: new Set()
          }
        } else {
          await getRequiredDefinitionByIdQuery({
            params: { definitionId: def.id }
          })
            .then(result => {
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
  const { workflowId: policyId, mode } = props
  const {
    nodeState,
    stepDrawerState,
    actionDrawerState
  } = useWorkflowContext()
  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges] = useEdgesState([])

  const requiredDependency = useRequiredDependency()
  // console.log('const requiredDependency = useRequiredDependency()', requiredDependency)

  const { data: stepsData, ...stepQuery } = useGetWorkflowStepsByIdQuery({
    params: { policyId, pageSize: '1000', page: '0', sort: 'id,ASC' }
  }, { skip: !policyId })

  const { data: actionDefsData, ...defQuery } = useGetWorkflowActionDefinitionListQuery({
    params: { pageSize: '1000', page: '0', sort: 'name,asc' }
  })

  useEffect(() => {
    if (!actionDefsData || !stepsData ) return

    const defsMap = actionDefsData?.content
      ?.reduce((map, def) => map.set(def.id, def.actionType), new Map())

    const {
      nodes: inputNodes,
      edges: inputEdges
    } = toReactFlowData(stepsData?.content, defsMap)
    setNodes(inputNodes)
    setEdges(inputEdges)
  }, [stepsData, actionDefsData])

  const onClickAction = (definitionId: string, type: ActionType) => {
    stepDrawerState.onOpen(false, definitionId, type)
  }

  return (
    <Loader states={[
      stepQuery,
      defQuery
    ]}>
      <WorkflowCanvas
        mode={mode}
        initialNodes={nodes}
        initialEdges={edges}
      />

      {
        actionDrawerState.visible &&
        <ActionLibraryDrawer
          visible={actionDrawerState.visible}
          onClose={actionDrawerState.onClose}
          onClickAction={onClickAction}
          existingActionTypes={nodeState.existingDependencies}
          relationshipMap={requiredDependency.requiredDependency}
        />
      }
      {
        (stepDrawerState.visible && stepDrawerState?.selectedActionDef?.actionType) &&
        <StepDrawer
          isEdit={stepDrawerState.isEdit}
          workflowId={policyId}
          actionId={nodeState.interactedNode?.data?.enrollmentActionId}
          actionType={stepDrawerState.selectedActionDef.actionType}
          selectedActionDef={stepDrawerState.selectedActionDef}
          visible={stepDrawerState.visible}
          onClose={() => {
            stepDrawerState.onClose()
          }}
          priorNode={nodeState.interactedNode}
        />
      }
    </Loader>
  )
}

export function WorkflowPanel (props: WorkflowPanelProps) {
  const { type = PanelType.Default, ...rest } = props
  const content = <ReactFlowProvider>
    <WorkflowContextProvider>
      <WorkflowPanelWrapper
        {...rest}
      />
    </WorkflowContextProvider>
  </ReactFlowProvider>

  return type === PanelType.NoCard
    ? content
    : <UI.WorkflowCard>{content}</UI.WorkflowCard>
}
