import { useIntl } from 'react-intl'

import { Button, PageHeader, SummaryCard }                                                 from '@acx-ui/components'
import { useGetSwitchAccessControlSetByIdQuery }                                           from '@acx-ui/rc/services'
import { getPolicyAllowedOperation, PolicyOperation, PolicyType, usePolicyListBreadcrumb } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                                           from '@acx-ui/react-router-dom'
import { SwitchScopes }                                                                    from '@acx-ui/types'
import { hasCrossVenuesPermission, filterByAccess }                                        from '@acx-ui/user'

export const SwitchAccessControlSetDetail = () => {
  const { $t } = useIntl()
  const { accessControlId } = useParams()

  const { data } = useGetSwitchAccessControlSetByIdQuery({ params: { accessControlId } })

  const switchAccessControlPage = '/policies/accessControl/switch'
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SWITCH_ACCESS_CONTROL)
  breadcrumb[2].link = switchAccessControlPage

  const getConfigureButton = () => {
    return (
      <TenantLink
        scopeKey={[SwitchScopes.UPDATE]}
        rbacOpsIds={getPolicyAllowedOperation(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.EDIT)}
        to={`/policies/accessControl/switch/${accessControlId}/edit`}
      >
        <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
      </TenantLink>
    )
  }

  const portProfileData = [
    {
      title: $t({ defaultMessage: 'Layer 2' }),
      content: data?.layer2AclPolicyId ?
        $t({ defaultMessage: 'ON' }) : $t({ defaultMessage: 'OFF' })
    }
  ]

  return (
    <>
      <PageHeader
        title={data?.policyName}
        breadcrumb={breadcrumb}
        extra={hasCrossVenuesPermission() && filterByAccess([getConfigureButton()])}
      />
      <SummaryCard data={portProfileData} />
    </>
  )
}