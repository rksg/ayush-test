import { useEffect, useState } from 'react'
import 'reactflow/dist/style.css' // Very important css must be imported!

import { Card }    from 'antd'
import { useIntl } from 'react-intl'
import {
  ConnectionLineType,
  Edge,
  Node,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useViewport,
  XYPosition
} from 'reactflow'


import { Loader }                                    from '@acx-ui/components'
import {
  useGetWorkflowActionDefinitionListQuery,
  useGetWorkflowStepsByIdQuery,
  useLazyGetWorkflowActionRequiredDefinitionsQuery
} from '@acx-ui/rc/services'
import { ActionType, findFirstStep, getInitialNodes, StepType, toStepMap, WorkflowStep } from '@acx-ui/rc/utils'

import ActionLibraryDrawer from '../ActionLibraryDrawer/ActionLibraryDrawer'
import StepDrawer          from '../StepDrawer/StepDrawer'

import WorkflowCanvas                                  from './WorkflowCanvas'
import { useWorkflowContext, WorkflowContextProvider } from './WorkflowContextProvider'


interface WorkflowPanelProps {
  workflowId: string,
  isEditMode?: boolean
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

  console.log('Compose Next step : ', step)

  const {
    id,
    nextStepId,
    enrollmentActionId, splitOptionId,
    type,
    actionType
  } = step
  const nodeType: ActionType = (actionType ?? 'START') as ActionType
  const nextStep = stepMap.get(nextStepId ?? '')

  console.log('Step :: ', nodeType, type, enrollmentActionId)

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

// TODO:
//  If I want to use the ContextProvider, I need to move these functions into Canvas component.
//  => It is fine actually, because of no others needed.
//  => I need the ActionDefinitions to determine the ActionType
function toReactFlowData (steps: WorkflowStep[], definitionMap: Map<string, ActionType>)
  : { nodes: Node[], edges: Edge[] } {
  const nodes: Node<WorkflowStep, ActionType>[] = []
  const edges: Edge[] = []
  const START_X = 100
  const START_Y = 0

  if (steps.length === 0) {
    return { nodes: getInitialNodes(START_X, START_Y), edges }
  }

  console.groupCollapsed('[Processing] - toReactFlowData')
  const firstStep = findFirstStep(steps)
  const stepMap = toStepMap(steps, definitionMap)

  if (firstStep) {
    composeNext(firstStep.id, stepMap, nodes, edges,
      START_X, START_Y, firstStep.type === StepType.Start)
  }

  console.groupEnd()

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
      console.groupCollapsed('[Processing] - useRequiredDependency gen()')
      for (const def of actionDefsData?.content) {
        if (def.dependencyType === 'NONE') {
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
      console.groupEnd()
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
  const { workflowId: policyId, isEditMode } = props
  const {
    nodeState,
    stepDrawerState,
    actionDrawerState
  } = useWorkflowContext()
  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges] = useEdgesState([])
  const { x, y, zoom } = useViewport()
  const [originalPosition, setOriginalPosition] = useState<XYPosition>()

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
    console.log('USE effect = ', inputNodes, inputEdges)
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
        isEditMode={isEditMode}
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

  return (
    <Card
      style={{ flexGrow: 1, width: '100%', height: '100%', display: 'grid' }}
    >
      <ReactFlowProvider>
        <WorkflowContextProvider>
          <WorkflowPanelWrapper
            {...props}
          />
        </WorkflowContextProvider>
      </ReactFlowProvider>
    </Card>
  )
}
