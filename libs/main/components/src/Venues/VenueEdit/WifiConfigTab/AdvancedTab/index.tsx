import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, StepsFormLegacy }                   from '@acx-ui/components'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { useEnforcedStatus, usePathBasedOnConfigTemplate } from '@acx-ui/rc/components'
import {
  redirectPreviousPage,
  useConfigTemplate,
  VenueConfigTemplateUrlsInfo,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { useNavigate }          from '@acx-ui/react-router-dom'
import { hasAllowedOperations } from '@acx-ui/user'
import { getOpsApi }            from '@acx-ui/utils'

import { VenueEditContext, createAnchorSectionItem } from '../..'
import { useVenueConfigTemplateOpsApiSwitcher }      from '../../../venueConfigTemplateApiSwitcher'

import { AccessPointLED }   from './AccessPointLED'
import { AccessPointUSB }   from './AccessPointUSB'
import { ApManagementVlan } from './ApManagementVlan'
import { BssColoring }      from './BssColoring'
import { RebootTimeout }    from './RebootTimeout'


export interface ModelOption {
  label: string
  value: string
}

export interface AdvanceSettingContext {
  updateAccessPointLED?: (() => void),
  updateAccessPointUSB?: (() => void),
  updateBssColoring?: (() => void),
  updateApManagementVlan?: (() => void),
  updateRebootTimeout?: (() => void)
}

export function AdvancedTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = usePathBasedOnConfigTemplate('/venues/')
  const { isTemplate } = useConfigTemplate()
  const isAllowUseApUsbSupport = useIsSplitOn(Features.AP_USB_PORT_SUPPORT_TOGGLE)
  const supportApMgmgtVlan = useIsSplitOn(Features.VENUE_AP_MANAGEMENT_VLAN_TOGGLE)
  const isRebootTimeoutFFEnabled = useIsSplitOn(Features.WIFI_AP_REBOOT_TIMEOUT_WLAN_TOGGLE)
  const { getEnforcedStepsFormProps } = useEnforcedStatus()

  const bssColoringOpsApi = useVenueConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueBssColoring,
    VenueConfigTemplateUrlsInfo.updateVenueBssColoringRbac
  )

  const rebootTimeoutOpsApi = useVenueConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueRebootTimeout,
    VenueConfigTemplateUrlsInfo.updateVenueApRebootTimeoutSettings
  )

  const [
    isAllowEditVenueLed,
    isAllowEditVenueUsb,
    isAllowEditVenueBssColoring,
    isAllowEditVenueMgmtVlan,
    isAllowEditRebootTimeout
  ] = [
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateVenueLedOn)]),
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateVenueApUsbStatus)]),
    hasAllowedOperations([bssColoringOpsApi]),
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateVenueApManagementVlan)]),
    hasAllowedOperations([rebootTimeoutOpsApi])
  ]

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData,
    previousPath } = useContext(VenueEditContext)

  const anchorItems = [
    ...(!isTemplate ? [
      createAnchorSectionItem(
        $t({ defaultMessage: 'Access Point LEDs' }),
        'access-point-led',
        <div style={{ maxWidth: '465px' }}>
          <AccessPointLED isAllowEdit={isAllowEditVenueLed}/>
        </div>,
        'apLed'
      )
    ] : []),
    ...((isAllowUseApUsbSupport && !isTemplate) ? [
      createAnchorSectionItem(
        $t({ defaultMessage: 'Access Point USB Support' }),
        'access-point-usb',
        <div style={{ maxWidth: '465px' }}>
          <AccessPointUSB isAllowEdit={isAllowEditVenueUsb}/>
        </div>,
        'apUsb'
      )
    ] : []),
    createAnchorSectionItem(
      $t({ defaultMessage: 'BSS Coloring' }),
      'bss-coloring',
      <BssColoring isAllowEdit={isAllowEditVenueBssColoring} />,
      'bssColoring'
    ),
    ...((supportApMgmgtVlan && !isTemplate) ? [
      createAnchorSectionItem(
        $t({ defaultMessage: 'Access Point Management VLAN' }),
        'ap-mgmt-vlan',
        <ApManagementVlan isAllowEdit={isAllowEditVenueMgmtVlan} />,
        'apMgmtVlan'
      )
    ] : []),
    ...(isRebootTimeoutFFEnabled? [
      createAnchorSectionItem(
        $t({ defaultMessage: 'AP Auto-Reboot on GW Timeout' }),
        'ap-auto-reboot-on-gw-timeout',
        <RebootTimeout isAllowEdit={isAllowEditRebootTimeout} />,
        'apAutoRebootOnGwTimeout'
      )
    ] : [])
  ]



  const handleUpdateAllSettings = async () => {
    try {
      await editAdvancedContextData?.updateAccessPointLED?.()
      await editAdvancedContextData?.updateAccessPointUSB?.()
      await editAdvancedContextData?.updateBssColoring?.()
      await editAdvancedContextData?.updateApManagementVlan?.()
      await editAdvancedContextData?.updateRebootTimeout?.()

      setEditContextData({
        ...editContextData,
        unsavedTabKey: 'settings',
        isDirty: false,
        hasError: false
      })

      if (editAdvancedContextData) {
        const newData = { ...editAdvancedContextData }
        delete newData.updateAccessPointLED
        delete newData.updateAccessPointUSB
        delete newData.updateBssColoring
        delete newData.updateApManagementVlan
        delete newData.updateRebootTimeout
        setEditAdvancedContextData(newData)
      }

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsFormLegacy
      onFinish={handleUpdateAllSettings}
      onCancel={() =>
        redirectPreviousPage(navigate, previousPath, basePath)
      }
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
      {...getEnforcedStepsFormProps('StepsFormLegacy')}
    >
      <StepsFormLegacy.StepForm>
        <AnchorLayout items={anchorItems} offsetTop={60} waitForReady />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
