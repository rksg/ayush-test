import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, StepsFormLegacy }         from '@acx-ui/components'
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
        <StepsFormLegacy.SectionTitle id='radio-settings'>
          { wifiSettingTitle }
        </StepsFormLegacy.SectionTitle>
        <RadioSettings />
      </>
    )
  },
  ...(supportLoadBalancing? [{
    title: loadBalancingTitle,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='load-balancing'>
          { loadBalancingTitle }
        </StepsFormLegacy.SectionTitle>
        <LoadBalancing />
      </>
    )
  }] : []),
  {
    title: externalTitle,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='external-antenna'>
          { externalTitle }
        </StepsFormLegacy.SectionTitle>
        <ExternalAntennaSection />
      </>
    )
  }]

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
    <StepsFormLegacy
      onFinish={() => handleUpdateSetting(false)}
      onCancel={() =>
        redirectPreviousPage(navigate, previousPath, basePath)
      }
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsFormLegacy.StepForm>
        <AnchorLayout items={anchorItems} offsetTop={275} />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
