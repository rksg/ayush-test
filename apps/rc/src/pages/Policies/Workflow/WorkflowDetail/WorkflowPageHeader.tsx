
import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader }                                              from '@acx-ui/components'
import { WorkflowActionPreviewModal }                                      from '@acx-ui/rc/components'
import { useGetWorkflowByIdQuery, useLazySearchWorkflowsVersionListQuery } from '@acx-ui/rc/services'
import {
  getPolicyListRoutePath,
  getPolicyDetailsLink,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath,
  Workflow
} from '@acx-ui/rc/utils'
import {
  useParams,
  TenantLink
} from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'


function WorkflowPageHeader () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const { data } = useGetWorkflowByIdQuery({ params: { id: policyId } })
  const [visible, setVisible] = useState(false)
  const [searchVersionedWorkflows] = useLazySearchWorkflowsVersionListQuery()
  const [published, setPublished] = useState<Workflow>()

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
          filterByAccess([
            <Button type='default' onClick={()=>setVisible(true)}>
              {$t({ defaultMessage: 'Preview' })}</Button>,
            <TenantLink
              to={getPolicyDetailsLink({
                type: PolicyType.WORKFLOW,
                oper: PolicyOperation.EDIT,
                policyId: policyId!
              })}
            >
              <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
            </TenantLink>
          ])}
      />
      {visible &&
      <WorkflowActionPreviewModal
        workflowId={published?.id ?? data?.id!!}
        onClose={()=>setVisible(false)}/>}
    </>
  )
}

export default WorkflowPageHeader
