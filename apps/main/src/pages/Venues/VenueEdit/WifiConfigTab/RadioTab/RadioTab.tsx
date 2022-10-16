import { useContext, useEffect } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, showToast, StepsForm }    from '@acx-ui/components'
import { useUpdateVenueExternalAntennaMutation } from '@acx-ui/rc/services'
import { ExternalAntenna }                       from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { getExternalAntennaPayload, VenueEditContext } from '../..'

import { ExternalAntennaSection } from './ExternalAntennaSection'
import { RadioSettings }      from './RadioSettings'

export function RadioTab () {
  const { $t } = useIntl()
  const params = useParams()
  const { venueId } = params
  const navigate = useNavigate()
  const { editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData } = useContext(VenueEditContext)
  const basePath = useTenantLink('/venues/')
  const [updateVenueExternalAntenna ] = useUpdateVenueExternalAntennaMutation()
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

  useEffect(() => {
    setEditRadioContextData({
      ...editRadioContextData,
      updateExternalAntenna: handleUpdateExternalAntenna
    })
  }, [])

  const handleUpdateExternalAntenna = async (data: ExternalAntenna[]) => {
    try {
      await updateVenueExternalAntenna({ params, payload: [ ...data ] })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleUpdateSetting = async (redirect?: boolean) => {
    try {
      if (editRadioContextData.apModels) {
        const extPayload = getExternalAntennaPayload(editRadioContextData.apModels)
        await editRadioContextData?.updateExternalAntenna?.(extPayload)
      }
      setEditContextData({
        ...editContextData,
        unsavedTabKey: 'radio',
        isDirty: false
      })
      //  TODO: Call APIs
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