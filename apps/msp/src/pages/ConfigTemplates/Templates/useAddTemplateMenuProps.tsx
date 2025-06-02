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
  hasConfigTemplateAllowedOperation,
  PolicyOperation,
  policyTypeLabelMapping,
  ServiceOperation,
  serviceTypeLabelMapping,
  useIsNewServicesCatalogEnabled
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import * as UI                        from './styledComponents'
import { getConfigTemplateTypeLabel } from './templateUtils'

export function useAddTemplateMenuProps (): Omit<MenuProps, 'placement'> | null {
  const isNewServiceCatalogEnabled = useIsNewServicesCatalogEnabled()
  const policyMenuItems = usePolicyMenuItems()
  const serviceMenuItems = useServiceMenuItems()
  const servicePolicyMenuItems = isNewServiceCatalogEnabled
    ? [cosolidateServicePolicyMenuItems(serviceMenuItems, policyMenuItems)]
    : [policyMenuItems, serviceMenuItems]

  const menuItems = [
    useClientMenuItems(),
    useWiFiMenuItems(),
    useVenueItem(),
    useSwitchMenuItems(),
    ...servicePolicyMenuItems
  ].filter(item => item)

  if (menuItems.length === 0) return null

  return {
    expandIcon: <UI.MenuExpandArrow />,
    subMenuCloseDelay: 0.2,
    items: menuItems
  }
}

type ServicePolicyMenuItemType = Exclude<ItemType, null> & { labelText: string }

function isServicePolicyMenuItem (item: ItemType): item is ServicePolicyMenuItemType {
  return !!item && 'labelText' in item
}

function cosolidateServicePolicyMenuItems (serviceMenu: ItemType, policyMenu: ItemType): ItemType {
  const { $t } = getIntl()

  const allItems = [serviceMenu, policyMenu]
    .flatMap(menu =>
      menu && 'children' in menu && Array.isArray(menu.children)
        ? menu.children
        : []
    )
    .filter(isServicePolicyMenuItem)
    .sort((a, b) => a.labelText.localeCompare(b.labelText))

  return {
    key: 'add-unified-services',
    label: $t({ defaultMessage: 'Services' }),
    children: allItems
  }
}

export function usePolicyMenuItems (): ItemType {
  const visibilityMap = useConfigTemplateVisibilityMap()
  const { $t } = useIntl()

  const menuItems = {
    key: 'add-policy',
    label: $t({ defaultMessage: 'Policies' }),
    children: [
      createPolicyMenuItem(ConfigTemplateType.ACCESS_CONTROL, visibilityMap),
      createPolicyMenuItem(ConfigTemplateType.ROGUE_AP_DETECTION, visibilityMap),
      createPolicyMenuItem(ConfigTemplateType.SYSLOG, visibilityMap),
      createPolicyMenuItem(ConfigTemplateType.VLAN_POOL, visibilityMap),
      createPolicyMenuItem(ConfigTemplateType.RADIUS, visibilityMap),
      createPolicyMenuItem(ConfigTemplateType.ETHERNET_PORT_PROFILE, visibilityMap)
    ]
  }

  return menuItems.children.filter(item => item).length > 0 ? menuItems : null
}

export function createPolicyMenuItem (
  configTemplateType: ConfigTemplateType,
  visibilityMap: Record<ConfigTemplateType, boolean>
): null | ServicePolicyMenuItemType {
  const { $t } = getIntl()
  const policyType = configTemplatePolicyTypeMap[configTemplateType]

  if (!visibilityMap[configTemplateType]
    || !policyType
    || !hasConfigTemplateAllowedOperation(configTemplateType, 'Create')
  ) return null

  const labelNode = <PolicyConfigTemplateLink type={policyType} oper={PolicyOperation.CREATE}>
    {$t(policyTypeLabelMapping[policyType])}
  </PolicyConfigTemplateLink>

  return {
    key: `add-${configTemplateType}`,
    label: labelNode,
    labelText: $t(policyTypeLabelMapping[policyType])
  }
}

export function useServiceMenuItems (): ItemType {
  const visibilityMap = useConfigTemplateVisibilityMap()
  const { $t } = useIntl()

  const menuItems = {
    key: 'add-service',
    label: $t({ defaultMessage: 'Services' }),
    children: [
      createServiceMenuItem(ConfigTemplateType.DPSK, visibilityMap),
      createServiceMenuItem(ConfigTemplateType.DHCP, visibilityMap),
      createServiceMenuItem(ConfigTemplateType.PORTAL, visibilityMap),
      createServiceMenuItem(ConfigTemplateType.WIFI_CALLING, visibilityMap)
    ]
  }

  return menuItems.children.filter(item => item).length > 0 ? menuItems : null
}

