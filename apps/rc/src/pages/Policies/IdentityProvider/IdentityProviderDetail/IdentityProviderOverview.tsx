import { useIntl } from 'react-intl'

import { SummaryCard }       from '@acx-ui/components'
import { useAaaPolicyQuery } from '@acx-ui/rc/services'
import { IdentityProviderViewModel,
  PolicyOperation,
  PolicyType,
  getPolicyDetailsLink
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'


export function IdentityProviderOverview (props: { data: IdentityProviderViewModel }) {
  const { $t } = useIntl()
  const { data } = props
  const params = useParams()

  const { data: authRadiusData } = useAaaPolicyQuery({
    params: { ...params, policyId: data.authRadiusId }
  }, {
    skip: !data?.authRadiusId
  })

  const { data: accountingRadiusData } = useAaaPolicyQuery({
    params: { ...params, policyId: data.accountingRadiusId }
  }, {
    skip: !data?.accountingRadiusId
  })



  const identityProviderInfo = [
    {
      title: $t({ defaultMessage: 'NAI Realm' }),
      content: (
        data.naiRealms?.map((realm) => (
          <div>`${realm.name}`</div>
        ))
      )
    },
    {
      title: $t({ defaultMessage: 'PLMN' }),
      content: (data.plmns?.length || 0)
    },
    {
      title: $t({ defaultMessage: 'Roaming Consortium OI' }),
      content: (data.roamConsortiumOIs?.length)
    },
    {
      title: $t({ defaultMessage: 'Authentication Service' }),
      content: (
        (!data.authRadiusId)
          ? ''
          : (
            <TenantLink to={getPolicyDetailsLink({
              type: PolicyType.AAA,
              oper: PolicyOperation.DETAIL,
              policyId: data.authRadiusId
            })}>
              {authRadiusData?.name || ''}
            </TenantLink>
          )
      )
    },
    {
      title: $t({ defaultMessage: 'Accounting Service' }),
      content: (
        (!data.accountingRadiusId)
          ? 'Disabled'
          : (
            <TenantLink to={getPolicyDetailsLink({
              type: PolicyType.AAA,
              oper: PolicyOperation.DETAIL,
              policyId: data.accountingRadiusId })}>
              {accountingRadiusData?.name || ''}
            </TenantLink>
          ))
    }
  ]

  return (
    <SummaryCard data={identityProviderInfo} />
  )
}