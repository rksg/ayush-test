import 'reactflow/dist/style.css' // Very important css must be imported!

import { useEffect, useState } from 'react'

import { Card }   from 'antd'
import {
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
import { ActionType, toReactFlowData } from '@acx-ui/rc/utils'

import ActionLibraryDrawer from '../ActionLibraryDrawer/ActionLibraryDrawer'
import StepDrawer          from '../StepDrawer/StepDrawer'

import WorkflowCanvas                                  from './WorkflowCanvas'
import { useWorkflowContext, WorkflowContextProvider } from './WorkflowContextProvider'


interface WorkflowPanelProps {
  workflowId: string,
  isEditMode?: boolean
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
  const { workflowId: policyId, isEditMode } = props
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
