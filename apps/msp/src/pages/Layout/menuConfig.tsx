import { useContext } from 'react'

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
import { MspRbacUrlsInfo }                                 from '@acx-ui/msp/utils'
import { getConfigTemplatePath, hasConfigTemplateAccess }  from '@acx-ui/rc/utils'
import { TenantType }                                      from '@acx-ui/react-router-dom'
import { RolesEnum }                                       from '@acx-ui/types'
import { getUserProfile, hasAllowedOperations, hasRoles  } from '@acx-ui/user'
import { AccountType, getOpsApi  }                         from '@acx-ui/utils'

import HspContext from '../../HspContext'

export function useMenuConfig (tenantType: string, hasLicense: boolean, isDogfood?: boolean,
  isOnboardMsp?: boolean
) {
  const { $t } = useIntl()
  const { names: { brand } } = useBrand360Config()
  const brand360PLMEnabled = useIsTierAllowed(Features.MSP_HSP_360_PLM_FF)
  const isBrand360Enabled = useIsSplitOn(Features.MSP_BRAND_360) && brand360PLMEnabled
  const isDataStudioEnabled = useIsSplitOn(Features.MSP_DATA_STUDIO) && brand360PLMEnabled

  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isVar = tenantType === AccountType.VAR
  const isNonVarMSP = tenantType === AccountType.MSP_NON_VAR
  const isSupport = tenantType === 'SUPPORT'
  const isTechPartner =
  tenantType === AccountType.MSP_INTEGRATOR || tenantType === AccountType.MSP_INSTALLER
  const isInstaller = tenantType === AccountType.MSP_INSTALLER
  // eslint-disable-next-line max-len
  const isConfigTemplateEnabled = hasConfigTemplateAccess(useIsTierAllowed(TierFeatures.CONFIG_TEMPLATE), tenantType)
  const { rbacOpsApiEnabled } = getUserProfile()
  const hasPortalSettingPermission = rbacOpsApiEnabled
    ? ( (isOnboardMsp && hasAllowedOperations([getOpsApi(MspRbacUrlsInfo.updateMspLabel)])) ||
        (!isOnboardMsp && hasAllowedOperations([getOpsApi(MspRbacUrlsInfo.addMspLabel)])) )
    : isPrimeAdmin

  const {
    state
  } = useContext(HspContext)

  const { isHsp: isHspSupportEnabled } = state

  const mspCustomersMenu = {
    uri: '/dashboard/mspCustomers',
    tenantType: 'v' as TenantType,
    label: $t({ defaultMessage: 'MSP Customers' })
  }

  const recCustomerMenu = (!isHspSupportEnabled || isSupport ? [] : [{
    uri: '/dashboard/mspRecCustomers',
    tenantType: 'v' as TenantType,
    label: brand.includes('MDU') ? $t({ defaultMessage: 'MDU Properties' })
      : $t({ defaultMessage: 'Brand Properties' })
  }])

  const hspMspMenues = (isVar || isDogfood)
    ? []
    : (isHspSupportEnabled
      ? [...recCustomerMenu, mspCustomersMenu]
      : [ mspCustomersMenu, ...recCustomerMenu])

  return [
    ...(isHspSupportEnabled && isBrand360Enabled && !isInstaller ? [{
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
    ...(isHspSupportEnabled && isDataStudioEnabled && !isInstaller ? [{
      uri: '/dataStudio',
      label: $t({ defaultMessage: 'Data Studio' }),
      tenantType: 'v' as TenantType,
      inactiveIcon: DataStudioOutlined,
      activeIcon: DataStudioSolid
    }] : []),
    ...(isConfigTemplateEnabled
      ? [{
        uri: '/' + getConfigTemplatePath(),
        label: $t({ defaultMessage: 'Templates' }),
        tenantType: 'v' as TenantType,
        inactiveIcon: CopyOutlined,
        activeIcon: CopySolid
      }] : []),
    ...((!hasPortalSettingPermission || isTechPartner || isSupport || !hasLicense)
      ? [] : [{
        uri: '/portalSetting',
        label: $t({ defaultMessage: 'Portal Settings' }),
        tenantType: 'v' as TenantType,
        inactiveIcon: ConfigurationOutlined,
        activeIcon: ConfigurationSolid,
        adminItem: true
      }])
  ] as LayoutProps['menuConfig']
}
