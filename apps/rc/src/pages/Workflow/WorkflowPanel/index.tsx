import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'
import {
  ConnectionLineType,
  Edge,
  MarkerType,
  Node,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useViewport,
  XYPosition
} from 'reactflow'


import { Card, Loader }                              from '@acx-ui/components'
import {
  useGetWorkflowActionDefinitionListQuery,
  useGetWorkflowStepsByIdQuery,
  useLazyGetWorkflowActionRequiredDefinitionsQuery
} from '@acx-ui/rc/services'
import {
  ActionType,
  findFirstStep,
  getInitialNodes,
  SplitOption,
  toStepMap,
  WorkflowStep
} from '@acx-ui/rc/utils'

import ActionLibraryDrawer from '../ActionLibraryDrawer/ActionLibraryDrawer'
import StepDrawer          from '../StepDrawer/StepDrawer'

import WorkflowCanvas                                  from './WorkflowCanvas'
import { useWorkflowContext, WorkflowContextProvider } from './WorkflowContextProvider'


interface WorkflowPanelProps {
  workflowId: string,
  isEditMode?: boolean
  height?: string,
  width?: string
}

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

  console.groupCollapsed('[Processing] - toReactflowData')
  const firstStep = findFirstStep(steps)
  const stepMap = toStepMap(steps, definitionMap)

  if (firstStep) {
    composeNext(firstStep.id, stepMap, nodes, edges, startX, startY)
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
  const { workflowId: serviceId } = props
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
    params: { serviceId, pageSize: '1000', page: '0', sort: 'id,ASC' }
  }, { skip: !serviceId })

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
    } = toReactflowData(stepsData?.content, defsMap)
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
          workflowId={serviceId}
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
