import { useState, useEffect } from 'react'

import { Space }                  from 'antd'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, Card, GridCol, GridRow, Loader, SummaryCard } from '@acx-ui/components'
import { EnrollmentPortalLink, WorkflowPanel }                 from '@acx-ui/rc/components'
import {
  useGetWorkflowByIdQuery,
  useGetWorkflowStepsByIdQuery,
  useLazySearchWorkflowListQuery,
  useUpdateWorkflowMutation,
  useUpdateWorkflowIgnoreErrorsMutation
} from '@acx-ui/rc/services'
import { getPolicyRoutePath, getScopeKeyByPolicy, PolicyOperation, PolicyType, PublishStatus, Workflow, WorkflowPanelMode, WorkflowStepsEmptyCount } from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink }                                                                                                                 from '@acx-ui/react-router-dom'
import { hasPermission }                                                                                                                             from '@acx-ui/user'



export function WorkflowDetailOverview () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const workflowQuery = useGetWorkflowByIdQuery({ params: { id: policyId } })
  const [searchVersionedWorkflowById] = useLazySearchWorkflowListQuery()
  const [publishable, setPublishable] = useState(true)
  const [data, setData] = useState<Workflow>()
  const [updateWorkflow] = useUpdateWorkflowMutation()
  const tablePath = getPolicyRoutePath( { type: PolicyType.WORKFLOW, oper: PolicyOperation.LIST })
  const navigate = useNavigate()
  const linkToPolicies = useTenantLink(tablePath)
  const handlePublishWorkflow = async () => {
    const patchData = {
      publishedDetails: { status: 'PUBLISHED' as PublishStatus }
    }
    await updateWorkflow({ params: { id: policyId },payload: patchData as Workflow })
      .unwrap()
      // eslint-disable-next-line no-console
      .catch(e => console.log(e))
    navigate(linkToPolicies)
  }

  const { data: stepsData, ...stepsState } = useGetWorkflowStepsByIdQuery({
    params: { policyId, pageSize: '1', page: '0', sort: 'id,ASC', excludeContent: 'true' }
  })

  const [validateWorkflowRequest] = useUpdateWorkflowIgnoreErrorsMutation()
  const checkWorkflowPublishable = async function () {
    const patchData = {}

    Object.assign(patchData, { publishedDetails: { status: 'VALIDATE' as PublishStatus } } )
    await validateWorkflowRequest({ params: { id: policyId }, payload: patchData as Workflow })
      .unwrap()
      .then(()=>{
        setPublishable(true)
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log(e)
        setPublishable(false)
      })
  }


  useEffect(() => {
    if (workflowQuery.isLoading) return
    setData(workflowQuery.data)
    searchVersionedWorkflowById({ params: { id: policyId, excludeContent: 'false' } })
      .then(result => {
        if (result.data) {
          result.data.data.forEach(v => {
            if (v.publishedDetails?.status === 'PUBLISHED') {
              setData(v)
            }
          })
        }
      })
  }, [workflowQuery.data])

  useEffect(()=> {
    if (!stepsData || stepsState.isFetching) return
    if ((stepsData?.paging?.totalCount ?? 0 ) <= WorkflowStepsEmptyCount) {
      setPublishable(false)
    } else {
      checkWorkflowPublishable()
    }
  }, [stepsData, stepsState.isFetching])



  const workflowInfo = [
    {
      title: $t({ defaultMessage: 'Status' }),
      content: $t({ defaultMessage: ` {
        status, select,
        PUBLISHED {Published}
        other {Draft}
      }` }, {
        status: data?.publishedDetails?.status
      }),
      colSpan: 2
    },
    {
      title: $t({ defaultMessage: 'Onboarding Network' }),
      visible: false,
      colSpan: 4
    },
    {
      title: $t({ defaultMessage: 'URL' }),
      visible: data?.publishedDetails?.status === 'PUBLISHED',
      content: () => {
        const link = data?.links?.find(v => v.rel === 'enrollmentPortal')
        if (link) return <EnrollmentPortalLink url={link.href} />
        return undefined
      },
      colSpan: 5
    }
  ]

  return (
    <>
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <SummaryCard
            data={workflowInfo}
            isLoading={workflowQuery.isLoading}
            isFetching={workflowQuery.isFetching}
          />
        </GridCol>
      </GridRow>
      <GridRow style={{ minHeight: 600, marginTop: '20px' }}>
        <GridCol col={{ span: 24 }}>
          <Loader states={[{ ...stepsState }]}>
            {(stepsData?.paging?.totalCount ?? 0 ) <= WorkflowStepsEmptyCount ?
              <Card
                title={$t({ defaultMessage: 'Active Workflow Design' })}
              ><label style={{ textAlign: 'center', margin: 'auto' }}>
                  {$t({ defaultMessage: 'Onboarding Workflow not configured' })}
                </label>
              </Card> :
              <WorkflowPanel
                workflowId={data?.id!!}
                mode={WorkflowPanelMode.Default}
              />
            }
          </Loader>
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <Space direction='horizontal' style={{ marginTop: '10px' }}>
            {
              // eslint-disable-next-line max-len
              hasPermission({ scopes: getScopeKeyByPolicy(PolicyType.WORKFLOW, PolicyOperation.EDIT) }) &&
              <Button
                key='publish'
                type='primary'
                disabled={!publishable}
                scopeKey={getScopeKeyByPolicy(PolicyType.WORKFLOW, PolicyOperation.EDIT)}
                onClick={()=>handlePublishWorkflow()}
              >
                {$t({ defaultMessage: 'Publish' })}
              </Button>
            }
            <TenantLink
              to={getPolicyRoutePath({
                type: PolicyType.WORKFLOW,
                oper: PolicyOperation.LIST
              })}
            >
              <Button
                key='close'
                type='default'
              >
                {$t({ defaultMessage: 'Close' })}
              </Button>
            </TenantLink>
          </Space>
        </GridCol>
      </GridRow>
    </>
  )
}
