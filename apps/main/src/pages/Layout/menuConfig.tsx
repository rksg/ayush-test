import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { LayoutProps, LayoutUI, genPlaceholder }    from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  AIOutlined as AIOutlinedBase,
  AISolid as AISolidBase,
  AccountCircleOutlined,
  AccountCircleSolid,
  AdminOutlined,
  AdminSolid,
  CalendarDateOutlined,
  CalendarDateSolid,
  DevicesOutlined,
  DevicesSolid,
  LocationOutlined,
  LocationSolid,
  NetworksOutlined,
  NetworksSolid,
  PoliciesOutlined,
  PoliciesSolid as PoliciesSolidBase,
  DataStudioOutlined,
  DataStudioSolid,
  ReportsOutlined,
  ReportsSolid,
  ServicesOutlined,
  ServicesSolid as ServicesSolidBase,
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid,
  ServiceValidationSolid,
  ServiceValidationOutlined
} from '@acx-ui/icons'
import { getServiceCatalogRoutePath, getServiceListRoutePath } from '@acx-ui/rc/utils'
import { RolesEnum }                                           from '@acx-ui/types'
import { hasRoles }                                            from '@acx-ui/user'

const AIOutlined = styled(AIOutlinedBase)`${LayoutUI.iconOutlinedOverride}`
const AISolid = styled(AISolidBase)`${LayoutUI.iconOutlinedOverride}`
const ServicesSolid = styled(ServicesSolidBase)`${LayoutUI.iconSolidOverride}`
const PoliciesSolid = styled(PoliciesSolidBase)`${LayoutUI.iconSolidOverride}`

