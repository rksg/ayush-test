import { useEffect } from 'react'

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
  NetworkTypeTabsEnum
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasCrossVenuesPermission }          from '@acx-ui/user'

import NetworkSegAuthTable from '../NetworkSegWebAuth/NetworkSegAuthTable'
import PortalTable         from '../Portal/PortalTable'

const ProfileTabs = () => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/services/portalProfile')
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isPinSwitchEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION_SWITCH)


  useEffect(() => {
    if (params?.activeTab === 'list') {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/wifi`
      }, { replace: true })
    }
  }, [basePath, navigate, params?.activeTab])

  const activeTab = (!isEdgePinReady || !isPinSwitchEnabled) ? 'wifi' : params.activeTab
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
        tab={$t({ defaultMessage: 'Guest Portal' })}
        key='wifi'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'PIN Portal for Switch' })}
        key='switch'
        disabled={!isEdgePinReady || !isPinSwitchEnabled} />
    </Tabs>
  )
}

const tabs = {
  wifi: () => <PortalTable hideHeader={true} />,
  switch: () => <NetworkSegAuthTable hideHeader={true} />
}

export default function PortalProfile () {
  const { $t } = useIntl()
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]


  const getAddButton = () => {
    return activeTab === NetworkTypeTabsEnum.WIFI ? filterByAccessForServicePolicyMutation([
      <TenantLink
        scopeKey={getScopeKeyByService(ServiceType.PORTAL, ServiceOperation.CREATE)}
        rbacOpsIds={getServiceAllowedOperation(ServiceType.PORTAL, ServiceOperation.CREATE)}
        to={getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.CREATE })}
      >
        <Button type='primary'>{$t({ defaultMessage: 'Add Guest Portal' })}</Button>
      </TenantLink>
    ]) : hasCrossVenuesPermission() && filterByAccess([
      <TenantLink
        scopeKey={getScopeKeyByService(ServiceType.WEBAUTH_SWITCH, ServiceOperation.CREATE)}
        rbacOpsIds={getServiceAllowedOperation(ServiceType.WEBAUTH_SWITCH, ServiceOperation.CREATE)}
        // eslint-disable-next-line max-len
        to={getServiceRoutePath({ type: ServiceType.WEBAUTH_SWITCH, oper: ServiceOperation.CREATE })}
      >
        <Button type='primary'>{$t({ defaultMessage: 'Add PIN Portal for Switch' })}</Button>
      </TenantLink>
    ])
  }

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'Portal' }
          )
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'My Services' }),
            link: getServiceListRoutePath(true)
          }
        ]}

        extra={getAddButton()}
        footer={<ProfileTabs/>}
      />
      { Tab && <Tab /> }
    </>
  )
}
