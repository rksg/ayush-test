import { useContext, useEffect, useRef } from 'react'

import { useIntl } from 'react-intl'

import { Tabs }                                            from '@acx-ui/components'
import { Features, useIsTierAllowed }                      from '@acx-ui/feature-toggle'
import { useEnforcedStatus, usePathBasedOnConfigTemplate } from '@acx-ui/rc/components'
import {
  CommonUrlsInfo,
  useConfigTemplate,
  WifiRbacUrlsInfo,
  type LocationExtended,
  PropertyUrlsInfo,
  ConfigTemplateType
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams,
  UNSAFE_NavigationContext as NavigationContext
} from '@acx-ui/react-router-dom'
import { RolesEnum, SwitchScopes, WifiScopes } from '@acx-ui/types'
import {
  getUserProfile,
  hasAllowedOperations,
  hasPermission,
  hasRoles,
  isCoreTier
}             from '@acx-ui/user'
import { getOpsApi } from '@acx-ui/utils'

import { VenueEditContext, EditContext, showUnsavedModal } from './index'

import type { History, Transition } from 'history'

function VenueEditTabs () {
  const intl = useIntl()
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const baseEditPath = usePathBasedOnConfigTemplate(`/venues/${params.venueId}/edit/`)
  const { setPreviousPath, ...venueEditTabContext } = useContext(VenueEditContext)
  const { editContextData, setEditContextData } = venueEditTabContext
  const { hasEnforcedFieldsFromContext } = useEnforcedStatus(ConfigTemplateType.VENUE)
  const enablePropertyManagement = usePropertyManagementEnabled()


  const onTabChange = (tab: string) => {
    if (tab === 'wifi') tab = `${tab}/radio`
    if (tab === 'switch') tab = `${tab}/general`

    setEditContextData({} as EditContext)
    navigate({
      ...baseEditPath,
      pathname: `${baseEditPath.pathname}/${tab}`
    })
  }

  const { rbacOpsApiEnabled } = getUserProfile()
  const { navigator } = useContext(NavigationContext)
  const blockNavigator = navigator as History
  const unblockRef = useRef<Function>()

  useEffect(() => {
    if (hasEnforcedFieldsFromContext() && editContextData.isDirty) {
      unblockRef.current?.()
      setEditContextData({
        ...editContextData,
        isDirty: false
      })
      return
    }

    if (editContextData.isDirty) {
      unblockRef.current?.()
      unblockRef.current = blockNavigator.block((tx: Transition) => {
        if (tx.location.hash) {
          return
        }

        // do not trigger modal twice
        setEditContextData({
          ...editContextData,
          isDirty: false
        })

        showUnsavedModal({
          ...venueEditTabContext,
          callback: tx.retry
        })
      })
    } else {
      unblockRef.current?.()
    }
  }, [editContextData])

  useEffect(() => {
    setPreviousPath((location as LocationExtended)?.state?.from?.pathname )
  }, [])

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      {(
        rbacOpsApiEnabled ?
          hasAllowedOperations([getOpsApi(CommonUrlsInfo.updateVenue)]):
          hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
      ) &&
        <Tabs.TabPane
          tab={intl.$t({ defaultMessage: '<VenueSingular></VenueSingular> Details' })}
          key='details' />
      }
      {
        hasPermission({
          scopes: [WifiScopes.UPDATE],
          rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.updateVenueRadioCustomization)]
        }) &&
        <Tabs.TabPane tab={intl.$t({ defaultMessage: 'Wi-Fi Configuration' })} key='wifi' />
      }
      {hasPermission({
        scopes: [SwitchScopes.UPDATE],
        rbacOpsIds: [getOpsApi(CommonUrlsInfo.updateVenueSwitchSetting)]
      }) &&
        <Tabs.TabPane
          key='switch'
          tab={intl.$t({ defaultMessage: 'Switch Configuration' })}
        />
      }
      { enablePropertyManagement &&
        <Tabs.TabPane
          tab={intl.$t({ defaultMessage: 'Property Management' })}
          key='property'
        />}
    </Tabs>
  )
}

export default VenueEditTabs

export function usePropertyManagementEnabled () {
  const { rbacOpsApiEnabled } = getUserProfile()
  const enablePropertyManagement = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const { isTemplate } = useConfigTemplate()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const hasPropertyManagementPermission =
    rbacOpsApiEnabled
      ? hasAllowedOperations([
        getOpsApi(PropertyUrlsInfo.updatePropertyConfigs),
        getOpsApi(PropertyUrlsInfo.patchPropertyConfigs)
      ])
      : hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  return enablePropertyManagement && !isTemplate && hasPropertyManagementPermission && !isCore
}
