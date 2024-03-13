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

export function useAddTemplateMenuProps (): Omit<MenuProps, 'placement'> {
  const { $t } = useIntl()
  const visibilityMap = useConfigTemplateVisibilityMap()
  const policyMenuItems = usePolicyMenuItems()
  const serviceMenuItems = useServiceMenuItems()
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
        {$t({ defaultMessage: 'Venue' })}
      </ConfigTemplateLink>
    } : null),
    {
      key: 'add-policy',
      label: $t({ defaultMessage: 'Policies' }),
      children: policyMenuItems
    },
    {
      key: 'add-service',
      label: $t({ defaultMessage: 'Services' }),
      children: serviceMenuItems
    }
  ]

  return {
    expandIcon: <UI.MenuExpandArrow />,
    subMenuCloseDelay: 0.2,
    items: items
  }
}

function usePolicyMenuItems (): ItemType[] {
  return [
    usePolicyMenuItem(ConfigTemplateType.RADIUS),
    usePolicyMenuItem(ConfigTemplateType.ACCESS_CONTROL_SET),
    usePolicyMenuItem(ConfigTemplateType.VLAN_POOL)
  ]
}

function usePolicyMenuItem (configTemplateType: ConfigTemplateType): ItemType {
  const { $t } = useIntl()
  const visibilityMap = useConfigTemplateVisibilityMap()
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

function useServiceMenuItems (): ItemType[] {
  return [
    useServiceMenuItem(ConfigTemplateType.DPSK),
    useServiceMenuItem(ConfigTemplateType.DHCP)
  ]
}

function useServiceMenuItem (configTemplateType: ConfigTemplateType): ItemType {
  const { $t } = getIntl()
  const visibilityMap = useConfigTemplateVisibilityMap()
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