export function useMenuConfig () {
  const { $t } = useIntl()
  const showSV = useIsSplitOn(Features.SERVICE_VALIDATION)
  const showVideoCallQoe = useIsSplitOn(Features.VIDEO_CALL_QOE)
  const earlyBetaEnabled = useIsSplitOn(Features.EDGE_EARLY_BETA)
  const isEdgeEnabled = useIsSplitOn(Features.EDGES) || earlyBetaEnabled
  const isAdministrationEnabled = useIsSplitOn(Features.UNRELEASED) || earlyBetaEnabled
  const isAdmin = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const isPersonaEnabled = useIsSplitOn(Features.PERSONA)
  const isMacRegistrationEnabled = useIsSplitOn(Features.MAC_REGISTRATION)

  const config: LayoutProps['menuConfig'] = [
    {
      path: '/dashboard',
      name: $t({ defaultMessage: 'Dashboard' }),
      inactiveIcon: SpeedIndicatorOutlined,
      activeIcon: SpeedIndicatorSolid
    },
    ...(isAdmin ? [{
      path: '/analytics',
      name: $t({ defaultMessage: 'AI Analytics' }),
      inactiveIcon: AIOutlined,
      activeIcon: AISolid,
      routes: [
        {
          path: '/analytics/incidents',
          name: $t({ defaultMessage: 'Incidents' })
        },
        // TODO: add back when needed, comment for now
        // {
        //   path: '/analytics/recommendations',
        //   name: $t({ defaultMessage: 'Recommendations' })
        // },
        {
          path: '/analytics/health',
          name: $t({ defaultMessage: 'Health' })
        }
        // TODO: add back when needed, comment for now
        // {
        //   path: '/analytics/configChange',
        //   name: $t({ defaultMessage: 'Config Change' })
        // }
      ]
    }] : []),
    {
      path: '/timeline',
      name: $t({ defaultMessage: 'Timeline' }),
      inactiveIcon: CalendarDateOutlined,
      activeIcon: CalendarDateSolid
    },
    ...(useIsTierAllowed('ANLT-ADV') && isAdmin ? [{
      path: '/serviceValidation',
      name: $t({ defaultMessage: 'Service Validation' }),
      inactiveIcon: ServiceValidationOutlined,
      activeIcon: ServiceValidationSolid,
      routes: [
        {
          path: '/serviceValidation/networkHealth',
          name: $t({ defaultMessage: 'Network Health' })
        },
        {
          path: '/serviceValidation/videoCallQoe',
          name: $t({ defaultMessage: 'Video Call QoE' }),
          disabled: !showVideoCallQoe
        }
      ],
      disabled: !showSV
    }] : []),
    genPlaceholder(),
    {
      path: '/venues',
      name: $t({ defaultMessage: 'Venues' }),
      inactiveIcon: LocationOutlined,
      activeIcon: LocationSolid
    },
    {
      path: '/devices',
      name: $t({ defaultMessage: 'Devices' }),
      inactiveIcon: DevicesOutlined,
      activeIcon: DevicesSolid,
      routes:
        [
          {
            path: '/devices/wifi',
            name: $t({ defaultMessage: 'Wi-Fi' })
          },
          {
            path: '/devices/switch',
            name: $t({ defaultMessage: 'Switch' })
          },
          ...isEdgeEnabled ? [{
            path: '/devices/edge/list',
            name: $t({ defaultMessage: 'SmartEdge' })
          }] : []
        ]
    },
    {
      path: '/networks',
      name: $t({ defaultMessage: 'Networks' }),
      inactiveIcon: NetworksOutlined,
      activeIcon: NetworksSolid,
      routes: [
        {
          path: '/networks/wireless',
          name: $t({ defaultMessage: 'Wireless Networks' })
        },
        {
          path: '/networks/wired/profiles',
          name: $t({ defaultMessage: 'Wired Networks' })
        }
      ]
    },
    {
      path: '/services',
      name: $t({ defaultMessage: 'Services' }),
      inactiveIcon: ServicesOutlined,
      activeIcon: ServicesSolid,
      disabled: !useIsSplitOn(Features.SERVICES),
      routes: [
        {
          path: getServiceListRoutePath(true),
          name: $t({ defaultMessage: 'My Services' })
        },
        {
          path: getServiceCatalogRoutePath(true),
          name: $t({ defaultMessage: 'Service Catalog' })
        }
      ]
    },
    {
      path: '/policies',
      name: $t({ defaultMessage: 'Policies & Profiles' }),
      inactiveIcon: PoliciesOutlined,
      activeIcon: PoliciesSolid,
      disabled: !useIsSplitOn(Features.POLICIES)
    },
    {
      path: '/users',
      name: $t({ defaultMessage: 'Users' }),
      inactiveIcon: AccountCircleOutlined,
      activeIcon: AccountCircleSolid,
      routes: [
        {
          path: '/users/wifi',
          name: $t({ defaultMessage: 'Wi-Fi' })
        },
        {
          path: '/users/switch',
          name: $t({ defaultMessage: 'Switch' })
        },
        ...(isPersonaEnabled && isMacRegistrationEnabled)
          ? [{
            path: '/users/persona-management',
            name: $t({ defaultMessage: 'Persona Management' })
          }]
          : []
      ]
    },
    genPlaceholder(),
    {
      path: '/dataStudio',
      name: $t({ defaultMessage: 'Data Studio' }),
      inactiveIcon: DataStudioOutlined,
      activeIcon: DataStudioSolid
    },
    {
      path: '/reports',
      name: $t({ defaultMessage: 'Reports' }),
      inactiveIcon: ReportsOutlined,
      activeIcon: ReportsSolid,
      disabled: false,
      routes: [
        {
          path: '/reports/overview',
          name: $t({ defaultMessage: 'Overview' })
        },
        {
          path: '/reports/wireless',
          name: $t({ defaultMessage: 'Wireless' })
        },
        {
          path: '/reports/wired',
          name: $t({ defaultMessage: 'Wired' })
        },
        {
          path: '/reports/aps',
          name: $t({ defaultMessage: 'APs' })
        },
        {
          path: '/reports/switches',
          name: $t({ defaultMessage: 'Switches' })
        },
        {
          path: '/reports/wlans',
          name: $t({ defaultMessage: 'WLANs' })
        },
        {
          path: '/reports/clients',
          name: $t({ defaultMessage: 'Wireless Clients' })
        },
        {
          path: '/reports/applications',
          name: $t({ defaultMessage: 'Applications' })
        },
        {
          path: '/reports/airtime',
          name: $t({ defaultMessage: 'Airtime Utilization' })
        }
      ]
    },
    genPlaceholder(),
    {
      path: '/administration',
      name: $t({ defaultMessage: 'Administration' }),
      inactiveIcon: AdminOutlined,
      activeIcon: AdminSolid,
      disabled: !isAdministrationEnabled
    }
  ]
  if (isGuestManager) {
    return []
  }
  return config
}
