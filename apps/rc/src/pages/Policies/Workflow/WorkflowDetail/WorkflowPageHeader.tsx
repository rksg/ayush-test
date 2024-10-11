import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader }                                               from '@acx-ui/components'
import { WorkflowActionPreviewModal, WorkflowDesigner, WorkflowComparator } from '@acx-ui/rc/components'
import { useGetWorkflowByIdQuery, useLazySearchWorkflowsVersionListQuery }  from '@acx-ui/rc/services'
import {
  getPolicyListRoutePath,
  getPolicyRoutePath,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType,
  Workflow
} from '@acx-ui/rc/utils'
import { useParams }     from '@acx-ui/react-router-dom'
import { hasPermission } from '@acx-ui/user'


function WorkflowPageHeader () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const { data } = useGetWorkflowByIdQuery({ params: { id: policyId } })
  const [previewVisible, setPreviewVisible] = useState(false)
  const [searchVersionedWorkflows] = useLazySearchWorkflowsVersionListQuery()
  const [published, setPublished] = useState<Workflow>()
  const [isDesignerOpen, setIsDesignerOpen] = useState(false)
  const [isComparatorOpen, setIsComparatorOpen] = useState(false)
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

  useEffect(() => {
    if (!data) return
    fetchVersionHistory(data.id!!)
  }, [data])

  const openWorkflowDesigner = () => {
    setIsDesignerOpen(true)
  }

  const closeWorkflowDesigner = async () => {
    setIsDesignerOpen(false)
  }

  return (
    <>
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
    </>
  )
}

export default WorkflowPageHeader