export function createServiceMenuItem (
  configTemplateType: ConfigTemplateType,
  visibilityMap: Record<ConfigTemplateType, boolean>
): null | ServicePolicyMenuItemType {
  const { $t } = getIntl()
  const serviceType = configTemplateServiceTypeMap[configTemplateType]

  if (!visibilityMap[configTemplateType]
    || !serviceType
    || !hasConfigTemplateAllowedOperation(configTemplateType, 'Create')
  ) return null

  const labelNode = <ServiceConfigTemplateLink type={serviceType} oper={ServiceOperation.CREATE}>
    {$t(serviceTypeLabelMapping[serviceType])}
  </ServiceConfigTemplateLink>

  return {
    key: `add-${configTemplateType}`,
    label: labelNode,
    labelText: $t(serviceTypeLabelMapping[serviceType])
  }
}

export function useSwitchMenuItems (): ItemType {
  const visibilityMap = useConfigTemplateVisibilityMap()
  const { $t } = getIntl()
  const isSwitchRegularAvailable = visibilityMap[ConfigTemplateType.SWITCH_REGULAR]
    && hasConfigTemplateAllowedOperation(ConfigTemplateType.SWITCH_REGULAR, 'Create')

  const isSwitchCliAvailable = visibilityMap[ConfigTemplateType.SWITCH_CLI]
    && hasConfigTemplateAllowedOperation(ConfigTemplateType.SWITCH_CLI, 'Create')

  if (!isSwitchRegularAvailable && !isSwitchCliAvailable) return null

  return {
    key: 'add-switch-profile',
    label: $t({ defaultMessage: 'Wired' }),
    children: [
      (isSwitchRegularAvailable ? {
        key: 'add-switch-regular-profile',
        label: <ConfigTemplateLink to='networks/wired/profiles/add'>
          {getConfigTemplateTypeLabel(ConfigTemplateType.SWITCH_REGULAR)}
        </ConfigTemplateLink>
      } : null),
      (isSwitchCliAvailable ? {
        key: 'add-switch-cli-profile',
        label: <ConfigTemplateLink to='networks/wired/profiles/cli/add'>
          {getConfigTemplateTypeLabel(ConfigTemplateType.SWITCH_CLI)}
        </ConfigTemplateLink>
      } : null)
    ]
  }
}

export function useWiFiMenuItems (): ItemType | null {
  const visibilityMap = useConfigTemplateVisibilityMap()
  const { $t } = getIntl()
  const isNetworkAvailable = visibilityMap[ConfigTemplateType.NETWORK]
    && hasConfigTemplateAllowedOperation(ConfigTemplateType.NETWORK, 'Create')

  const isApGroupAvailable = visibilityMap[ConfigTemplateType.AP_GROUP]
    && hasConfigTemplateAllowedOperation(ConfigTemplateType.AP_GROUP, 'Create')

  if (!isNetworkAvailable && !isApGroupAvailable) return null

  return {
    key: 'add-wifi-profile',
    label: $t({ defaultMessage: 'Wi-Fi' }),
    children: [
      (isNetworkAvailable ? {
        key: 'add-wifi-network',
        label: <ConfigTemplateLink to='networks/wireless/add'>
          {getConfigTemplateTypeLabel(ConfigTemplateType.NETWORK)}
        </ConfigTemplateLink>
      } : null),
      (isApGroupAvailable ? {
        key: 'add-ap-group',
        label: <ConfigTemplateLink to='devices/apgroups/add'>
          {getConfigTemplateTypeLabel(ConfigTemplateType.AP_GROUP)}
        </ConfigTemplateLink>
      } : null)
    ]
  }
}

export function useVenueItem (): ItemType | null {
  const visibilityMap = useConfigTemplateVisibilityMap()

  if (!visibilityMap[ConfigTemplateType.VENUE]
    || !hasConfigTemplateAllowedOperation(ConfigTemplateType.VENUE, 'Create')
  ) return null

  return {
    key: 'add-venue',
    label: <ConfigTemplateLink to='venues/add'>
      {getConfigTemplateTypeLabel(ConfigTemplateType.VENUE)}
    </ConfigTemplateLink>
  }
}

export function useClientMenuItems (): ItemType | null {
  const { $t } = getIntl()
  const visibilityMap = useConfigTemplateVisibilityMap()

  const isIdentityGroupAvailable = visibilityMap[ConfigTemplateType.IDENTITY_GROUP]
    && hasConfigTemplateAllowedOperation(ConfigTemplateType.IDENTITY_GROUP, 'Create')

  if (!isIdentityGroupAvailable) return null

  return {
    key: 'add-client',
    label: $t({ defaultMessage: 'Clients' }),
    children: [
      (isIdentityGroupAvailable ? {
        key: 'add-identity-group',
        label: <ConfigTemplateLink to='identityManagement/identityGroups/add'>
          {getConfigTemplateTypeLabel(ConfigTemplateType.IDENTITY_GROUP)}
        </ConfigTemplateLink>
      } : null)
    ]
  }
}
