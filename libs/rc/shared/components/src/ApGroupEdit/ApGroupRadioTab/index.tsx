import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, StepsFormLegacy, Tooltip } from '@acx-ui/components'
import { usePathBasedOnConfigTemplate }           from '@acx-ui/config-template/utils'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }             from '@acx-ui/icons'
import {
  getAntennaTypePayload,
  getExternalAntennaPayload,
  redirectPreviousPage,
  VenueConfigTemplateUrlsInfo,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'
import { hasAllowedOperations }   from '@acx-ui/user'
import { getOpsApi }              from '@acx-ui/utils'

import { useApGroupConfigTemplateOpsApiSwitcher } from '../apGroupConfigTemplateApiSwitcher'
import { ApGroupEditContext }                     from '../context'

import { ClientAdmissionControlSettings } from './ClientAdmissionControlSettings'
import { ExternalAntennaSection }         from './ExternalAntennaSection'
import { RadioSettings }                  from './RadioSettings'


export function ApGroupRadioTab () {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const isApGroupMoreParameterPhase3Enabled = useIsSplitOn(Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE3_TOGGLE)
  const params = useParams()
  const navigate = useNavigate()

  const radioSettingsOpsApi = useApGroupConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueRadioCustomization,
    VenueConfigTemplateUrlsInfo.updateVenueRadioCustomizationRbac
  )

  const antennaOpsApi = useApGroupConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueExternalAntenna,
    VenueConfigTemplateUrlsInfo.updateVenueExternalAntennaRbac
  )

  const [
    isAllowEditRadio,
    isAllowEditAntenna,
    isAllowEditClientAdmissionControl
  ] = [
    hasAllowedOperations([radioSettingsOpsApi]),
    hasAllowedOperations([antennaOpsApi]),
    hasAllowedOperations([getOpsApi(WifiRbacUrlsInfo.updateVenueRadioCustomization)])
  ]

  const {
    previousPath,
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(ApGroupEditContext)


  const basePath = usePathBasedOnConfigTemplate('/devices/')

  const supportAntennaTypeSelection = useIsSplitOn(Features.WIFI_ANTENNA_TYPE_TOGGLE)

  const wifiSettingLink = $t({ defaultMessage: 'Wi-Fi Radio' })
  const wifiSettingTitle = $t({ defaultMessage: 'Wi-Fi Radio Settings' })
  const externalTitle = supportAntennaTypeSelection?
    $t({ defaultMessage: 'Antenna' }) :
    $t({ defaultMessage: 'External Antenna' })
  const clientAdmissionControlSettingLink = $t({ defaultMessage: 'Client Admission Control' })
  const clientAdmissionControlSettingsTitle = $t({ defaultMessage: 'Client Admission Control' })

  const anchorItems = [{
    title: wifiSettingLink,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='radio-settings'>
          { wifiSettingTitle }
        </StepsFormLegacy.SectionTitle>
        <RadioSettings isAllowEdit={isAllowEditRadio} />
      </>
    )
  }, ...(isApGroupMoreParameterPhase3Enabled ? [{
    title: clientAdmissionControlSettingLink,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='client-admission-control'>
          { clientAdmissionControlSettingsTitle }
          <Tooltip
            title={$t({ defaultMessage: 'APs adaptively allow or deny new client connections '+
                'based on the connectivity thresholds set per radio.' })}
            placement='right'>
            <QuestionMarkCircleOutlined style={{ height: '18px', marginBottom: -3 }} />
          </Tooltip>
        </StepsFormLegacy.SectionTitle>
        <ClientAdmissionControlSettings isAllowEdit={isAllowEditClientAdmissionControl} />
      </>
    )
  }] : []), ...(isApGroupMoreParameterPhase3Enabled ? [{
    title: externalTitle,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='external-antenna'>
          { externalTitle }
        </StepsFormLegacy.SectionTitle>
        <ExternalAntennaSection isAllowEdit={isAllowEditAntenna} />
      </>
    )
  }] : [])]

  const handleUpdateSetting = async (redirect?: boolean) => {
    try {
      const {
        apModels,
        apModelAntennaTypes
      } = editRadioContextData

      if (apModels) {
        const extPayload = getExternalAntennaPayload(apModels)
        await editRadioContextData.updateExternalAntenna?.(extPayload)
      }

      if (apModelAntennaTypes) {
        const antTypePayload = getAntennaTypePayload(apModelAntennaTypes)
        await editRadioContextData.updateAntennaType?.(antTypePayload)
      }

      await editRadioContextData.updateWifiRadio?.()
      await editRadioContextData.updateClientAdmissionControl?.()

      resetEditContextData()

      if (redirect) {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/devices/apgroups/${params.apGroupId}/details/members`
        })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleDiscardChanges = async () => {
    try {
      await editRadioContextData.discardWifiRadioChanges?.()
      await editRadioContextData.discardClientAdmissionControl?.()

      resetEditContextData()

      redirectPreviousPage(navigate, previousPath, basePath)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const resetEditContextData = () => {
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'radio',
      isDirty: false
    })

    if (editRadioContextData) {
      const newData = { ...editRadioContextData }
      delete newData.updateWifiRadio
      delete newData.updateExternalAntenna
      delete newData.updateAntennaType
      delete newData.discardWifiRadioChanges

      setEditRadioContextData(newData)
    }
  }


  return (
    <StepsFormLegacy
      onFinish={() => handleUpdateSetting(false)}
      onCancel={() => handleDiscardChanges()}
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsFormLegacy.StepForm>
        <AnchorLayout items={anchorItems} offsetTop={60} waitForReady />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
