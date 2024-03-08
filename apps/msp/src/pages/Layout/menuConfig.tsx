import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Settings, useBrand360Names }               from '@acx-ui/analytics/utils'
import { LayoutProps }                              from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  ConfigurationOutlined,
  ConfigurationSolid,
  DevicesOutlined,
  DevicesSolid,
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
import { useIntegratorCustomerListQuery }                 from '@acx-ui/msp/services'
import { getConfigTemplatePath, hasConfigTemplateAccess } from '@acx-ui/rc/utils'
import { TenantType, useParams }                          from '@acx-ui/react-router-dom'
import { RolesEnum }                                      from '@acx-ui/types'
import { hasRoles  }                                      from '@acx-ui/user'
import { AccountType  }                                   from '@acx-ui/utils'

export function useMenuConfig (tenantType: string, hasLicense: boolean,
  isDogfood?: boolean, parentMspId?: string, settings?: Partial<Settings>) {
  const { $t } = useIntl()
  const isHspPlmFeatureOn = useIsTierAllowed(Features.MSP_HSP_PLM_FF)
  const isHspSupportEnabled = useIsSplitOn(Features.MSP_HSP_SUPPORT) && isHspPlmFeatureOn
  const isBrand360 = useIsSplitOn(Features.MSP_BRAND_360)
  const { brand } = useBrand360Names(settings)
  const [hideMenuesforHsp, setHideMenuesforHsp] = useState<boolean>(false)

  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isVar = tenantType === AccountType.VAR
  const isNonVarMSP = tenantType === AccountType.MSP_NON_VAR
  const isSupport = tenantType === 'SUPPORT'
  const isTechPartner =
  tenantType === AccountType.MSP_INTEGRATOR || tenantType === AccountType.MSP_INSTALLER
  const isInstaller = tenantType === AccountType.MSP_INSTALLER
  // eslint-disable-next-line max-len
  const isConfigTemplateEnabled = hasConfigTemplateAccess(useIsSplitOn(Features.CONFIG_TEMPLATE), tenantType)

  const integratorPayload = {
    searchString: '',
    filters: {
      mspTenantId: [parentMspId],
      tenantType: [AccountType.MSP_REC]
    },
    fields: [
      'check-all',
      'id',
      'name',
      'tenantType',
      'status',
      'alarmCount',
      'mspAdminCount',
      'mspEcAdminCount',
      'mspInstallerAdminCount',
      'mspIntegratorAdminCount',
      'creationDate',
      'expirationDate',
      'wifiLicense',
      'switchLicense',
      'streetAddress'
    ],
    searchTargetFields: [
      'name'
    ],
    page: 1,
    pageSize: 10,
    defaultPageSize: 10,
    total: 0,
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const params = useParams()

  // for now acx_account_vetical is not available in jwt of LSP tenant so for temp fix
  // we are having these checks for moe details check ACX-52099

  const { data: integratorListData } = useIntegratorCustomerListQuery({
    params, payload: integratorPayload },
  { skip: !isTechPartner })
  useEffect(() => {
    // if account is not tech partner (integrator / installer) / LSP
    // then will have FF check else we will call useIntegratorCustomerListQuery
    // and will check if data is available and based on that will show and hide
    // Brand 360 and RUCKUS END Customer menue options
    if (isTechPartner) {
      setHideMenuesforHsp(!integratorListData?.data?.length)
    } else {
      setHideMenuesforHsp(!isHspSupportEnabled)
    }
  }, [isHspSupportEnabled, isTechPartner, integratorListData])

  return [
    ...(!hideMenuesforHsp && isBrand360 && !isInstaller ? [{
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
        ...(isVar || isDogfood ? [] : [{
          uri: '/dashboard/mspCustomers',
          tenantType: 'v' as TenantType,
          label: $t({ defaultMessage: 'MSP Customers' })
        },
        ...(hideMenuesforHsp || isSupport ? [] : [{
          uri: '/dashboard/mspRecCustomers',
          tenantType: 'v' as TenantType,
          label: $t({ defaultMessage: 'RUCKUS End Customers' })
        }])
        ]),
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
