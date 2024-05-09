import { MenuProps } from 'antd'
import { ItemType }  from 'antd/lib/menu/hooks/useItems'
import { useIntl }   from 'react-intl'

import {
  ConfigTemplateLink,
  PolicyConfigTemplateLink,
  ServiceConfigTemplateLink,
  useConfigTemplateVisibilityMap
} from '@acx-ui/rc/components'
import {
  configTemplatePolicyTypeMap,
  configTemplateServiceTypeMap,
  ConfigTemplateType,
  PolicyOperation,
  policyTypeLabelMapping,
  ServiceOperation,
  serviceTypeLabelMapping
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import * as UI from './styledComponents'

export function useAddTemplateMenuProps (): Omit<MenuProps, 'placement'> {
  const { $t } = useIntl()
  const visibilityMap = useConfigTemplateVisibilityMap()
  const policyMenuItems = usePolicyMenuItems()
  const serviceMenuItems = useServiceMenuItems()
  const switchMenuItems = useSwitchMenuItems()
  const items: ItemType[] = [
    (visibilityMap[ConfigTemplateType.NETWORK] ? {
      key: 'add-wifi-network',
      label: <ConfigTemplateLink to='networks/wireless/add'>
        {$t({ defaultMessage: 'Wi-Fi Network' })}
      </ConfigTemplateLink>
    } : null),
    (visibilityMap[ConfigTemplateType.VENUE] ? {
      key: 'add-venue',
      label: <ConfigTemplateLink to='venues/add'>
        {$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
      </ConfigTemplateLink>
    } : null),
    switchMenuItems,
    policyMenuItems,
    serviceMenuItems
  ]

  return {
    expandIcon: <UI.MenuExpandArrow />,
    subMenuCloseDelay: 0.2,
    items: items
  }
}

function usePolicyMenuItems (): ItemType {
  const visibilityMap = useConfigTemplateVisibilityMap()
  const { $t } = useIntl()

  return {
    key: 'add-policy',
    label: $t({ defaultMessage: 'Policies' }),
    children: [
      createPolicyMenuItem(ConfigTemplateType.ACCESS_CONTROL, visibilityMap),
      createPolicyMenuItem(ConfigTemplateType.ROGUE_AP_DETECTION, visibilityMap),
      createPolicyMenuItem(ConfigTemplateType.SYSLOG, visibilityMap),
      createPolicyMenuItem(ConfigTemplateType.VLAN_POOL, visibilityMap)
    ]
  }
}

// eslint-disable-next-line max-len
export function createPolicyMenuItem (configTemplateType: ConfigTemplateType, visibilityMap: Record<ConfigTemplateType, boolean>): ItemType {
  const { $t } = getIntl()
  const policyType = configTemplatePolicyTypeMap[configTemplateType]

  if (!visibilityMap[configTemplateType] || !policyType) return null

  const labelNode = <PolicyConfigTemplateLink type={policyType} oper={PolicyOperation.CREATE}>
    {$t(policyTypeLabelMapping[policyType])}
  </PolicyConfigTemplateLink>

  return {
    key: `add-${configTemplateType}`,
    label: labelNode
  }
}

function useServiceMenuItems (): ItemType {
  const visibilityMap = useConfigTemplateVisibilityMap()
  const { $t } = useIntl()

  return {
    key: 'add-service',
    label: $t({ defaultMessage: 'Services' }),
    children: [
      createServiceMenuItem(ConfigTemplateType.DPSK, visibilityMap),
      createServiceMenuItem(ConfigTemplateType.DHCP, visibilityMap),
      createServiceMenuItem(ConfigTemplateType.PORTAL, visibilityMap),
      createServiceMenuItem(ConfigTemplateType.WIFI_CALLING, visibilityMap)
    ]
  }
}

// eslint-disable-next-line max-len
export function createServiceMenuItem (configTemplateType: ConfigTemplateType, visibilityMap: Record<ConfigTemplateType, boolean>): ItemType {
  const { $t } = getIntl()
  const serviceType = configTemplateServiceTypeMap[configTemplateType]

  if (!visibilityMap[configTemplateType] || !serviceType) return null

  const labelNode = <ServiceConfigTemplateLink type={serviceType} oper={ServiceOperation.CREATE}>
    {$t(serviceTypeLabelMapping[serviceType])}
  </ServiceConfigTemplateLink>

  return {
    key: `add-${configTemplateType}`,
    label: labelNode
  }
}

export function useSwitchMenuItems (): ItemType | null {
  const visibilityMap = useConfigTemplateVisibilityMap()
  const { $t } = getIntl()

  if (!visibilityMap[ConfigTemplateType.SWITCH_REGULAR]) return null

  return {
    key: 'add-switch-profile',
    label: $t({ defaultMessage: 'Wired' }),
    children: [
      (visibilityMap[ConfigTemplateType.SWITCH_REGULAR] ? {
        key: 'add-switch-config-profile',
        label: <ConfigTemplateLink to='networks/wired/profiles/add'>
          {$t({ defaultMessage: 'Configuration Profile' })}
        </ConfigTemplateLink>
      } : null)
    ]
  }
}
