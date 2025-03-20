
import { useEffect, useState } from 'react'

import {
  ReactFlowProvider,
  useEdgesState,
  useNodesState
} from 'reactflow'


import { Loader }                                     from '@acx-ui/components'
import { Features, useIsSplitOn }                     from '@acx-ui/feature-toggle'
import {
  useGetWorkflowActionDefinitionListQuery,
  useGetWorkflowStepsByIdQuery,
  useLazyGetWorkflowActionRequiredDefinitionsQuery
} from '@acx-ui/rc/services'
import { ActionType, toReactFlowData, WorkflowPanelMode } from '@acx-ui/rc/utils'

import ActionLibraryDrawer  from '../ActionLibraryDrawer'
import ActionsLibraryDrawer from '../ActionLibraryDrawer/ActionsLibraryDrawer'
import StepDrawer           from '../StepDrawer/StepDrawer'

import * as UI                                         from './styledComponents'
import WorkflowCanvas                                  from './WorkflowCanvas'
import { useWorkflowContext, WorkflowContextProvider } from './WorkflowContextProvider'

export enum PanelType {
  Default = 'default',
  NoCard = 'noCard'
}

interface WorkflowPanelProps {
  workflowId: string,
  mode?: WorkflowPanelMode,
  type?: PanelType
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
    if (isLoading || !actionDefsData?.content) return
    const fetchAllRequiredDependencies = async () => {
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

    fetchAllRequiredDependencies().then(() => {
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

  const isWorkflowTemplateEnabled = useIsSplitOn(Features.WORKFLOW_TEMPLATE_TOGGLE)

  const { requiredDependency } = useRequiredDependency()

  const { data: stepsData, ...stepQuery } = useGetWorkflowStepsByIdQuery({
    params: { policyId, pageSize: '1000', page: '0', sort: 'id,ASC' }
  }, { skip: !policyId })


  useEffect(() => {
    if (!stepsData?.content ) return

    const {
      nodes: inputNodes,
      edges: inputEdges
    } = toReactFlowData(stepsData?.content, mode)
    setNodes(inputNodes)
    setEdges(inputEdges)
  }, [stepsData])

  const onClickAction = (type: ActionType) => {
    stepDrawerState.onOpen(false, type)
  }

  return (
    <Loader states={[
      stepQuery
    ]}>
      <WorkflowCanvas
        mode={mode}
        initialNodes={nodes}
        initialEdges={edges}
      />

      {
        actionDrawerState.visible && (
          !isWorkflowTemplateEnabled ?
            <ActionLibraryDrawer
              visible={actionDrawerState.visible}
              onClose={actionDrawerState.onClose}
              onClickAction={onClickAction}
              existingActionTypes={nodeState.existingDependencies}
              relationshipMap={requiredDependency}
            /> :
            <ActionsLibraryDrawer
              visible={actionDrawerState.visible}
              onClickAction={onClickAction}
              onClose={actionDrawerState.onClose}
              existingActionTypes={nodeState.existingDependencies}
              relationshipMap={requiredDependency}
              workflowId={policyId}
              priorNode={nodeState.interactedNode}
            />
        )
      }
      {
        (stepDrawerState.visible && stepDrawerState?.selectedActionType) &&
        <StepDrawer
          isEdit={stepDrawerState.isEdit}
          workflowId={policyId}
          actionId={nodeState.interactedNode?.data?.enrollmentActionId}
          actionType={stepDrawerState.selectedActionType}
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
    <WorkflowContextProvider workflowId={props.workflowId}>
      <WorkflowPanelWrapper
        {...rest}
      />
    </WorkflowContextProvider>
  </ReactFlowProvider>

  return type === PanelType.NoCard
    ? content
    : <UI.WorkflowCard>{content}</UI.WorkflowCard>
}
