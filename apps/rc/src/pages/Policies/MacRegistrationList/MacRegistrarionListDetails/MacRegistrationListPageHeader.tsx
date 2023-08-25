import { useIntl } from 'react-intl'

import { Button, PageHeader }    from '@acx-ui/components'
import { useGetMacRegListQuery } from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink, getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }        from '@acx-ui/user'

import MacRegistrationListTabs from './MacRegistrationListTabs'

function MacRegistrationListPageHeader () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const tablePath = getPolicyRoutePath(
    { type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.LIST })

  const macRegistrationListQuery = useGetMacRegListQuery({ params: { policyId } })

  return (
    <PageHeader
      title={macRegistrationListQuery.data?.name || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Network Control' }) },
        {
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        },
        { text: $t({ defaultMessage: 'MAC Registration Lists' }),
          link: tablePath
        }
      ]}
      extra={filterByAccess([
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
