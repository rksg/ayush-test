import { useIntl } from 'react-intl'

import { useBrand360Config }                                      from '@acx-ui/analytics/services'
import { LayoutProps }                                            from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  ConfigurationOutlined,
  ConfigurationSolid,
  DevicesOutlined,
  DevicesSolid,
  DataStudioOutlined,
  DataStudioSolid,
  MspSubscriptionOutlined,
  MspSubscriptionSolid,
  IntegratorsOutlined,
  IntegratorsSolid,
  UsersThreeOutlined,
  UsersThreeSolid,
  CopyOutlined,
  CopySolid,
  SpeedIndicatorSolid,
  SpeedIndicatorOutlined
} from '@acx-ui/icons'
import { useHospitalityVerticalCheck }                    from '@acx-ui/msp/services'
import { getConfigTemplatePath, hasConfigTemplateAccess } from '@acx-ui/rc/utils'
import { TenantType, useParams }                          from '@acx-ui/react-router-dom'
import { RolesEnum }                                      from '@acx-ui/types'
import { hasRoles  }                                      from '@acx-ui/user'
import { AccountType  }                                   from '@acx-ui/utils'

export function useMenuConfig (tenantType: string, hasLicense: boolean,
  isDogfood?: boolean, parentMspId?: string) {
  const { $t } = useIntl()
  const params = useParams()
  const { names: { brand } } = useBrand360Config()
  const isHspPlmFeatureOn = useIsTierAllowed(Features.MSP_HSP_PLM_FF)
  const isHspSupportEnabled = useIsSplitOn(Features.MSP_HSP_SUPPORT) && isHspPlmFeatureOn
  const isBrand360Enabled = useIsSplitOn(Features.MSP_BRAND_360)

  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isVar = tenantType === AccountType.VAR
  const isNonVarMSP = tenantType === AccountType.MSP_NON_VAR
  const isSupport = tenantType === 'SUPPORT'
  const isTechPartner =
  tenantType === AccountType.MSP_INTEGRATOR || tenantType === AccountType.MSP_INSTALLER
  const isInstaller = tenantType === AccountType.MSP_INSTALLER
  // eslint-disable-next-line max-len
  const isConfigTemplateEnabled = hasConfigTemplateAccess(useIsTierAllowed(TierFeatures.BETA_CONFIG_TEMPLATE), tenantType)

  const showMenuesforHsp =
  useHospitalityVerticalCheck(parentMspId as string, tenantType as string, params)


  const mspCustomersMenu = {
    uri: '/dashboard/mspCustomers',
    tenantType: 'v' as TenantType,
    label: $t({ defaultMessage: 'MSP Customers' })
  }

  const recCustomerMenu = (!showMenuesforHsp || isSupport ? [] : [{
    uri: '/dashboard/mspRecCustomers',
    tenantType: 'v' as TenantType,
    label: isHspSupportEnabled ? $t({ defaultMessage: 'Brand Properties' })
      : $t({ defaultMessage: 'RUCKUS End Customers' })
  }])

  const hspMspMenues = (isVar || isDogfood)
    ? []
    : (isHspSupportEnabled
      ? [...recCustomerMenu, mspCustomersMenu]
      : [ mspCustomersMenu, ...recCustomerMenu])

  return [
    ...(showMenuesforHsp && isBrand360Enabled && !isInstaller ? [{
      uri: '/brand360',
      label: brand,
      tenantType: 'v' as TenantType,
      inactiveIcon: SpeedIndicatorOutlined,
      activeIcon: SpeedIndicatorSolid
    }] : []),
    {
      label: $t({ defaultMessage: 'My Customers' }),
      inactiveIcon: UsersThreeOutlined,
      activeIcon: UsersThreeSolid,
      children: [
        ...hspMspMenues,
        ...((isNonVarMSP || isTechPartner) ? [] : [{
          uri: '/dashboard/varCustomers',
          tenantType: 'v' as TenantType,
          label: isSupport
            ? $t({ defaultMessage: 'RUCKUS Customers' })
            : $t({ defaultMessage: 'VAR Customers' })
        }])
      ]
    },
    ...((isVar || isTechPartner || isSupport) ? [] : [{
      uri: '/integrators',
      label: $t({ defaultMessage: 'Tech Partners' }),
      tenantType: 'v' as TenantType,
      inactiveIcon: IntegratorsOutlined,
      activeIcon: IntegratorsSolid
    }]),
    ...(isSupport ? [] : [{
      uri: '/deviceInventory',
      label: $t({ defaultMessage: 'Device Inventory' }),
      tenantType: 'v' as TenantType,
      inactiveIcon: DevicesOutlined,
      activeIcon: DevicesSolid
    }]),
    ...((isTechPartner || isSupport)? [] : [{
      uri: '/mspLicenses',
      label: $t({ defaultMessage: 'Subscriptions' }),
      tenantType: 'v' as TenantType,
      inactiveIcon: MspSubscriptionOutlined,
      activeIcon: MspSubscriptionSolid
    }]),
    ...(showMenuesforHsp && isBrand360Enabled && !isInstaller ? [{
      uri: '/dataStudio',
      label: $t({ defaultMessage: 'Data Studio' }),
      tenantType: 'v' as TenantType,
      inactiveIcon: DataStudioOutlined,
      activeIcon: DataStudioSolid
    }] : []),
    ...(isConfigTemplateEnabled
      ? [{
        uri: '/' + getConfigTemplatePath(),
        label: $t({ defaultMessage: 'Config Templates' }),
        tenantType: 'v' as TenantType,
        inactiveIcon: CopyOutlined,
        activeIcon: CopySolid
      }] : []),
    ...((!isPrimeAdmin || isTechPartner || isSupport || !hasLicense)
      ? [] : [{
        uri: '/portalSetting',
        label: $t({ defaultMessage: 'Settings' }),
        tenantType: 'v' as TenantType,
        inactiveIcon: ConfigurationOutlined,
        activeIcon: ConfigurationSolid,
        adminItem: true
      }])
  ] as LayoutProps['menuConfig']
}
