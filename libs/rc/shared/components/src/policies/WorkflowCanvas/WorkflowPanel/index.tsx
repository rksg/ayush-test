
import { useEffect, useState } from 'react'

import { Col, Divider, Row, Typography } from 'antd'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'
import {
  ReactFlowProvider,
  useEdgesState,
  useNodesState
} from 'reactflow'


import { Loader, Tooltip }                 from '@acx-ui/components'
import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }       from '@acx-ui/formatter'
import {
  useGetWorkflowActionDefinitionListQuery,
  useGetWorkflowByIdQuery,
  useGetWorkflowStepsByIdQuery,
  useLazyGetWorkflowActionRequiredDefinitionsQuery,
  useLazySearchWorkflowsVersionListQuery
} from '@acx-ui/rc/services'
import { ActionType, StatusReason, toReactFlowData, Workflow, WorkflowPanelMode } from '@acx-ui/rc/utils'
import { noDataDisplay }                                                          from '@acx-ui/utils'

import ActionLibraryDrawer  from '../ActionLibraryDrawer'
import ActionsLibraryDrawer from '../ActionLibraryDrawer/ActionsLibraryDrawer'
import StepDrawer           from '../StepDrawer/StepDrawer'

import { PublishedTooltipContent }                     from './PublishedTooltipContent'
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
  const { $t } = useIntl()
  const { policyId } = useParams()
  const workflowValidationEnhancementFFToggle =
    useIsSplitOn(Features.WORKFLOW_ENHANCED_VALIDATION_ENABLED)
  const workflowQuery = useGetWorkflowByIdQuery({ params: { id: policyId } })
  const [searchVersionedWorkflows] = useLazySearchWorkflowsVersionListQuery()
  const { type = PanelType.Default, ...rest } = props
  const [published, setPublished] = useState<Workflow>()
  const [publishReadiness, setPublishReadiness] = useState<number>(0)
  const [statusReason, setStatusReason] = useState<StatusReason[]>([])

  useEffect(() => {
    if (workflowQuery.isLoading || !workflowQuery.data) return
    fetchVersionHistory(workflowQuery.data.id!!)
    setPublishReadiness(workflowQuery.data?.publishReadiness || 0)
    setStatusReason(workflowQuery.data?.statusReasons || [])
  }, [workflowQuery.data, workflowQuery.isLoading])


  const fetchVersionHistory = async (id: string) => {
    try {
      const result = await searchVersionedWorkflows(
        { params: { excludeContent: 'false' }, payload: [id] }
      ).unwrap()
      if (result) {
        result.forEach(v => {
          if (v.publishedDetails?.status === 'PUBLISHED') {
            setPublished(v)
          }
        })
      }
    } catch (e) {}
  }

  const content = <ReactFlowProvider>
    <WorkflowContextProvider workflowId={props.workflowId}>
      <WorkflowPanelWrapper
        {...rest}
      />
    </WorkflowContextProvider>
  </ReactFlowProvider>

  return type === PanelType.NoCard
    ? <>{ workflowValidationEnhancementFFToggle && <div style={{
      width: '100%',
      padding: '7px 20px',
      background: 'var(--acx-neutrals-20)'
    }}>
      <Row gutter={16} style={{ alignItems: 'center' }}>
        <Col span={2}>
          <Typography.Title
            level={4}
            style={{
              margin: '0px'
            }}
            type='secondary'> { $t({ defaultMessage: 'Sandbox' }) }
            <Divider
              style={{
                borderLeft: '1px solid var(--acx-neutrals-40) !important'
              }}
              type='vertical' />
          </Typography.Title>
        </Col>
        <Col span={16}>
          { $t({ defaultMessage: 'Last modified {modifiedDate}' },{
            modifiedDate: published?.publishedDetails?.publishedDate
              ? formatter(
                DateFormatEnum.DateTimeFormatWith12HourSystem)(
                published?.publishedDetails?.publishedDate)
              : noDataDisplay
          }) }
        </Col>
        <Col span={6}>
          <div style={{
            display: 'flex',
            justifyContent: 'right',
            alignItems: 'center'
          }}>
            <UI.PublishReadinessProgress progress={publishReadiness}>
              <div className='progress-bar'
                style={{
                  width: publishReadiness + '%'
                }}>
                <span className='status-label'>
                  { $t({ defaultMessage: 'Publish Readiness' }) }
                </span>
              </div>
            </UI.PublishReadinessProgress>
            <div style={{
              display: 'inline-flex',
              width: '20px',
              height: '20px',
              margin: '0px 8px'
            }}> {
                !!statusReason.length
            && <Tooltip.Info
              placement='bottomLeft'
              showArrow={false}
              overlayStyle={{
                width: '395px'
              }}
              isFilled
              title={<PublishedTooltipContent reasons={
            statusReason as StatusReason[]
              } />}/>} </div>
          </div>
        </Col>
      </Row>
    </div> }{content}</>
    : <UI.WorkflowCard>{content}</UI.WorkflowCard>
}
