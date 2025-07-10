import { useIntl } from 'react-intl'

import { Button, PageHeader, Tabs }                                                                                   from '@acx-ui/components'
import { useIsSplitOn, Features }                                                                                     from '@acx-ui/feature-toggle'
import { useAclTotalCount, useSwitchAclTotalCount, useWifiAclTotalCount, AccessControlTabs as WifiAccessControlTabs } from '@acx-ui/rc/components'
import {
  filterByAccessForServicePolicyMutation,
  PortProfileTabsEnum,
  getScopeKeyByPolicy,
  getPolicyAllowedOperation,
  PolicyOperation,
  PolicyType,
  usePoliciesBreadcrumb,
  getPolicyRoutePath,
  policyTypeLabelWithCountMapping
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { SwitchAccessControl } from '../SwitchAccessControl'

const AccessControlTabs = () => {
  const { $t } = useIntl()
  const { activeTab } = useParams()
  const basePath = useTenantLink('/policies/accessControl')
  const navigate = useNavigate()
  const { data: wifiAclData } = useWifiAclTotalCount(false)
  const { data: switchAclData } = useSwitchAclTotalCount(false)

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    }, { replace: true })
  }

  return (
    <Tabs onChange={onTabChange} activeKey={activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Wi-Fi ({count})' }, { count: wifiAclData?.totalCount })}
        key='wifi' />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Switch ({count})' }, { count: switchAclData?.totalCount })}
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
  const aclTotalCountData = useAclTotalCount(false)

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
            policyTypeLabelWithCountMapping[PolicyType.ACCESS_CONTROL_CONSOLIDATION],
            { count: aclTotalCountData.data?.totalCount }
          )
        }
        breadcrumb={usePoliciesBreadcrumb()}
        extra={getAddButton()}
        footer={isSwitchMacAclEnabled && <AccessControlTabs/>}
      />
      { isSwitchMacAclEnabled && Tab && <Tab /> }
      { !isSwitchMacAclEnabled && <WifiAccessControlTabs /> }
    </>
  )
}
