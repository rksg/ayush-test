import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, StepsFormLegacy } from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import {
  getAntennaTypePayload,
  getExternalAntennaPayload,
  redirectPreviousPage,
  VenueConfigTemplateUrlsInfo,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'
import { hasAllowedOperations }   from '@acx-ui/user'

import { usePathBasedOnConfigTemplate }           from '../../configTemplates'
import { useApGroupConfigTemplateOpsApiSwitcher } from '../apGroupConfigTemplateApiSwitcher'
import { ApGroupEditContext }                     from '../context'

import { ExternalAntennaSection } from './ExternalAntennaSection'
import { RadioSettings }          from './RadioSettings'

export function ApGroupRadioTab () {
  const { $t } = useIntl()
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
    isAllowEditAntenna
  ] = [
    hasAllowedOperations([radioSettingsOpsApi]),
    hasAllowedOperations([antennaOpsApi])
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
  // eslint-disable-next-line max-len
  const isApGroupMoreParameterPhase3Enabled = useIsSplitOn(Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE3_TOGGLE)

  const wifiSettingLink = $t({ defaultMessage: 'Wi-Fi Radio' })
  const wifiSettingTitle = $t({ defaultMessage: 'Wi-Fi Radio Settings' })
  const externalTitle = supportAntennaTypeSelection?
    $t({ defaultMessage: 'Antenna' }) :
    $t({ defaultMessage: 'External Antenna' })

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
