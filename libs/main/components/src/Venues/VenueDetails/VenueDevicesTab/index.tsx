import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useIsSplitOn, Features }                from '@acx-ui/feature-toggle'
import { useIsEdgeReady }                        from '@acx-ui/rc/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                             from '@acx-ui/types'
import { hasRoles, useUserProfileContext }       from '@acx-ui/user'

import { VenueEdge }          from './VenueEdge'
import { VenueIotController } from './VenueIotController'
import { VenueRWG }           from './VenueRWG'
import { VenueSwitch }        from './VenueSwitch'
import { VenueWifi }          from './VenueWifi'


export function VenueDevicesTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeSubTab, venueId } = useParams()
  const basePath = useTenantLink(`/venues/${venueId}/venue-details/devices`)
  const { isCustomRole } = useUserProfileContext()
  const isEdgeEnabled = useIsEdgeReady()
  const rwgHasPermission = hasRoles([RolesEnum.PRIME_ADMIN,
    RolesEnum.ADMINISTRATOR,
    RolesEnum.READ_ONLY]) || isCustomRole

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const tabs = [
    {
      label: $t({ defaultMessage: 'Wi-Fi' }),
      value: 'wifi',
      children: <VenueWifi />
    },
    {
      label: $t({ defaultMessage: 'Switch' }),
      value: 'switch',
      children: <VenueSwitch />
    },
    ...(isEdgeEnabled
      ? [{
        label: $t({ defaultMessage: 'RUCKUS Edge' }),
        value: 'edge',
        children: <VenueEdge />
      }]: []),
    ...(useIsSplitOn(Features.RUCKUS_WAN_GATEWAY_UI_SHOW) && rwgHasPermission
      ? [{
        label: $t({ defaultMessage: 'RWG' }),
        value: 'rwg',
        children: <VenueRWG />
      }]: []),
    ...(useIsSplitOn(Features.IOT_PHASE_2_TOGGLE)
      ? [{
        label: $t({ defaultMessage: 'IoT Controller' }),
        value: 'iotController',
        children: <VenueIotController />
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
