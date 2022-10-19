import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, showToast, StepsForm }    from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { getExternalAntennaPayload, VenueEditContext } from '../..'

import { ExternalAntennaSection } from './ExternalAntennaSection'
import { RadioSettings }          from './RadioSettings'

export function RadioTab () {
  const { $t } = useIntl()
  const params = useParams()
  const { venueId } = params
  const navigate = useNavigate()
  const { editContextData,
    setEditContextData,
    editRadioContextData
  } = useContext(VenueEditContext)
  const basePath = useTenantLink('/venues/')

  const wifiSettingTitle = $t({ defaultMessage: 'Wi-Fi Radio Settings' })
  const externalTitle = $t({ defaultMessage: 'External Antenna' })
  const anchorItems = [{
    title: wifiSettingTitle,
    content: (
      <>
        <StepsForm.SectionTitle id='radio-settings'>
          { wifiSettingTitle }
        </StepsForm.SectionTitle>
        <RadioSettings />
      </>
    )
  }, {
    title: externalTitle,
    content: (
      <>
        <StepsForm.SectionTitle id='external-antenna'>
          { externalTitle }
        </StepsForm.SectionTitle>
        <ExternalAntennaSection />
      </>
    )
  }]

  const handleUpdateSetting = async (redirect?: boolean) => {
    try {
      if (editRadioContextData.apModels) {
        const extPayload = getExternalAntennaPayload(editRadioContextData.apModels)
        await editRadioContextData?.updateExternalAntenna?.(extPayload)
        setEditContextData({
          ...editContextData,
          unsavedTabKey: 'radio',
          isDirty: false
        })
      }
      if (editRadioContextData.radioData) {
        await editRadioContextData?.updateWifiRadio?.(editRadioContextData.radioData)
        setEditContextData({
          ...editContextData,
          unsavedTabKey: 'radio',
          isDirty: false
        })
      }
      if (redirect) {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/${venueId}/venue-details/overview`
        })
      }
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <StepsForm
      onFinish={() => handleUpdateSetting(false)}
      onCancel={() => navigate({
        ...basePath,
        pathname: `${basePath.pathname}/${venueId}/venue-details/overview`
      })}
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsForm.StepForm>
        <AnchorLayout items={anchorItems} offsetTop={275} />
      </StepsForm.StepForm>
    </StepsForm>
  )
}