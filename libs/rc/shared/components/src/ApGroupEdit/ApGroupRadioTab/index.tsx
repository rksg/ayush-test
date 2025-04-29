import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, StepsFormLegacy }                                       from '@acx-ui/components'
import { redirectPreviousPage, VenueConfigTemplateUrlsInfo, WifiRbacUrlsInfo } from '@acx-ui/rc/utils'
import { useNavigate, useParams }                                              from '@acx-ui/react-router-dom'
import { hasAllowedOperations }                                                from '@acx-ui/user'

import { usePathBasedOnConfigTemplate }           from '../../configTemplates'
import { useApGroupConfigTemplateOpsApiSwitcher } from '../apGroupConfigTemplateApiSwitcher'
import { ApGroupEditContext }                     from '../context'

import { RadioSettings } from './RadioSettings'

export function ApGroupRadioTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()

  const radioSettingsOpsApi = useApGroupConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueRadioCustomization,
    VenueConfigTemplateUrlsInfo.updateVenueRadioCustomizationRbac
  )

  const [
    isAllowEditRadio
  ] = [
    hasAllowedOperations([radioSettingsOpsApi])
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
  }]

  const handleUpdateSetting = async (redirect?: boolean) => {
    try {
      console.log('handleUpdateSetting: ', editRadioContextData)
      // if (redirect) {
      //   navigate({
      //     ...basePath,
      //     pathname: `${basePath.pathname}/${venueId}/venue-details/overview`
      //   })
      // }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }


  return (
    <StepsFormLegacy
      onFinish={() => handleUpdateSetting(false)}
      onCancel={() =>
        redirectPreviousPage(navigate, previousPath, basePath)
      }
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsFormLegacy.StepForm>
        <AnchorLayout items={anchorItems} offsetTop={60} waitForReady />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
