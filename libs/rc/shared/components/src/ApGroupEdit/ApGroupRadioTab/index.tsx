import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, StepsFormLegacy } from '@acx-ui/components'
import {
  redirectPreviousPage,
  VenueConfigTemplateUrlsInfo,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'
import { hasAllowedOperations }   from '@acx-ui/user'
import { getOpsApi }              from '@acx-ui/utils'

import { usePathBasedOnConfigTemplate }           from '../../configTemplates'
import { useApGroupConfigTemplateOpsApiSwitcher } from '../apGroupConfigTemplateApiSwitcher'
import { ApGroupEditContext }                     from '../context'

import { ClientAdmissionControlSettings } from './ClientAdmissionControlSettings'
import { RadioSettings }                  from './RadioSettings'

export function ApGroupRadioTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()

  const radioSettingsOpsApi = useApGroupConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueRadioCustomization,
    VenueConfigTemplateUrlsInfo.updateVenueRadioCustomizationRbac
  )

  const [
    isAllowEditRadio,
    isAllowEditClientAdmissionControl
  ] = [
    hasAllowedOperations([radioSettingsOpsApi]),
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

  const wifiSettingLink = $t({ defaultMessage: 'Wi-Fi Radio' })
  const wifiSettingTitle = $t({ defaultMessage: 'Wi-Fi Radio Settings' })
  const clientAdmissionControlSettingLink = $t({ defaultMessage: 'Client Admission Control' })
  const clientAdmissionControlSettingsTitle = $t({ defaultMessage: 'Client Admission Control Settings' })

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
  },{
    title: clientAdmissionControlSettingLink,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='client-admission-control'>
          { clientAdmissionControlSettingsTitle }
        </StepsFormLegacy.SectionTitle>
        <ClientAdmissionControlSettings isAllowEdit={isAllowEditClientAdmissionControl} />
      </>
    )
  }]

  const handleUpdateSetting = async (redirect?: boolean) => {
    try {
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
