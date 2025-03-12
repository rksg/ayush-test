import { useContext } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { StepsFormLegacy }                        from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { redirectPreviousPage, WifiRbacUrlsInfo } from '@acx-ui/rc/utils'
import { useTenantLink }                          from '@acx-ui/react-router-dom'
import { hasAllowedOperations }                   from '@acx-ui/user'
import { getOpsApi }                              from '@acx-ui/utils'

import { ApDataContext, ApEditContext } from '..'

import { ApLed }                from './ApLed'
import { ApManagementVlanForm } from './ApManagementVlan'
import { ApUsb }                from './ApUsb'
import { BssColoring }          from './BssColoring'



export interface ApAdvancedContext {
  updateApLed?: (data?: unknown) => void | Promise<void>
  discardApLedChanges?: (data?: unknown) => void | Promise<void>

  updateApUsb?: (data?: unknown) => void | Promise<void>
  discardApUsbChanges?: (data?: unknown) => void | Promise<void>

  updateBssColoring?: (data?: unknown) => void | Promise<void>
  discardBssColoringChanges?: (data?: unknown) => void | Promise<void>

  updateApManagementVlan?: (data?: unknown) => void | Promise<void>
  discardApManagementVlan?: (data?: unknown) => void | Promise<void>
}

export function AdvancedTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const [
    isAllowEditApLed,
    isAllowEditApUsb,
    isAllowEditApBssColoring,
    isAllowEditApMgmtVlan
  ] = [
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateApLed)]),
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateApUsb)]),
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateApBssColoring)]),
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateApManagementVlan)])
  ]


  const {
    previousPath,
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(ApEditContext)

  const { apCapabilities } = useContext(ApDataContext)

  const supportApMgmtVlan = useIsSplitOn(Features.AP_MANAGEMENT_VLAN_AP_LEVEL_TOGGLE)
  const isAllowUseApUsbSupport = useIsSplitOn(Features.AP_USB_PORT_SUPPORT_TOGGLE)
  const isApModelSupportUsb = apCapabilities?.usbPowerEnable

  const apLedTitle = $t({ defaultMessage: 'Access Point LEDs' })
  const apUsbTitle = $t({ defaultMessage: 'Access Point USB Support' })
  const bssColoringTitle = $t({ defaultMessage: 'BSS Coloring' })
  const apMgmtVlanTitle = $t({ defaultMessage: 'Access Point Management VLAN' })

  const anchorItems = [
    {
      title: apLedTitle,
      key: 'apLed',
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='ap-led'>
            { apLedTitle }
          </StepsFormLegacy.SectionTitle>
          <ApLed isAllowEdit={isAllowEditApLed}/>
        </>
      )
    },
    ...((isAllowUseApUsbSupport && isApModelSupportUsb)? [{
      title: apUsbTitle,
      key: 'apUsb',
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='ap-usb'>
            { apUsbTitle }
          </StepsFormLegacy.SectionTitle>
          <ApUsb isAllowEdit={isAllowEditApUsb} />
        </>
      )

    }] : []),
    ...(apCapabilities?.support11AX? [{
      title: bssColoringTitle,
      key: 'bssColoring',
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='bss-coloring'>
            { bssColoringTitle }
          </StepsFormLegacy.SectionTitle>
          <BssColoring isAllowEdit={isAllowEditApBssColoring} />
        </>
      )

    }] : []),
    ...(supportApMgmtVlan? [{
      title: apMgmtVlanTitle,
      key: 'apMgmtVlan',
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='ap-mgmt-vlan'>
            { apMgmtVlanTitle }
          </StepsFormLegacy.SectionTitle>
          <ApManagementVlanForm isAllowEdit={isAllowEditApMgmtVlan} />
        </>
      )

    }] : [])
  ]

  const resetEditContextData = () => {
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'advanced',
      isDirty: false
    })

    if (editAdvancedContextData) {
      const newData = { ...editAdvancedContextData }
      delete newData.updateApLed
      delete newData.discardApLedChanges
      delete newData.updateApUsb
      delete newData.discardApUsbChanges
      delete newData.updateBssColoring
      delete newData.discardBssColoringChanges
      delete newData.updateApManagementVlan
      delete newData.discardApManagementVlan
      setEditAdvancedContextData(newData)
    }
  }

  const handleUpdateSetting = async (redirect?: boolean) => {

    try {
      await editAdvancedContextData.updateApLed?.()
      await editAdvancedContextData.updateApUsb?.()
      await editAdvancedContextData.updateBssColoring?.()
      await editAdvancedContextData.updateApManagementVlan?.()

      resetEditContextData()

      if (redirect) {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/wifi/${params.serialNumber}/details/overview`
        })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleDiscardChanges = async () => {
    try {
      await editAdvancedContextData.discardApLedChanges?.()
      await editAdvancedContextData.discardApUsbChanges?.()
      await editAdvancedContextData.discardBssColoringChanges?.()
      await editAdvancedContextData.discardApManagementVlan?.()

      resetEditContextData()

      redirectPreviousPage(navigate, previousPath, basePath)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsFormLegacy
      onFinish={() => handleUpdateSetting(false)}
      onCancel={() => handleDiscardChanges()}
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
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
