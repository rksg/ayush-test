import { MenuProps } from 'antd'
import { ItemType }  from 'antd/lib/menu/hooks/useItems'
import { useIntl }   from 'react-intl'

import {
  ConfigTemplateLink, PolicyConfigTemplateLink,
  ServiceConfigTemplateLink, useConfigTemplateVisibilityMap
} from '@acx-ui/rc/components'
import {
  ConfigTemplateType, PolicyOperation, ServiceOperation,
  configTemplatePolicyTypeMap, configTemplateServiceTypeMap,
  policyTypeLabelMapping, serviceTypeLabelMapping
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import * as UI from './styledComponents'

type ItemTypeWithConfigTemplateType = ItemType & { configTemplateType?: ConfigTemplateType }

export function useAddTemplateMenuProps (): Omit<MenuProps, 'placement'> {
  const { $t } = useIntl()
  const policyMenuItems = usePolicyMenuItems()
  const serviceMenuItems = useServiceMenuItems()
  const items: ItemTypeWithConfigTemplateType[] = [
    {
      key: 'add-wifi-network',
      configTemplateType: ConfigTemplateType.NETWORK,
      label: <ConfigTemplateLink to='networks/wireless/add'>
        {$t({ defaultMessage: 'Wi-Fi Network' })}
      </ConfigTemplateLink>
    }, {
      key: 'add-venue',
      configTemplateType: ConfigTemplateType.VENUE,
      label: <ConfigTemplateLink to='venues/add'>
        {$t({ defaultMessage: 'Venue' })}
      </ConfigTemplateLink>
    }, {
      key: 'add-policy',
      label: $t({ defaultMessage: 'Policies' }),
      children: policyMenuItems
    }, {
      key: 'add-service',
      label: $t({ defaultMessage: 'Services' }),
      children: serviceMenuItems
    }
  ]
  const visibleItems = useFilterItemsByType(items)

  return {
    expandIcon: <UI.MenuExpandArrow />,
    subMenuCloseDelay: 0.2,
    items: visibleItems
  }
}

function useFilterItemsByType (menuItems: ItemTypeWithConfigTemplateType[]): ItemType[] {
  const visibilityMap = useConfigTemplateVisibilityMap()

  // eslint-disable-next-line max-len
  return menuItems.filter(item => !item.configTemplateType || visibilityMap[item.configTemplateType!])
}

function usePolicyMenuItems (): ItemType[] {
  const items = [
    createPolicyMenuItem(ConfigTemplateType.RADIUS),
    createPolicyMenuItem(ConfigTemplateType.ACCESS_CONTROL_SET),
    createPolicyMenuItem(ConfigTemplateType.VLAN_POOL)
  ]
  return useFilterItemsByType(items.filter(item => item) as ItemTypeWithConfigTemplateType[])
}

function createPolicyMenuItem (configTemplateType: ConfigTemplateType) {
  const { $t } = getIntl()
  const policyType = configTemplatePolicyTypeMap[configTemplateType]

  if (!policyType) return null

  const labelNode = <PolicyConfigTemplateLink type={policyType} oper={PolicyOperation.CREATE}>
    {$t(policyTypeLabelMapping[policyType])}
  </PolicyConfigTemplateLink>

  return createMenuItemWithConfigTemplateType(configTemplateType, labelNode)
}

function useServiceMenuItems (): ItemType[] {
  return [
    createServiceMenuItem(ConfigTemplateType.DPSK),
    createServiceMenuItem(ConfigTemplateType.DHCP)
  ]
}

function createServiceMenuItem (configTemplateType: ConfigTemplateType) {
  const { $t } = getIntl()
  const serviceType = configTemplateServiceTypeMap[configTemplateType]

  if (!serviceType) return null

  const labelNode = <ServiceConfigTemplateLink type={serviceType} oper={ServiceOperation.CREATE}>
    {$t(serviceTypeLabelMapping[serviceType])}
  </ServiceConfigTemplateLink>

  return createMenuItemWithConfigTemplateType(configTemplateType, labelNode)
}

// eslint-disable-next-line max-len
function createMenuItemWithConfigTemplateType (configTemplateType: ConfigTemplateType, label: React.ReactNode): ItemTypeWithConfigTemplateType {
  return {
    key: `add-${configTemplateType}`,
    configTemplateType,
    label
  }
}
