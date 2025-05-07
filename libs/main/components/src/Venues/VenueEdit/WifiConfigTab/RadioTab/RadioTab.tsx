import { useContext, useState } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, StepsFormLegacy, Tooltip }          from '@acx-ui/components'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                      from '@acx-ui/icons'
import { useEnforcedStatus, usePathBasedOnConfigTemplate } from '@acx-ui/rc/components'
import {
  ConfigTemplateType,
  redirectPreviousPage,
  VenueConfigTemplateUrlsInfo,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'
import { hasAllowedOperations }   from '@acx-ui/user'

import { useVenueConfigTemplateOpsApiSwitcher }                               from '../../../venueConfigTemplateApiSwitcher'
import { getAntennaTypePayload, getExternalAntennaPayload, VenueEditContext } from '../../index'

import { ClientAdmissionControlSettings } from './ClientAdmissionControlSettings'
import { ExternalAntennaSection }         from './ExternalAntennaSection'
import { LoadBalancing }                  from './LoadBalancing'
import { RadioSettings }                  from './RadioSettings'


export function RadioTab () {
  const { $t } = useIntl()
  const params = useParams()
  const { venueId } = params
  const navigate = useNavigate()
  const { getEnforcedStepsFormProps } = useEnforcedStatus(ConfigTemplateType.VENUE)

  const radioSettingsOpsApi = useVenueConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueRadioCustomization,
    VenueConfigTemplateUrlsInfo.updateVenueRadioCustomizationRbac
  )

  const LoadBalancingOpsApi = useVenueConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueLoadBalancing,
    VenueConfigTemplateUrlsInfo.updateVenueLoadBalancingRbac
  )

  const clientAdmissControlOpsApi = useVenueConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueClientAdmissionControl,
    VenueConfigTemplateUrlsInfo.updateVenueClientAdmissionControlRbac
  )

  const antennaOpsApi = useVenueConfigTemplateOpsApiSwitcher(
    WifiRbacUrlsInfo.updateVenueExternalAntenna,
    VenueConfigTemplateUrlsInfo.updateVenueExternalAntennaRbac
  )

  const [
    isAllowEditRadio,
    isAllowEditLoadBalancing,
    isAllowEditClientAdmissionControl,
    isAllowEditAntenna
  ] = [
    hasAllowedOperations([radioSettingsOpsApi]),
    hasAllowedOperations([LoadBalancingOpsApi]),
    hasAllowedOperations([clientAdmissControlOpsApi]),
    hasAllowedOperations([antennaOpsApi])
  ]

  const {
    previousPath,
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(VenueEditContext)

  const [isLoadOrBandBalaningEnabled, setIsLoadOrBandBalaningEnabled] = useState<boolean>(false)
  const basePath = usePathBasedOnConfigTemplate('/venues/')

  const supportAntennaTypeSelection = useIsSplitOn(Features.WIFI_ANTENNA_TYPE_TOGGLE)

  const wifiSettingLink = $t({ defaultMessage: 'Wi-Fi Radio' })
  const wifiSettingTitle = $t({ defaultMessage: 'Wi-Fi Radio Settings' })
  const externalTitle = supportAntennaTypeSelection?
    $t({ defaultMessage: 'Antenna' }) :
    $t({ defaultMessage: 'External Antenna' })
  const loadBalancingTitle = $t({ defaultMessage: 'Load Balancing' })
  const clientAdmissionControlTitle = $t({ defaultMessage: 'Client Admission Control' })

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
  },
  {
    title: loadBalancingTitle,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='load-balancing'>
          { loadBalancingTitle }
        </StepsFormLegacy.SectionTitle>
        <LoadBalancing
          isAllowEdit={isAllowEditLoadBalancing}
          setIsLoadOrBandBalaningEnabled={setIsLoadOrBandBalaningEnabled}
        />
      </>
    )
  },
  {
    title: clientAdmissionControlTitle,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='client-admission-control'>
          { clientAdmissionControlTitle }
          <Tooltip
            title={$t({ defaultMessage: 'APs adaptively allow or deny new client connections '+
              'based on the connectivity thresholds set per radio.' })}
            placement='right'>
            <QuestionMarkCircleOutlined
              style={{ height: '18px', marginBottom: -3 }}
            />
          </Tooltip>
        </StepsFormLegacy.SectionTitle>
        <ClientAdmissionControlSettings
          isAllowEdit={isAllowEditClientAdmissionControl}
          isLoadOrBandBalaningEnabled={isLoadOrBandBalaningEnabled}/>
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
        <ExternalAntennaSection isAllowEdit={isAllowEditAntenna} />
      </>
    )
  }]

  const handleUpdateSetting = async (redirect?: boolean) => {
    try {
      const {
        apModels,
        updateExternalAntenna,
        apModelAntennaTypes,
        updateAntennaType,
        radioData,
        isLoadBalancingDataChanged,
        isClientAdmissionControlDataChanged
      } = editRadioContextData || {}

      if (apModels) {
        const extPayload = getExternalAntennaPayload(apModels)
        await editRadioContextData.updateExternalAntenna?.(extPayload)
      }

      if (apModelAntennaTypes) {
        const antTypePayload = getAntennaTypePayload(apModelAntennaTypes)
        await editRadioContextData.updateAntennaType?.(antTypePayload)
      }

      if (radioData) {
        await editRadioContextData.updateWifiRadio?.(radioData)
      }

      // ACX-38403: Load or band balancing and client admission control cannot be updated simultaneously.
      if (isLoadBalancingDataChanged && isClientAdmissionControlDataChanged) {
        // The disable operation should be updated before the enable operation.
        if (isLoadOrBandBalaningEnabled) {
          await editRadioContextData.updateClientAdmissionControl?.(
            editRadioContextData.updateLoadBalancing
          )
        } else {
          await editRadioContextData.updateLoadBalancing?.(
            editRadioContextData.updateClientAdmissionControl
          )
        }
      } else {
        if (isLoadBalancingDataChanged) {
          await editRadioContextData.updateLoadBalancing?.()
        }
        if (isClientAdmissionControlDataChanged) {
          await editRadioContextData.updateClientAdmissionControl?.()
        }
      }

      if (apModels || updateExternalAntenna || updateAntennaType ||
        radioData ||
        isLoadBalancingDataChanged ||
        isClientAdmissionControlDataChanged) {
        setEditContextData({
          ...editContextData,
          unsavedTabKey: 'radio',
          isDirty: false
        })

        const newRadioContextData = {
          ...editRadioContextData,
          isLoadBalancingDataChanged: false,
          isClientAdmissionControlDataChanged: false
        }
        delete newRadioContextData.updateExternalAntenna
        delete newRadioContextData.updateAntennaType
        delete newRadioContextData.radioData

        setEditRadioContextData(newRadioContextData)
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
      {...getEnforcedStepsFormProps('StepsFormLegacy')}
    >
      <StepsFormLegacy.StepForm>
        <AnchorLayout items={anchorItems} offsetTop={60} waitForReady />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
