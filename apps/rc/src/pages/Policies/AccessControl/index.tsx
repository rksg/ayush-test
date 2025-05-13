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
  PolicyType,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

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
    return activeTab === PortProfileTabsEnum.WIFI
      ? filterByAccessForServicePolicyMutation([
        <TenantLink
          scopeKey={
            getScopeKeyByPolicy(PolicyType.ACCESS_CONTROL, PolicyOperation.CREATE)
          }
          rbacOpsIds={
            getPolicyAllowedOperation(PolicyType.ACCESS_CONTROL, PolicyOperation.CREATE)
          }
          to={
            getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.CREATE })
          }
        >
          <Button type='primary'>{$t({ defaultMessage: 'Add Access Control Set' })}</Button>
        </TenantLink>
      ])
      : filterByAccessForServicePolicyMutation([
        <TenantLink
          scopeKey={
            getScopeKeyByPolicy(PolicyType.SWITCH_ACCESS_CONTROL, PolicyOperation.CREATE)
          }
          rbacOpsIds={
            getPolicyAllowedOperation(PolicyType.SWITCH_ACCESS_CONTROL, PolicyOperation.CREATE)
          }
          to={'/policies/accessControl/switch/add'}
        >
          <Button type='primary'>{$t({ defaultMessage: 'Add Access Control Set' })}</Button>
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
            text: $t({ defaultMessage: 'Policies & Profiles' }),
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
