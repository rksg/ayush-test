
import { useEffect, useState } from 'react'

import { Space }                  from 'antd'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, Card, GridCol, GridRow, Loader, PageHeader, SummaryCard }                                                                                                   from '@acx-ui/components'
import { EnrollmentPortalLink, WorkflowActionPreviewModal, WorkflowComparator, WorkflowDesigner, WorkflowPanel }                                                             from '@acx-ui/rc/components'
import { useGetWorkflowByIdQuery, useGetWorkflowStepsByIdQuery, useLazySearchWorkflowsVersionListQuery, useUpdateWorkflowIgnoreErrorsMutation, useUpdateWorkflowMutation }   from '@acx-ui/rc/services'
import { getPolicyListRoutePath, getPolicyRoutePath, getScopeKeyByPolicy, PolicyOperation, PolicyType, PublishStatus, Workflow, WorkflowPanelMode, WorkflowStepsEmptyCount } from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink }                                                                                                                                         from '@acx-ui/react-router-dom'
import { hasPermission }                                                                                                                                                     from '@acx-ui/user'



export default function WorkflowDetails () {
  const { $t } = useIntl()
  const { policyId } = useParams()

  const [previewVisible, setPreviewVisible] = useState(false)
  const [published, setPublished] = useState<Workflow>()
  const [isDesignerOpen, setIsDesignerOpen] = useState(false)
  const [isComparatorOpen, setIsComparatorOpen] = useState(false)
  const [publishable, setPublishable] = useState(true)
  const [data, setData] = useState<Workflow>()

  const workflowQuery = useGetWorkflowByIdQuery({ params: { id: policyId } })
  const [searchVersionedWorkflows] = useLazySearchWorkflowsVersionListQuery()
  const [validateWorkflowRequest] = useUpdateWorkflowIgnoreErrorsMutation()
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


  useEffect(()=> {
    if (!stepsData || stepsState.isFetching) return
    if ((stepsData?.paging?.totalCount ?? 0 ) <= WorkflowStepsEmptyCount) {
      setPublishable(false)
    } else {
      checkWorkflowPublishable()
    }
  }, [stepsData, stepsState.isFetching])



  useEffect(() => {
    if (workflowQuery.isLoading || !workflowQuery.data) return
    setData(workflowQuery.data)
    fetchVersionHistory(workflowQuery.data.id!!)
  }, [workflowQuery.data, workflowQuery.isLoading])



  const openWorkflowDesigner = () => {
    setIsDesignerOpen(true)
  }

  const closeWorkflowDesigner = async () => {
    setIsDesignerOpen(false)
  }

  const workflowInfo = [
    {
      title: $t({ defaultMessage: 'Status' }),
      content: $t({ defaultMessage: ` {
        status, select,
        PUBLISHED {Published}
        other {Draft}
      }` }, {
        status: published?.publishedDetails?.status
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
      visible: published?.publishedDetails?.status === 'PUBLISHED',
      content: () => {
        const link = published?.links?.find(v => v.rel === 'enrollmentPortal')
        if (link) return <EnrollmentPortalLink url={link.href} />
        return undefined
      },
      colSpan: 5
    }
  ]

  return <>
    <PageHeader
      title={data?.name || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Network Control' }) },
        {
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        }, {
          text: $t({ defaultMessage: 'Workflows' }),
          link: getPolicyRoutePath({ type: PolicyType.WORKFLOW , oper: PolicyOperation.LIST })
        }
      ]}
      extra={
        [
          // eslint-disable-next-line max-len
          ...(hasPermission({ scopes: getScopeKeyByPolicy(PolicyType.WORKFLOW, PolicyOperation.EDIT) }) ?
            []: []),
          <Button
            key='configure'
            type='default'
            scopeKey={getScopeKeyByPolicy(PolicyType.WORKFLOW, PolicyOperation.EDIT)}
            onClick={()=> {
              setPreviewVisible(false)
              openWorkflowDesigner()
              setIsComparatorOpen(false)
            }}
          >
            {$t({ defaultMessage: 'Configure' })}
          </Button>,
          <Button
            type='default'
            onClick={() => {
              closeWorkflowDesigner()
              setPreviewVisible(true)
              setIsComparatorOpen(false)
            }}
          >
            {$t({ defaultMessage: 'Preview' })}
          </Button>,
          <Button
            type='default'
            disabled={!published}
            onClick={()=>{
              closeWorkflowDesigner()
              setPreviewVisible(false)
              setIsComparatorOpen(true)
            }}
          >
            {$t({ defaultMessage: 'Compare' })}
          </Button>]
      }
    />
    {previewVisible &&
      <WorkflowActionPreviewModal
        disablePortalDesign
        workflowId={published?.id ?? data?.id!!}
        onClose={()=>setPreviewVisible(false)}/>}
    {(isDesignerOpen ) &&
        <WorkflowDesigner
          workflowId={policyId!}
          onClose={closeWorkflowDesigner}
        />
    }
    {
      isComparatorOpen &&
        <WorkflowComparator
          draftWorkflowId={policyId!}
          publishedWorkflowId={published?.id ?? policyId!}
          onClose={()=>{setIsComparatorOpen(false)}}/>
    }
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
}