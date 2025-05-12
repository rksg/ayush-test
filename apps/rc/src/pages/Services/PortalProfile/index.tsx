import { useIntl } from 'react-intl'

import { Button, PageHeader, Tabs } from '@acx-ui/components'
import { useIsSplitOn, Features }   from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }    from '@acx-ui/rc/components'
import {
  ServiceType,
  ServiceOperation,
  getServiceRoutePath,
  getServiceListRoutePath,
  getScopeKeyByService,
  filterByAccessForServicePolicyMutation,
  getServiceAllowedOperation,
  PortalProfileTabsEnum
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import NetworkSegAuthTable from '../NetworkSegWebAuth/NetworkSegAuthTable'
import PortalTable         from '../Portal/PortalTable'

const ProfileTabs = ({ activeKey, isPinSwitchReady }:
  { activeKey?: string, isPinSwitchReady?: boolean }) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/services/portalProfile')

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    }, { replace: true })
  }

  return (
    <Tabs onChange={onTabChange} activeKey={activeKey}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Guest Portal' })}
        key={PortalProfileTabsEnum.GUEST}
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'PIN Portal for Switch' })}
        key={PortalProfileTabsEnum.PIN}
        disabled={!isPinSwitchReady} />
    </Tabs>
  )
}

const tabs = {
  [PortalProfileTabsEnum.GUEST]: () => <PortalTable hideHeader={true} />,
  [PortalProfileTabsEnum.PIN]: () => <NetworkSegAuthTable hideHeader={true} />
}

export default function PortalProfile () {
  const { $t } = useIntl()
  const params = useParams()
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isPinSwitchEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION_SWITCH)
  const isPinSwitchReady = isEdgePinReady && isPinSwitchEnabled

  // eslint-disable-next-line max-len
  const activeTab = (params?.activeTab === 'list' || !isPinSwitchReady) ? PortalProfileTabsEnum.GUEST : params.activeTab
  const Tab = tabs[activeTab as keyof typeof tabs]

  const getAddButton = () => {
    return activeTab === PortalProfileTabsEnum.GUEST ? filterByAccessForServicePolicyMutation([
      <TenantLink
        scopeKey={getScopeKeyByService(ServiceType.PORTAL, ServiceOperation.CREATE)}
        rbacOpsIds={getServiceAllowedOperation(ServiceType.PORTAL, ServiceOperation.CREATE)}
        to={getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.CREATE })}
      >
        <Button type='primary'>{$t({ defaultMessage: 'Add Guest Portal' })}</Button>
      </TenantLink>
    ]) : filterByAccessForServicePolicyMutation([
      <TenantLink
        scopeKey={getScopeKeyByService(ServiceType.WEBAUTH_SWITCH, ServiceOperation.CREATE)}
        rbacOpsIds={getServiceAllowedOperation(ServiceType.WEBAUTH_SWITCH, ServiceOperation.CREATE)}
        to={getServiceRoutePath({ type: ServiceType.WEBAUTH_SWITCH,oper: ServiceOperation.CREATE })}
      >
        <Button type='primary'>{$t({ defaultMessage: 'Add PIN Portal for Switch' })}</Button>
      </TenantLink>
    ])
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Portal' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'My Services' }),
            link: getServiceListRoutePath(true)
          }
        ]}

        extra={getAddButton()}
        footer={<ProfileTabs activeKey={activeTab} isPinSwitchReady={isPinSwitchReady} />}
      />
      { Tab && <Tab /> }
    </>
  )
}
