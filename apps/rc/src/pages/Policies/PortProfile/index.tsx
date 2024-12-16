import { useIntl } from 'react-intl'

import { Button, PageHeader, Tabs } from '@acx-ui/components'
import {
  filterByAccessForServicePolicyMutation,
  getPolicyListRoutePath,
  PortProfileTabsEnum,
  getPolicyRoutePath,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import EthernetPortProfileTable from '../EthernetPortProfile/EthernetPortProfileTable'

import SwitchPortProfile from './PortProfileTable/SwitchPortProfile'

const ProfileTabs = () => {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink('/policies/portProfile')
  const navigate = useNavigate()
  const onTabChange = (tab: string) => {
    if (tab === 'switch') tab = `${tab}/profiles`
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }
  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi' })} key='wifi' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Switch' })} key='switch' />
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
    return filterByAccessForServicePolicyMutation(activeTab === PortProfileTabsEnum.WIFI ? [
      <TenantLink
        scopeKey={
          getScopeKeyByPolicy(PolicyType.ETHERNET_PORT_PROFILE, PolicyOperation.CREATE)}
        // eslint-disable-next-line max-len
        to={getPolicyRoutePath({ type: PolicyType.ETHERNET_PORT_PROFILE , oper: PolicyOperation.CREATE })}
      >
        <Button type='primary'>{$t({ defaultMessage: 'Add Ethernet Port Profile' })}</Button>
      </TenantLink>
    ]: [
      <TenantLink
        scopeKey={
          getScopeKeyByPolicy(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.CREATE)}
        // eslint-disable-next-line max-len
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
            { defaultMessage: 'Port Profile' }
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
        footer={<ProfileTabs/>}
      />
      { Tab && <Tab /> }
    </>
  )
}
