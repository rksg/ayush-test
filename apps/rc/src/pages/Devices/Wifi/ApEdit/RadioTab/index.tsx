import { useContext } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { AnchorLayout, StepsFormLegacy, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }             from '@acx-ui/icons'
import { redirectPreviousPage, WifiRbacUrlsInfo } from '@acx-ui/rc/utils'
import { useTenantLink }                          from '@acx-ui/react-router-dom'
import { hasAllowedOperations }                   from '@acx-ui/user'
import { getOpsApi }                              from '@acx-ui/utils'

import { ApDataContext, ApEditContext } from '..'

import { AntennaSection }                 from './Antenna/AntennaSection'
import { ClientAdmissionControlSettings } from './ClientAdmissionControlSettings/ClientAdmissionControlSettings'
import { ClientSteering }                 from './ClientSteering/ClientSteering'
import { RadioSettings }                  from './RadioSettings/RadioSettings'

export interface ApRadioContext {
  updateWifiRadio?: (data?: unknown) => void | Promise<void>
  discardWifiRadioChanges?: (data?: unknown) => void | Promise<void>

  updateClientSteering?: (data?: unknown) => void | Promise<void>
  discardClientSteeringChanges?: (data?: unknown) => void | Promise<void>

  updateClientAdmissionControl?: (data?: unknown) => void | Promise<void>
  discardClientAdmissionControlChanges?: (data?: unknown) => void | Promise<void>

  updateExternalAntenna?: (data?: unknown) => void | Promise<void>
  discardExternalAntennaChanges?: (data?: unknown) => void | Promise<void>

  updateApAntennaType?: (data?: unknown) => void | Promise<void>
  discardApAntennaTypeChanges?: (data?: unknown) => void | Promise<void>

}

export function RadioTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const [
    isAllowEditRadioSettings,
    isAllowEditClientSteering,
    isAllowEditClientAdmissionControl
  ] = [
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateApRadioCustomization)]),
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateApStickyClientSteering)]),
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateApClientAdmissionControl)])
  ]

  const {
    previousPath,
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(ApEditContext)

  const { apCapabilities } = useContext(ApDataContext)

  const isAntTypeAP = (apCapabilities?.supportAntennaType) === true
  // waiting for the feature is implemented and useing feature flag to control
  const supportAntTypeSelection = useIsSplitOn(Features.WIFI_ANTENNA_TYPE_TOGGLE) && isAntTypeAP
  const supportAntenna = supportAntTypeSelection
  const isStickyClientSteeringEnable = useIsSplitOn(Features.WIFI_AP_STICKY_CLIENT_STEERING_TOGGLE)

  const wifiRadioLink = $t({ defaultMessage: 'Wi-Fi Radio' })
  const wifiRadioTitle = $t({ defaultMessage: 'Wi-Fi Radio Settings' })
  const clientAdmissionCtlTitle = $t({ defaultMessage: 'Client Admission Control' })
  const antennaTitle = $t({ defaultMessage: 'Antenna' })
  const clientSteeringTitle = $t({ defaultMessage: 'Client Steering' })

  const anchorItems = [{
    title: wifiRadioLink,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='radio-settings'>
          { wifiRadioTitle }
        </StepsFormLegacy.SectionTitle>
        <RadioSettings isAllowEdit={isAllowEditRadioSettings} />
      </>
    )
  },
  ...(isStickyClientSteeringEnable ? [{
    title: clientSteeringTitle,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='client-steering'>
          { clientSteeringTitle }
        </StepsFormLegacy.SectionTitle>
        <ClientSteering isAllowEdit={isAllowEditClientSteering} />
      </>
    )
  }] : []),
  {
    title: clientAdmissionCtlTitle,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='client-Admission'>
          { clientAdmissionCtlTitle }
          <Tooltip
            title={$t({ defaultMessage: 'APs adaptively allow or deny new client connections '+
              'based on the connectivity thresholds set per radio.' })}
            placement='right'>
            <QuestionMarkCircleOutlined style={{ height: '18px', marginBottom: -3 }}
            />
          </Tooltip>
        </StepsFormLegacy.SectionTitle>
        {
          <ClientAdmissionControlSettings isAllowEdit={isAllowEditClientAdmissionControl} />
        }
      </>
    )
  },
  ...(supportAntenna? [{
    title: antennaTitle,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='antenna'>
          { antennaTitle }
        </StepsFormLegacy.SectionTitle>
        {
          <AntennaSection />
        }
      </>
    )
  }]: [])
  ]

  const resetEditContextData = () => {
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'radio',
      isDirty: false
    })

    if (editRadioContextData) {
      const newData = { ...editRadioContextData }
      delete newData.updateWifiRadio
      delete newData.discardWifiRadioChanges
      delete newData.updateClientAdmissionControl
      delete newData.discardClientAdmissionControlChanges
      delete newData.updateExternalAntenna
      delete newData.discardExternalAntennaChanges
      delete newData.updateApAntennaType
      delete newData.discardApAntennaTypeChanges
      delete newData.updateClientSteering
      delete newData.discardClientSteeringChanges

      setEditRadioContextData(newData)
    }
  }

  const handleUpdateSetting = async (redirect?: boolean) => {
    try {
      await editRadioContextData.updateWifiRadio?.()
      await editRadioContextData.updateClientAdmissionControl?.()
      await editRadioContextData.updateExternalAntenna?.()
      await editRadioContextData.updateApAntennaType?.()
      await editRadioContextData.updateClientSteering?.()

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
      await editRadioContextData.discardWifiRadioChanges?.()
      await editRadioContextData.discardClientAdmissionControlChanges?.()
      await editRadioContextData.discardExternalAntennaChanges?.()
      await editRadioContextData.discardApAntennaTypeChanges?.()
      await editRadioContextData.discardClientSteeringChanges?.()

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
        <AnchorLayout items={anchorItems} offsetTop={60} waitForReady />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
