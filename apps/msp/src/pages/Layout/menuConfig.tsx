import { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { LayoutProps }            from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
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
import { useGetTenantDetailQuery, useMspEntitlementListQuery }  from '@acx-ui/msp/services'
import { CONFIG_TEMPLATE_PATH_PREFIX, hasConfigTemplateAccess } from '@acx-ui/rc/utils'
import { TenantType }                                           from '@acx-ui/react-router-dom'
import { RolesEnum }                                            from '@acx-ui/types'
import { hasRoles, useUserProfileContext }                      from '@acx-ui/user'
import { AccountType, isDelegationMode }                        from '@acx-ui/utils'

export function useMenuConfig () {
  const { $t } = useIntl()
  const [tenantType, setTenantType] = useState('')
  const [hasLicense, setHasLicense] = useState(false)
  const [isDogfood, setDogfood] = useState(false)
  const params = useParams()

  const { data: userProfile } = useUserProfileContext()
  const { data: mspEntitlement } = useMspEntitlementListQuery({ params })
  const { data } = useGetTenantDetailQuery({ params })

  const nonVarDelegation = useIsSplitOn(Features.ANY_3RDPARTY_INVITE_TOGGLE)
  const isSupportToMspDashboardAllowed =
    useIsSplitOn(Features.SUPPORT_DELEGATE_MSP_DASHBOARD_TOGGLE) && isDelegationMode()
  const isHspSupportEnabled = useIsSplitOn(Features.MSP_HSP_SUPPORT)
  const isBrand360 = useIsSplitOn(Features.MSP_BRAND_360)

  useEffect(() => {
    if (data && userProfile) {
      const isRecDelegation = nonVarDelegation && data.tenantType === AccountType.REC
      if (!isSupportToMspDashboardAllowed &&
        (userProfile?.support || userProfile?.dogfood || isRecDelegation)) {
        setTenantType('SUPPORT')
      } else {
        setTenantType(data.tenantType)
      }
      setDogfood((userProfile?.dogfood && !userProfile?.support) || isRecDelegation)
    }
    if (mspEntitlement?.length && mspEntitlement?.length > 0) {
      setHasLicense(true)
    }
  }, [data, userProfile, mspEntitlement])

  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isVar = tenantType === AccountType.VAR
  const isNonVarMSP = tenantType === AccountType.MSP_NON_VAR
  const isSupport = tenantType === 'SUPPORT'
  const isIntegrator =
  tenantType === AccountType.MSP_INTEGRATOR || tenantType === AccountType.MSP_INSTALLER
  // eslint-disable-next-line max-len
  const isConfigTemplateEnabled = hasConfigTemplateAccess(useIsSplitOn(Features.CONFIG_TEMPLATE), tenantType)

  const config: LayoutProps['menuConfig'] = [
    ...(isBrand360 ? [{
      uri: '/brand360',
      label: $t({ defaultMessage: 'Brand 360' }),
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
        ...(!isHspSupportEnabled || isSupport ? [] : [{
          uri: '/dashboard/mspRecCustomers',
          tenantType: 'v' as TenantType,
          label: $t({ defaultMessage: 'RUCKUS End Customers' })
        }])
        ]),
        ...((isNonVarMSP || isIntegrator) ? [] : [{
          uri: '/dashboard/varCustomers',
          tenantType: 'v' as TenantType,
          label: isSupport
            ? $t({ defaultMessage: 'RUCKUS Customers' })
            : $t({ defaultMessage: 'VAR Customers' })
        }])
      ]
    },
    ...((isVar || isIntegrator || isSupport) ? [] : [{
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
    ...((isIntegrator || isSupport)? [] : [{
      uri: '/mspLicenses',
      label: $t({ defaultMessage: 'Subscriptions' }),
      tenantType: 'v' as TenantType,
      inactiveIcon: MspSubscriptionOutlined,
      activeIcon: MspSubscriptionSolid
    }]),
    ...(isConfigTemplateEnabled
      ? [{
        uri: `/${CONFIG_TEMPLATE_PATH_PREFIX}`,
        label: $t({ defaultMessage: 'Config Templates' }),
        tenantType: 'v' as TenantType,
        inactiveIcon: CopyOutlined,
        activeIcon: CopySolid
      }] : []),
    ...((!isPrimeAdmin || isIntegrator || isSupport || !hasLicense)
      ? [] : [{
        uri: '/portalSetting',
        label: $t({ defaultMessage: 'Settings' }),
        tenantType: 'v' as TenantType,
        inactiveIcon: ConfigurationOutlined,
        activeIcon: ConfigurationSolid,
        adminItem: true
      }])
  ]
  return config
}
