
import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader }          from '@acx-ui/components'
import { WorkflowActionPreviewModal } from '@acx-ui/rc/components'
import { useGetWorkflowByIdQuery }     from '@acx-ui/rc/services'
import {
  getPolicyListRoutePath,
  getPolicyDetailsLink,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath
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
      <WorkflowActionPreviewModal workflowId={policyId!} onClose={()=>setVisible(false)}/>}
    </>
  )
}

export default WorkflowPageHeader
