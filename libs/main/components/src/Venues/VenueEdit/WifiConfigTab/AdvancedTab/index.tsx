import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { StepsFormLegacy }                         from '@acx-ui/components'
import { Features, useIsSplitOn }                  from '@acx-ui/feature-toggle'
import { usePathBasedOnConfigTemplate }            from '@acx-ui/rc/components'
import { redirectPreviousPage, useConfigTemplate } from '@acx-ui/rc/utils'
import { useNavigate }                             from '@acx-ui/react-router-dom'

import { VenueEditContext, createAnchorSectionItem } from '../..'

import { AccessPointLED }   from './AccessPointLED'
import { AccessPointUSB }   from './AccessPointUSB'
import { ApManagementVlan } from './ApManagementVlan'
import { BssColoring }      from './BssColoring'


export interface ModelOption {
  label: string
  value: string
}

export interface AdvanceSettingContext {
  updateAccessPointLED?: (() => void),
  updateAccessPointUSB?: (() => void),
  updateBssColoring?: (() => void),
  updateApManagementVlan?: (() => void)
}

export function AdvancedTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = usePathBasedOnConfigTemplate('/venues/')
  const { isTemplate } = useConfigTemplate()
  const isAllowUseApUsbSupport = useIsSplitOn(Features.AP_USB_PORT_SUPPORT_TOGGLE)

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData,
    previousPath } = useContext(VenueEditContext)


  const supportApMgmgtVlan = useIsSplitOn(Features.VENUE_AP_MANAGEMENT_VLAN_TOGGLE)

  const anchorItems = [
    ...(!isTemplate ? [
      createAnchorSectionItem(
        $t({ defaultMessage: 'Access Point LEDs' }),
        'access-point-led',
        <div style={{ maxWidth: '465px' }}><AccessPointLED /></div>,
        'apLed'
      )
    ] : []),
    ...((isAllowUseApUsbSupport && !isTemplate) ? [
      createAnchorSectionItem(
        $t({ defaultMessage: 'Access Point USB Support' }),
        'access-point-usb',
        <div style={{ maxWidth: '465px' }}><AccessPointUSB /></div>,
        'apUsb'
      )
    ] : []),
    createAnchorSectionItem(
      $t({ defaultMessage: 'BSS Coloring' }),
      'bss-coloring',
      <BssColoring />,
      'bssColoring'
    ),
    ...((supportApMgmgtVlan && !isTemplate) ? [
      createAnchorSectionItem(
        $t({ defaultMessage: 'Access Point Management VLAN' }),
        'ap-mgmt-vlan',
        <ApManagementVlan />,
        'apMgmtVlan'
      )
    ] : [])
  ]



  const handleUpdateAllSettings = async () => {
    try {
      await editAdvancedContextData?.updateAccessPointLED?.()
      await editAdvancedContextData?.updateAccessPointUSB?.()
      await editAdvancedContextData?.updateBssColoring?.()
      await editAdvancedContextData?.updateApManagementVlan?.()

      setEditContextData({
        ...editContextData,
        unsavedTabKey: 'settings',
        isDirty: false
      })

      if (editAdvancedContextData) {
        const newData = { ...editAdvancedContextData }
        delete newData.updateAccessPointLED
        delete newData.updateAccessPointUSB
        delete newData.updateBssColoring
        delete newData.updateApManagementVlan
        setEditAdvancedContextData(newData)
      }

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsFormLegacy
      onFinish={() => handleUpdateAllSettings()}
      onCancel={() =>
        redirectPreviousPage(navigate, previousPath, basePath)
      }
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsFormLegacy.StepForm>
        {/*
        <AnchorLayout items={anchorItems} offsetTop={60} />
        */}
        {
          anchorItems.map(item => (
            <div key={item.key} style={{ paddingBottom: '50px' }}>
              {item.content}
            </div>))
        }
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
