import { useIntl } from 'react-intl'

import { getUserProfile }        from '@acx-ui/analytics/utils'
import { LayoutProps, ItemType } from '@acx-ui/components'
import {
  Features,
  useIsSplitOn
} from '@acx-ui/feature-toggle'
import {
  AIOutlined,
  AISolid,
  AccountCircleOutlined,
  AccountCircleSolid,
  AdminOutlined,
  AdminSolid,
  BulbOutlined,
  BulbSolid,
  LocationOutlined,
  LocationSolid,
  RocketOutlined,
  RocketSolid,
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid,
  SwitchOutlined,
  SwitchSolid,
  WiFi
} from '@acx-ui/icons'
import { useSearchParams }              from '@acx-ui/react-router-dom'
import { hasPermission, RaiPermission } from '@acx-ui/user'

const legacyLink = (uri: string, search: URLSearchParams) => {
  const selectedTenants = search.get('selectedTenants')
  if (!selectedTenants) return uri
  return ''.concat(uri, '?selectedTenants=', decodeURIComponent(selectedTenants))
}

type Item = ItemType & {
  /** @default true */
  canAccess?: boolean,
  hidden?: boolean
  children?: Item[]
}

export const canAccessOnboardedSystems = () => {
  const { tenants } = getUserProfile()
  return tenants.some(tenant => tenant.permissions['READ_ONBOARDED_SYSTEMS'])
}

const canAccess = (permission: RaiPermission) => hasPermission({ permission })

const buildMenu = (config: Item[]): LayoutProps['menuConfig'] =>
  config.reduce((items, { canAccess, hidden, ...item }) => {
    if (typeof canAccess === 'undefined') canAccess = true

    if (!hidden && canAccess) {
      if ('children' in item) {
        const children = buildMenu(item.children!)
        if (children.length > 0) {
          items.push({ ...item, children })
        }
      } else {
        items.push(item)
      }
    }
    return items
  }, [] as LayoutProps['menuConfig'])

