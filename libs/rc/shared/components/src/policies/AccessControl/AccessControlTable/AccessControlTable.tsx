import { useIntl } from 'react-intl'

import { Button, PageHeader, Tabs }                    from '@acx-ui/components'
import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { useGetEnhancedAccessControlProfileListQuery } from '@acx-ui/rc/services'
import {
  PolicyType,
  PolicyOperation,
  getPolicyListRoutePath,
  getPolicyRoutePath, useTableQuery, getScopeKeyByPolicy, filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { MacACLs }                                from '@acx-ui/switch/components'

import { PROFILE_MAX_COUNT_ACCESS_CONTROL } from '../constants'

import AccessControlTabs from './AccessControlTabs'

const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name'
  ]
}

const PoliciesAccessControlTabs = () => {
  const { $t } = useIntl()
  const basePath = useTenantLink('/policies/accessControl/wifi/list')
  const activeTab = 'wifi'
  const navigate = useNavigate()
  const onTabChange = (tab: string) => {
    if (tab === 'switch') tab = `${tab}/profiles`
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    }, { replace: true })
  }

  return (
    <Tabs onChange={onTabChange} activeKey={activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Wi-Fi' })}
        key='wifi'/>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Switch' })}
        key='switch' />
    </Tabs>
  )
}

const tabs = {
  wifi: () => <AccessControlTabs />,
  switch: () => <MacACLs />
}

export function AccessControlTable () {
  const { $t } = useIntl()
  // const { activeTab } = useParams()
  const Tab = tabs['wifi' as keyof typeof tabs]

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isSwitchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE) || true

  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedAccessControlProfileListQuery,
    defaultPayload,
    enableRbac
  })
  return (<>
    <PageHeader
      title={
        $t({
          defaultMessage: 'Access Control'
        })
      }
      breadcrumb={[
        { text: $t({ defaultMessage: 'Network Control' }) },
        {
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        }
      ]}
      extra={filterByAccessForServicePolicyMutation([
        <TenantLink
          to={getPolicyRoutePath({
            type: PolicyType.ACCESS_CONTROL,
            oper: PolicyOperation.CREATE
          })}
          scopeKey={getScopeKeyByPolicy(PolicyType.ACCESS_CONTROL, PolicyOperation.CREATE)}
          rbacOpsIds={getPolicyAllowedOperation(PolicyType.ACCESS_CONTROL, PolicyOperation.CREATE)}
        >
          <Button
            type='primary'
            disabled={tableQuery.data?.totalCount! >= PROFILE_MAX_COUNT_ACCESS_CONTROL}>
            {$t({ defaultMessage: 'Add Access Control Set' })}
          </Button>
        </TenantLink>
      ])}
      footer={<PoliciesAccessControlTabs />}
    />
    {!isSwitchMacAclEnabled && <AccessControlTabs />}
    {isSwitchMacAclEnabled && <Tab />}
  </>)
}

