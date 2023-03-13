import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, StepsForm }               from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { redirectPreviousPage }                  from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { getExternalAntennaPayload, VenueEditContext } from '../..'

import { ExternalAntennaSection } from './ExternalAntennaSection'
import { LoadBalancing }          from './LoadBalancing'
import { RadioSettings }          from './RadioSettings'

export function RadioTab () {
  const { $t } = useIntl()
  const params = useParams()
  const { venueId } = params
  const navigate = useNavigate()
  const {
    previousPath,
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(VenueEditContext)
  const basePath = useTenantLink('/venues/')

  const supportLoadBalancing = useIsSplitOn(Features.LOAD_BALANCING)

  const wifiSettingTitle = $t({ defaultMessage: 'Wi-Fi Radio Settings' })
  const externalTitle = $t({ defaultMessage: 'External Antenna' })
  const loadBalancingTitle = $t({ defaultMessage: 'Load Balancing' })
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
  },
  {
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

  if (supportLoadBalancing) {
    anchorItems.push({
      title: loadBalancingTitle,
      content: (
        <>
          <StepsForm.SectionTitle id='load-balancing'>
            { loadBalancingTitle }
          </StepsForm.SectionTitle>
          <LoadBalancing />
        </>
      )
    })
  }

  const handleUpdateSetting = async (redirect?: boolean) => {
    try {
      const { apModels, radioData, isLoadBalancingDataChanged } = editRadioContextData || {}

      if (apModels) {
        const extPayload = getExternalAntennaPayload(apModels)
        await editRadioContextData.updateExternalAntenna?.(extPayload)
      }
      if (radioData) {
        await editRadioContextData.updateWifiRadio?.(radioData)
      }
      if (isLoadBalancingDataChanged) {
        await editRadioContextData.updateLoadBalancing?.()
      }

      if (apModels || radioData || isLoadBalancingDataChanged) {
        setEditContextData({
          ...editContextData,
          unsavedTabKey: 'radio',
          isDirty: false
        })

        setEditRadioContextData({
          ...editRadioContextData,
          isLoadBalancingDataChanged: false
        })
      }

      if (redirect) {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/${venueId}/venue-details/overview`
        })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsForm
      onFinish={() => handleUpdateSetting(false)}
      onCancel={() =>
        redirectPreviousPage(navigate, previousPath, basePath)
      }
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsForm.StepForm>
        <AnchorLayout items={anchorItems} offsetTop={275} />
      </StepsForm.StepForm>
    </StepsForm>
  )
}
