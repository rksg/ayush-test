import { useContext } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { AnchorLayout, StepsFormLegacy, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }             from '@acx-ui/icons'
import { redirectPreviousPage }                   from '@acx-ui/rc/utils'
import { useTenantLink }                          from '@acx-ui/react-router-dom'

import { ApEditContext } from '..'

import { ClientAdmissionControlSettings } from './ClientAdmissionControlSettings/ClientAdmissionControlSettings'
import { RadioSettings }                  from './RadioSettings/RadioSettings'

export interface ApRadioContext {
  updateWifiRadio?: (data?: unknown) => void | Promise<void>
  discardWifiRadioChanges?: (data?: unknown) => void | Promise<void>

  updateClientAdmissionControl?: (data?: unknown) => void | Promise<void>
  discardClientAdmissionControlChanges?: (data?: unknown) => void | Promise<void>

  updateExternalAntenna?: (data?: unknown) => void | Promise<void>
  discardExternalAntennaChanges?: (data?: unknown) => void | Promise<void>
}

export function RadioTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const {
    previousPath,
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(ApEditContext)


  // waiting for the feature is implemented and useing feature flag to control
  const supportClientAdmissionControl = useIsSplitOn(Features.WIFI_FR_6029_FG6_2_TOGGLE)

  const supportExternalAntenna = false

  const wifiRadioLink = $t({ defaultMessage: 'Wi-Fi Radio' })
  const wifiRadioTitle = $t({ defaultMessage: 'Wi-Fi Radio Settings' })
  const clientAdmissionCtlTitle = $t({ defaultMessage: 'Client Admission Control' })
  const externalTitle = $t({ defaultMessage: 'External Antenna' })

  const anchorItems = [{
    title: wifiRadioLink,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='radio-settings'>
          { wifiRadioTitle }
        </StepsFormLegacy.SectionTitle>
        <RadioSettings />
      </>
    )
  },
  ...(supportClientAdmissionControl? [{
    title: clientAdmissionCtlTitle,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='client-Admission'>
          { clientAdmissionCtlTitle }
          <Tooltip
            title={$t({ defaultMessage: 'APs adaptively allow or deny new client connections '+
              'based on the connectivity thresholds set per radio.' })}
            placement='right'>
            <QuestionMarkCircleOutlined style={{ height: '18px', marginBottom: -3 }}
            />
          </Tooltip>
        </StepsFormLegacy.SectionTitle>
        {
          <ClientAdmissionControlSettings />
        }
      </>
    )
  }]: []),
  ...(supportExternalAntenna? [{
    title: externalTitle,
    content: (
      <>
        <StepsFormLegacy.SectionTitle id='external-antenna'>
          { externalTitle }
        </StepsFormLegacy.SectionTitle>
        {/*
          <ExternalAntennaSection />
        */}
      </>
    )
  }]: [])
  ]

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
      delete newData.updateClientAdmissionControl
      delete newData.discardClientAdmissionControlChanges
      delete newData.updateExternalAntenna
      delete newData.discardWifiRadioChanges

      setEditRadioContextData(newData)
    }
  }

  const handleUpdateSetting = async (redirect?: boolean) => {
    try {
      await editRadioContextData.updateWifiRadio?.()
      await editRadioContextData.updateClientAdmissionControl?.()
      await editRadioContextData.updateExternalAntenna?.()

      resetEditContextData()

      if (redirect) {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/wifi/${params.serialNumber}/details/overview`
        })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleDiscardChanges = async () => {
    try {
      await editRadioContextData.discardWifiRadioChanges?.()
      await editRadioContextData.discardClientAdmissionControlChanges?.()

      resetEditContextData()

      redirectPreviousPage(navigate, previousPath, basePath)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsFormLegacy
      onFinish={() => handleUpdateSetting(false)}
      onCancel={() => handleDiscardChanges()}
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
    >
      <StepsFormLegacy.StepForm>
        <AnchorLayout items={anchorItems} />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
