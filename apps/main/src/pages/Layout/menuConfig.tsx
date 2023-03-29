import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { LayoutProps, LayoutUI, MenuItem }          from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  AIOutlined as AIOutlinedBase,
  AISolid as AISolidBase,
  AccountCircleOutlined,
  AccountCircleSolid,
  AdminOutlined,
  AdminSolid,
  DevicesOutlined,
  DevicesSolid,
  LocationOutlined,
  LocationSolid,
  NetworksOutlined,
  NetworksSolid,
  ServicesOutlined,
  ServicesSolid as ServicesSolidBase,
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid
} from '@acx-ui/icons'
import { getServiceCatalogRoutePath, getServiceListRoutePath } from '@acx-ui/rc/utils'
import { RolesEnum }                                           from '@acx-ui/types'
import { hasRoles }                                            from '@acx-ui/user'

const AIOutlined = styled(AIOutlinedBase)`${LayoutUI.iconOutlinedOverride}`
const AISolid = styled(AISolidBase)`${LayoutUI.iconOutlinedOverride}`
const ServicesSolid = styled(ServicesSolidBase)`${LayoutUI.iconSolidOverride}`

export function useMenuConfig () {
  const { $t } = useIntl()
  const showSV = useIsSplitOn(Features.SERVICE_VALIDATION)
  const earlyBetaEnabled = useIsSplitOn(Features.EDGE_EARLY_BETA)
  // const isEdgeEnabled = useIsSplitOn(Features.EDGES) || earlyBetaEnabled
  const isAdministrationEnabled = useIsSplitOn(Features.UNRELEASED) || earlyBetaEnabled
  const isAdmin = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])

  const config: LayoutProps['menuConfig'] = [
    {
      key: 'dashboard',
      uri: '/dashboard',
      label: $t({ defaultMessage: 'Dashboard' }),
      inactiveIcon: SpeedIndicatorOutlined,
      activeIcon: SpeedIndicatorSolid,
      isActivePattern: ['/dashboard']
    },
    {
      key: 'venues',
      uri: '/venues',
      label: $t({ defaultMessage: 'Venues' }),
      inactiveIcon: LocationOutlined,
      activeIcon: LocationSolid,
      isActivePattern: ['/venues']
    },
    {
      key: 'clients',
      label: $t({ defaultMessage: 'Clients' }),
      inactiveIcon: AccountCircleOutlined,
      activeIcon: AccountCircleSolid,
      isActivePattern: [
        '/users/wifi/clients',
        '/users/wifi/guests',
        '/reports/clients',
        '/users/switch/clients'
      ],
      children: [
        {
          type: 'group',
          label: $t({ defaultMessage: 'Wireless' }),
          children: [
            {
              uri: '/users/wifi/clients',
              label: $t({ defaultMessage: 'Wireless Clients List' })
            } ,
            {
              uri: '/users/wifi/guests',
              label: $t({ defaultMessage: 'Guest Pass Credentials' })
            },
            {
              uri: '/reports/clients',
              label: $t({ defaultMessage: 'Wireless Clients Report' })
            }
          ]
        },
        {
          type: 'group',
          label: $t({ defaultMessage: 'Wired' }),
          children: [
            {
              uri: '/users/switch/clients',
              label: $t({ defaultMessage: 'Wired Clients List' })
            }
          ]
        }
      ] as MenuItem[]
    },
    {
      key: 'wifi',
      label: $t({ defaultMessage: 'Wi-Fi' }),
      inactiveIcon: DevicesOutlined,
      activeIcon: DevicesSolid,
      isActivePattern: [
        '/devices/wifi',
        '/reports/aps',
        '/reports/airtime',
        '/networks/wireless',
        '/reports/wlans',
        '/reports/applications',
        '/reports/wireless'
      ],
      children: [
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Access Points' }),
          children: [
            {
              uri: '/devices/wifi',
              label: $t({ defaultMessage: 'Access Point List' })
            } ,
            {
              uri: '/reports/aps',
              label: $t({ defaultMessage: 'AP Report' })
            },
            {
              uri: '/reports/airtime',
              label: $t({ defaultMessage: 'Airtime Utilization Report' })
            }
          ]
        },
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Wi-Fi Networks' }),
          children: [
            {
              uri: '/networks/wireless',
              label: $t({ defaultMessage: 'Wi-Fi Networks List' })
            },
            {
              uri: '/reports/wlans',
              label: $t({ defaultMessage: 'WLANs Report' })
            },
            {
              uri: '/reports/applications',
              label: $t({ defaultMessage: 'Applications Report' })
            },
            {
              uri: '/reports/wireless',
              label: $t({ defaultMessage: 'Wireless Report' })
            }
          ]
        },
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Assurance' }),
          children: [
            ...(isAdmin ? [
              {
                uri: '/analytics/incidents',
                label: $t({ defaultMessage: 'Incidents' })
              },
              {
                uri: '/analytics/health',
                label: $t({ defaultMessage: 'Health' })
              }
            ]:[]),
            ...(useIsTierAllowed('ANLT-ADV') && isAdmin ? [
              {
                uri: '/serviceValidation/networkHealth',
                label: $t({ defaultMessage: 'Netowrk Health' }),
                disabled: !showSV
              }
            ]:[])
          ]
        }
      ].filter(item => item.children.length) as MenuItem[]
    },
    {
      key: 'wired',
      label: $t({ defaultMessage: 'Wired' }),
      inactiveIcon: NetworksOutlined,
      activeIcon: NetworksSolid,
      isActivePattern: [
        '/devices/switch',
        '/reports/wired',
        '/networks/wired'
      ],
      children: [
        {
          type: 'group',
          label: $t({ defaultMessage: 'Switches' }),
          children: [
            {
              uri: '/devices/switch',
              label: $t({ defaultMessage: 'Switch List' }),
              disabled: !useIsSplitOn(Features.DEVICES)
            } ,
            {
              uri: '/reports/wired',
              label: $t({ defaultMessage: 'Wired Report' })
            }
          ]
        },
        {
          type: 'group',
          label: $t({ defaultMessage: 'Wired Network Profiles' }),
          children: [
            {
              uri: '/networks/wired/profiles',
              label: $t({ defaultMessage: 'Configuration Profiles' })
            },
            {
              uri: '/networks/wired/onDemandCli',
              label: $t({ defaultMessage: 'On-Demand CLI Configuration' })
            }
          ]
        }
      ] as MenuItem[]
    },
    {
      key: 'networkControl',
      label: $t({ defaultMessage: 'Network Control' }),
      inactiveIcon: ServicesOutlined,
      activeIcon: ServicesSolid,
      isActivePattern: [
        '/services',
        '/policies'
      ],
      children: [
        {
          uri: getServiceListRoutePath(true),
          label: $t({ defaultMessage: 'My Services' }),
          disabled: !useIsSplitOn(Features.SERVICES)
        },
        {
          uri: getServiceCatalogRoutePath(true),
          label: $t({ defaultMessage: 'Service Catalog' }),
          disabled: !useIsSplitOn(Features.SERVICES)
        },
        {
          uri: '/policies',
          label: $t({ defaultMessage: 'Policies & Profiles' }),
          disabled: !useIsSplitOn(Features.POLICIES)
        }
      ] as MenuItem[]
    },
    {
      key: 'analytics',
      label: $t({ defaultMessage: 'Analytics & Reports' }),
      inactiveIcon: AIOutlined,
      activeIcon: AISolid,
      isActivePattern: [
        '/analytics',
        '/serviceValidation',
        '/dataStudio',
        '/reports/overview'
      ],
      children: [
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Analytics' }),
          children: [
            ...(isAdmin ? [
              {
                uri: '/analytics/incidents',
                label: $t({ defaultMessage: 'Incidents' })
              },
              {
                uri: '/analytics/health',
                label: $t({ defaultMessage: 'Health' })
              }
            ]:[]),
            ...(useIsTierAllowed('ANLT-ADV') && isAdmin ? [
              {
                uri: '/serviceValidation/networkHealth',
                label: $t({ defaultMessage: 'Netowrk Health' }),
                disabled: !showSV
              }
            ]:[])
          ]
        },
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Data Studio BI' }),
          children: [
            {
              uri: '/dataStudio',
              label: $t({ defaultMessage: 'Home' })
            }
          ]
        },
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Reports' }),
          children: [
            {
              uri: '/reports/overview',
              label: $t({ defaultMessage: 'Reports List' })
            }
          ]
        }
      ].filter(item => item.children.length) as MenuItem[]
    },
    {
      key: '/administration',
      label: $t({ defaultMessage: 'Administration' }),
      inactiveIcon: AdminOutlined,
      activeIcon: AdminSolid,
      disabled: !isAdministrationEnabled,
      isActivePattern: [
        '/timeline',
        '/administration'
      ],
      children: [
        {
          type: 'group',
          label: $t({ defaultMessage: 'Timeline' }),
          children: [
            {
              uri: '/timeline/activities',
              label: $t({ defaultMessage: 'Activities' })
            },
            {
              uri: '/timeline/events',
              label: $t({ defaultMessage: 'Events' })
            },
            {
              uri: '/timeline/adminLogs',
              label: $t({ defaultMessage: 'Administrative Logs' })
            }
          ]
        },
        {
          type: 'group',
          label: 'Account Management',
          children: [
            {
              uri: '/administration/accountSettings',
              label: $t({ defaultMessage: 'Settings' })
            },
            {
              uri: '/administration/administrators',
              label: $t({ defaultMessage: 'Administrators' })
            },
            {
              uri: '/administration/notifications',
              label: $t({ defaultMessage: 'Notifications' })
            },
            {
              uri: '/administration/subscriptions',
              label: $t({ defaultMessage: 'Subscriptions' })
            },
            {
              uri: '/administration/fwVersionMgmt',
              label: $t({ defaultMessage: 'Firmware Version Management' })
            },
            {
              uri: '/administration/fwVersionMgmt',
              label: $t({ defaultMessage: 'Local RADIUS Server' })
            }
          ]
        }
      ] as MenuItem[]
    }
  ]
  if (isGuestManager) { return [] }
  return config
}
