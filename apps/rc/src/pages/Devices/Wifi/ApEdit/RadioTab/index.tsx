import { useContext } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { AnchorLayout, StepsFormLegacy } from '@acx-ui/components'
import { redirectPreviousPage }          from '@acx-ui/rc/utils'
import { useTenantLink }                 from '@acx-ui/react-router-dom'

import { ApEditContext } from '..'

import { RadioSettings } from './RadioSettings/RadioSettings'

export interface ApRadioContext {
  updateWifiRadio?: (data?: unknown) => void | Promise<void>
  discardWifiRadioChanges?: (data?: unknown) => void | Promise<void>

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
  const supportClientAdmissionControl = false

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
        </StepsFormLegacy.SectionTitle>
        {/*
          <ClientAdmissionControl />
        */}
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
      delete newData.updateExternalAntenna
      delete newData.discardWifiRadioChanges

      setEditRadioContextData(newData)
    }
  }

  const handleUpdateSetting = async (redirect?: boolean) => {
    try {
      await editRadioContextData.updateWifiRadio?.()
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
