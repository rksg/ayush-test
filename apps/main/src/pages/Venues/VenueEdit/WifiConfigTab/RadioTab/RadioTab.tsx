import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, showToast, StepsForm }    from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../..'

import { ExternalAntenna } from './ExternalAntenna'
import { RadioSettings }   from './RadioSettings'

export function RadioTab () {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const navigate = useNavigate()
  const { editContextData, setEditContextData } = useContext(VenueEditContext)
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
        <ExternalAntenna />
      </>
    )
  }]

  const handleUpdateSetting = async (redirect?: boolean) => {
    try {
      setEditContextData({
        ...editContextData,
        oldData: editContextData?.newData,
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
      onFinish={() => handleUpdateSetting(true)}
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