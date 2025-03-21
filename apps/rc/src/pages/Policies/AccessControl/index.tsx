import { useIntl } from 'react-intl'

import { Button, PageHeader, Tabs }                   from '@acx-ui/components'
import { useIsSplitOn, Features }                     from '@acx-ui/feature-toggle'
import { AccessControlTabs as WifiAccessControlTabs } from '@acx-ui/rc/components'
import {
  filterByAccessForServicePolicyMutation,
  getPolicyListRoutePath,
  PortProfileTabsEnum,
  getScopeKeyByPolicy,
  getPolicyAllowedOperation,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasCrossVenuesPermission }          from '@acx-ui/user'

import { SwitchAccessControl } from '../SwitchAccessControl/index'

const AccessControlTabs = () => {
  const { $t } = useIntl()
  const { activeTab } = useParams()
  const basePath = useTenantLink('/policies/accessControl')
  const navigate = useNavigate()

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    }, { replace: true })
  }

  return (
    <Tabs onChange={onTabChange} activeKey={activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Wi-Fi' })}
        key='wifi' />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Switch' })}
        key='switch' />
    </Tabs>
  )
}

const tabs = {
  wifi: () => <WifiAccessControlTabs />,
  switch: () => <SwitchAccessControl />
}

export default function AccessControl () {
  const { $t } = useIntl()
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  const isSwitchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)

  const getAddButton = () => {
    return activeTab === PortProfileTabsEnum.WIFI ? filterByAccessForServicePolicyMutation([
      <TenantLink
        scopeKey={
          getScopeKeyByPolicy(PolicyType.ACCESS_CONTROL, PolicyOperation.CREATE)}
        // eslint-disable-next-line max-len
        to={'/policies/accessControl/wifi/create'}
      >
        <Button type='primary'>{$t({ defaultMessage: 'Add Access Control Set' })}</Button>
      </TenantLink>
    ]) : hasCrossVenuesPermission() && filterByAccess([
      <TenantLink
        scopeKey={
          getScopeKeyByPolicy(PolicyType.ACCESS_CONTROL, PolicyOperation.CREATE)
        }
        rbacOpsIds={
          getPolicyAllowedOperation(PolicyType.ACCESS_CONTROL, PolicyOperation.CREATE)
        }
        to={'/policies/accessControl/switch/add'}
      >
        <Button type='primary'>{$t({ defaultMessage: 'Add Switch Access Control' })}</Button>
      </TenantLink>
    ])
  }

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'Access Control' }
          )
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles1' }),
            link: getPolicyListRoutePath(true)
          }
        ]}

        extra={getAddButton()}
        footer={isSwitchMacAclEnabled && <AccessControlTabs/>}
      />
      { isSwitchMacAclEnabled && Tab && <Tab /> }
      { !isSwitchMacAclEnabled && <WifiAccessControlTabs /> }
    </>
  )
}
