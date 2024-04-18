import { useIntl } from 'react-intl'

import { Tabs }                                                from '@acx-ui/components'
import { useIsTierAllowed, TierFeatures }                      from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink }               from '@acx-ui/react-router-dom'
import { EdgeScopes, SwitchScopes, WifiScopes, hasPermission } from '@acx-ui/user'

import { VenueEdge }   from './VenueEdge'
import { VenueSwitch } from './VenueSwitch'
import { VenueWifi }   from './VenueWifi'


export function VenueDevicesTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeSubTab, venueId } = useParams()
  const basePath = useTenantLink(`/venues/${venueId}/venue-details/devices`)

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const tabs = [
    ...(hasPermission({ scopes: [WifiScopes.READ] }) ? [{
      label: $t({ defaultMessage: 'Wi-Fi' }),
      value: 'wifi',
      children: <VenueWifi />
    }] : []),

    ...(hasPermission({ scopes: [SwitchScopes.READ] }) ? [{
      label: $t({ defaultMessage: 'Switch' }),
      value: 'switch',
      children: <VenueSwitch />
    }] : []),

    ...(useIsTierAllowed(TierFeatures.SMART_EDGES)
      && hasPermission({ scopes: [EdgeScopes.READ] }) ? [{
        label: $t({ defaultMessage: 'SmartEdge' }),
        value: 'edge',
        children: <VenueEdge />
      }]: [])
  ]

  return (
    <Tabs activeKey={activeSubTab}
      defaultActiveKey={activeSubTab || tabs[0]?.value}
      onChange={onTabChange}
      type='card'
    >
      {tabs.map((tab) => (
        <Tabs.TabPane
          tab={tab.label}
          key={tab.value}
        >
          {tab.children}
        </Tabs.TabPane>
      ))}
    </Tabs>
  )
}
