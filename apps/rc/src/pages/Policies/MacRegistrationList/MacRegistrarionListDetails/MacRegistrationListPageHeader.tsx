import { useIntl } from 'react-intl'

import { Button, PageHeader }               from '@acx-ui/components'
import { useGetMacRegListQuery }            from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  usePolicyListBreadcrumb,
  PolicyOperation,
  PolicyType,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByPolicy, MacRegListUrlsInfo
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { getOpsApi }             from '@acx-ui/utils'

import MacRegistrationListTabs from './MacRegistrationListTabs'

function MacRegistrationListPageHeader () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const macRegistrationListQuery = useGetMacRegListQuery({ params: { policyId } })

  return (
    <PageHeader
      title={macRegistrationListQuery.data?.name || ''}
      breadcrumb={usePolicyListBreadcrumb(PolicyType.MAC_REGISTRATION_LIST)}
      extra={filterByAccessForServicePolicyMutation([
        <TenantLink
          to={getPolicyDetailsLink({
            type: PolicyType.MAC_REGISTRATION_LIST,
            oper: PolicyOperation.EDIT,
            policyId: policyId!
          })}
          scopeKey={getScopeKeyByPolicy(PolicyType.MAC_REGISTRATION_LIST, PolicyOperation.EDIT)}
          rbacOpsIds={[getOpsApi(MacRegListUrlsInfo.updateMacRegistrationPool)]}
        >
          <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
        </TenantLink>
      ])}
      footer={<MacRegistrationListTabs />}
    />
  )
}

export default MacRegistrationListPageHeader
