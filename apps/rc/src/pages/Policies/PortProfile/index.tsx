/* eslint-disable max-len */
import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader, Tabs } from '@acx-ui/components'
import { useIsSplitOn, Features }   from '@acx-ui/feature-toggle'
import {
  filterByAccessForServicePolicyMutation,
  usePoliciesBreadcrumb,
  PortProfileTabsEnum,
  getPolicyRoutePath,
  getScopeKeyByPolicy,
  getPolicyAllowedOperation,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasCrossVenuesPermission }          from '@acx-ui/user'

import EthernetPortProfileTable from '../EthernetPortProfile/EthernetPortProfileTable'

import SwitchPortProfile from './PortProfileTable/SwitchPortProfile'

const ProfileTabs = () => {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink('/policies/portProfile')
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)
  const isSwitchPortProfileEnabled = useIsSplitOn(Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE)
  const activeTab = !isEthernetPortProfileEnabled ? 'switch' : params.activeTab
  const navigate = useNavigate()
  const onTabChange = (tab: string) => {
    if (tab === 'switch') tab = `${tab}/profiles`
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    }, { replace: true })
  }

  useEffect(() => {
    if (!isEthernetPortProfileEnabled) {
      onTabChange('switch')
    }
  }, [isEthernetPortProfileEnabled])

  return (
    <Tabs onChange={onTabChange} activeKey={activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Wi-Fi' })}
        key='wifi'
        disabled={!isEthernetPortProfileEnabled} />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Switch' })}
        key='switch'
        disabled={!isSwitchPortProfileEnabled} />
    </Tabs>
  )
}

const tabs = {
  wifi: () => <EthernetPortProfileTable />,
  switch: () => <SwitchPortProfile />
}

export default function PortProfile () {
  const { $t } = useIntl()
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]


  const getAddButton = () => {
    return activeTab === PortProfileTabsEnum.WIFI ? filterByAccessForServicePolicyMutation([
      <TenantLink
        scopeKey={getScopeKeyByPolicy(PolicyType.ETHERNET_PORT_PROFILE, PolicyOperation.CREATE)}
        rbacOpsIds={getPolicyAllowedOperation(PolicyType.ETHERNET_PORT_PROFILE, PolicyOperation.CREATE)}
        to={getPolicyRoutePath({ type: PolicyType.ETHERNET_PORT_PROFILE , oper: PolicyOperation.CREATE })}
      >
        <Button type='primary'>{$t({ defaultMessage: 'Add Ethernet Port Profile' })}</Button>
      </TenantLink>
    ]) : hasCrossVenuesPermission() && filterByAccess([
      <TenantLink
        scopeKey={getScopeKeyByPolicy(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.CREATE)}
        rbacOpsIds={getPolicyAllowedOperation(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.CREATE)}
        to={'/policies/portProfile/switch/profiles/add'}
      >
        <Button type='primary'>{$t({ defaultMessage: 'Add ICX Port Profile' })}</Button>
      </TenantLink>
    ])
  }

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'Port Profiles' }
          )
        }
        breadcrumb={usePoliciesBreadcrumb()}
        extra={getAddButton()}
        footer={<ProfileTabs/>}
      />
      { Tab && <Tab /> }
    </>
  )
}
