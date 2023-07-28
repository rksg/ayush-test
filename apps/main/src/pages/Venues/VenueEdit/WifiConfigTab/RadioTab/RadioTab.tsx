import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, StepsFormLegacy, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }             from '@acx-ui/icons'
import { redirectPreviousPage }                   from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }  from '@acx-ui/react-router-dom'

import { getExternalAntennaPayload, VenueEditContext } from '../..'

import { ClientAdmissionControl } from './ClientAdmissionControl'
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
  const supoortClientAdmissionControl = useIsSplitOn(Features.WIFI_FR_6029_FG6_1_TOGGLE)

  const wifiSettingTitle = $t({ defaultMessage: 'Wi-Fi Radio Settings' })
  const externalTitle = $t({ defaultMessage: 'External Antenna' })
  const loadBalancingTitle = $t({ defaultMessage: 'Load Balancing' })
  const clientAdmissionControlTitle = $t({ defaultMessage: 'Client Admission Control' })

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

  if (supportLoadBalancing) {
    anchorItems.push({
      title: loadBalancingTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='load-balancing'>
            { loadBalancingTitle }
          </StepsFormLegacy.SectionTitle>
          <LoadBalancing />
        </>
      )
    })
  }

  if (supoortClientAdmissionControl) {
    anchorItems.push({
      title: clientAdmissionControlTitle,
      content: (
        <>
          <StepsFormLegacy.SectionTitle id='client-admission-control'>
            { clientAdmissionControlTitle }
            <Tooltip
              title={$t({ defaultMessage: 'APs adaptively allow or deny new client connections' +
                ' based on the connectivity thresholds set per radio.' })}
              placement='right'>
              <QuestionMarkCircleOutlined
                style={{ height: '18px', marginBottom: -3 }}
              />
            </Tooltip>
          </StepsFormLegacy.SectionTitle>
          <ClientAdmissionControl />
        </>
      )
    })
  }

  const handleUpdateSetting = async (redirect?: boolean) => {
    try {
      const {
        apModels,
        radioData,
        isLoadBalancingDataChanged,
        isClientAdmissionControlDataChanged
      } = editRadioContextData || {}

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
      if (isClientAdmissionControlDataChanged) {
        await editRadioContextData.updateClientAdmissionControl?.()
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
