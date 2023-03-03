import { useIntl } from 'react-intl'

import { Button, PageHeader }    from '@acx-ui/components'
import { hasAccesses }           from '@acx-ui/rbac'
import { useGetMacRegListQuery } from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import MacRegistrationListTabs from './MacRegistrationListTabs'


function MacRegistrationListPageHeader () {
  const { $t } = useIntl()
  const { policyId } = useParams()

  const macRegistrationListQuery = useGetMacRegListQuery({ params: { policyId } })

  return (
    <PageHeader
      title={macRegistrationListQuery.data?.name || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Policies & Profiles > MAC Registration Lists' }),
          // eslint-disable-next-line max-len
          link: getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.LIST }) }
      ]}
      extra={hasAccesses([
        // eslint-disable-next-line max-len
        <TenantLink
          to={getPolicyDetailsLink({
            type: PolicyType.MAC_REGISTRATION_LIST,
            oper: PolicyOperation.EDIT,
            policyId: policyId!
          })}
        >
          <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
        </TenantLink>
      ])}
      footer={<MacRegistrationListTabs />}
    />
  )
}

export default MacRegistrationListPageHeader