export function useMenuConfig () {
  const { $t } = useIntl()

  const [search] = useSearchParams()
  const isSwitchHealthEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_SWITCH_HEALTH_TOGGLE),
    useIsSplitOn(Features.SWITCH_HEALTH_TOGGLE)
  ].some(Boolean)
  const isIntentAIEnabled = useIsSplitOn(Features.RUCKUS_AI_INTENT_AI_TOGGLE)
  const isJwtEnabled = useIsSplitOn(Features.RUCKUS_AI_JWT_TOGGLE)
  const isDataConnectorEnabled = useIsSplitOn(Features.RUCKUS_AI_DATA_SUBSCRIPTIONS_TOGGLE)
  const aiAnalyticsMenu = [{
    canAccess: canAccess('READ_INCIDENTS'),
    uri: '/incidents',
    label: $t({ defaultMessage: 'Incidents' })
  }] as Item[]
  if (isIntentAIEnabled) {
    aiAnalyticsMenu.push({
      canAccess: canAccess('READ_INTENT_AI'),
      uri: '/intentAI',
      label: $t({ defaultMessage: 'IntentAI' })
    })
  } else {
    aiAnalyticsMenu
      .push({
        canAccess: canAccess('READ_AI_DRIVEN_RRM'),
        uri: '/recommendations/crrm',
        label: $t({ defaultMessage: 'AI-Driven RRM' })
      }, {
        canAccess: canAccess('READ_AI_OPERATIONS'),
        uri: '/recommendations/aiOps',
        label: $t({ defaultMessage: 'AI Operations' })
      })
  }
  return buildMenu([{
    uri: '/dashboard',
    canAccess: canAccess('READ_DASHBOARD'),
    label: $t({ defaultMessage: 'Dashboard' }),
    inactiveIcon: SpeedIndicatorOutlined,
    activeIcon: SpeedIndicatorSolid
  }, {
    label: $t({ defaultMessage: 'AI Assurance' }),
    inactiveIcon: AIOutlined,
    activeIcon: AISolid,
    children: [{
      type: 'group' as const,
      label: $t({ defaultMessage: 'AI Analytics' }),
      children: aiAnalyticsMenu
    }, {
      type: 'group' as const,
      label: $t({ defaultMessage: 'Network Assurance' }),
      children: [{
        canAccess: canAccess('READ_HEALTH'),
        uri: isSwitchHealthEnabled ? '/health/overview' : '/health',
        label: $t({ defaultMessage: 'Health' }),
        isActiveCheck: new RegExp('^/health')
      }, {
        canAccess: canAccess('READ_SERVICE_VALIDATION'),
        uri: '/serviceValidation',
        label: $t({ defaultMessage: 'Service Validation' })
      }, {
        canAccess: canAccess('READ_CONFIG_CHANGE'),
        uri: '/configChange',
        label: $t({ defaultMessage: 'Config Change' })
      }]
    }]
  }, {
    label: $t({ defaultMessage: 'App Experience' }),
    inactiveIcon: RocketOutlined,
    activeIcon: RocketSolid,
    children: [{
      canAccess: canAccess('READ_APP_INSIGHTS'),
      label: $t({ defaultMessage: 'AppInsights (coming soon)' })
    }, {
      canAccess: canAccess('READ_VIDEO_CALL_QOE'),
      uri: '/videoCallQoe',
      label: $t({ defaultMessage: 'Video Call QoE' })
    }]
  }, {
    canAccess: canAccess('READ_ZONES'),
    uri: '/zones',
    label: $t({ defaultMessage: 'Zones' }),
    inactiveIcon: LocationOutlined,
    activeIcon: LocationSolid
  }, {
    canAccess: canAccess('READ_WIRELESS_CLIENTS_LIST'),
    label: $t({ defaultMessage: 'Clients' }),
    inactiveIcon: AccountCircleOutlined,
    activeIcon: AccountCircleSolid,
    children: [{
      type: 'group' as const,
      label: $t({ defaultMessage: 'Wireless' }),
      children: [{
        uri: '/users/wifi/clients',
        label: $t({ defaultMessage: 'Wireless Clients List' })
      }, {
        uri: '/users/wifi/reports',
        label: $t({ defaultMessage: 'Wireless Clients Report' })
      }]
    }]
  }, {
    canAccess: canAccess('READ_ACCESS_POINTS_LIST'),
    label: $t({ defaultMessage: 'Wi-Fi' }),
    inactiveIcon: WiFi,
    children: [{
      type: 'group' as const,
      label: $t({ defaultMessage: 'Access Points' }),
      children: [{
        uri: '/devices/wifi',
        label: $t({ defaultMessage: 'Access Points List' }),
        isActiveCheck: new RegExp('^/devices/wifi(?!(/reports))')
      }, {
        uri: '/devices/wifi/reports/aps',
        label: $t({ defaultMessage: 'Access Points Report' })
      }, {
        uri: '/devices/wifi/reports/airtime',
        label: $t({ defaultMessage: 'Airtime Utilization Report' })
      }]
    }, {
      type: 'group' as const,
      label: $t({ defaultMessage: 'Wi-Fi Networks' }),
      children: [{
        uri: '/networks/wireless',
        label: $t({ defaultMessage: 'Wi-Fi Networks List' }),
        isActiveCheck: new RegExp('^/networks/wireless(?!(/reports))')
      }, {
        uri: '/networks/wireless/reports/wlans',
        label: $t({ defaultMessage: 'WLANs Report' })
      }, {
        uri: '/networks/wireless/reports/applications',
        label: $t({ defaultMessage: 'Applications Report' })
      }, {
        uri: '/networks/wireless/reports/wireless',
        label: $t({ defaultMessage: 'Wireless Report' })
      }]
    }]
  }, {
    canAccess: canAccess('READ_SWITCH_LIST'),
    label: $t({ defaultMessage: 'Wired' }),
    inactiveIcon: SwitchOutlined,
    activeIcon: SwitchSolid,
    children: [{
      type: 'group' as const,
      label: $t({ defaultMessage: 'Switches' }),
      children: [{
        uri: '/devices/switch',
        label: $t({ defaultMessage: 'Switch List' }),
        isActiveCheck: new RegExp('^/devices/switch(?!(/reports))')
      }, {
        uri: '/devices/switch/reports/wired',
        label: $t({ defaultMessage: 'Wired Report' })
      }]
    }]
  }, {
    label: $t({ defaultMessage: 'Business Insights' }),
    inactiveIcon: BulbOutlined,
    activeIcon: BulbSolid,
    children: [{
      canAccess: canAccess('READ_DATA_STUDIO'),
      uri: '/dataStudio',
      label: $t({ defaultMessage: 'Data Studio' })
    },
    ...(isDataConnectorEnabled ? [{
      canAccess: canAccess('READ_DATA_CONNECTOR'),
      uri: '/dataConnector',
      label: $t({ defaultMessage: 'Data Connector' }),
      superscript: $t({ defaultMessage: 'beta' })
    }] : []),
    {
      canAccess: canAccess('READ_REPORTS'),
      uri: '/reports',
      label: $t({ defaultMessage: 'Reports' })
    }, {
      canAccess: canAccess('READ_OCCUPANCY'),
      uri: legacyLink('/analytics/occupancy', search),
      label: $t({ defaultMessage: 'Occupancy' }),
      openNewTab: true
    }]
  }, {
    label: $t({ defaultMessage: 'Administration' }),
    inactiveIcon: AdminOutlined,
    activeIcon: AdminSolid,
    adminItem: true,
    children: [{
      type: 'group' as const,
      label: $t({ defaultMessage: 'Account Management' }),
      children: [{
        canAccess: canAccessOnboardedSystems(),
        uri: '/admin/onboarded',
        label: $t({ defaultMessage: 'Onboarded Systems' })
      }, {
        canAccess: canAccess('READ_USERS'),
        uri: '/admin/users',
        label: $t({ defaultMessage: 'Users' })
      }, {
        canAccess: canAccess('READ_LABELS'),
        uri: legacyLink('/analytics/admin/labels', search),
        label: $t({ defaultMessage: 'Labels' }),
        openNewTab: true
      }, {
        canAccess: canAccess('READ_RESOURCE_GROUPS'),
        uri: legacyLink('/analytics/admin/resourceGroups', search),
        label: $t({ defaultMessage: 'Resource Groups' }),
        openNewTab: true
      }, {
        canAccess: canAccess('READ_SUPPORT'),
        uri: '/admin/support',
        label: $t({ defaultMessage: 'Support' })
      }, {
        canAccess: canAccess('READ_LICENSES'),
        uri: legacyLink('/analytics/admin/license', search),
        label: $t({ defaultMessage: 'Licenses' }),
        openNewTab: true
      }, {
        canAccess: canAccess('READ_REPORT_SCHEDULES'),
        uri: legacyLink('/analytics/admin/schedules', search),
        label: $t({ defaultMessage: 'Schedules' }),
        openNewTab: true
      }, isJwtEnabled ? {
        uri: '/admin/developers/applicationTokens',
        label: $t({ defaultMessage: 'Developers' }),
        isActiveCheck: new RegExp('^/admin/developers')
      } : {
        canAccess: canAccess('READ_WEBHOOKS'),
        uri: '/admin/webhooks',
        label: $t({ defaultMessage: 'Webhooks' })
      }]
    }]
  }])
}
