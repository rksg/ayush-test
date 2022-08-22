import { useState, useRef } from 'react'
import React                from 'react'

import { defineMessage, useIntl } from 'react-intl'

import {
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useCreateNetworkMutation } from '@acx-ui/rc/services'
import {
  NetworkTypeEnum,
  CreateNetworkFormFields,
  NetworkSaveData
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { NetworkDetailForm }       from './NetworkDetail/NetworkDetailForm'
import NetworkFormContext          from './NetworkFormContext'
import { NetworkMoreSettingsForm } from './NetworkMoreSettings/NetworkMoreSettingsForm'
import { AaaSettingsForm }         from './NetworkSettings/AaaSettingsForm'
import { DpskSettingsForm }        from './NetworkSettings/DpskSettingsForm'
import { OpenSettingsForm }        from './NetworkSettings/OpenSettingsForm'
import { SummaryForm }             from './NetworkSummary/SummaryForm'
import {
  transferDetailToSave,
  tranferSettingsToSave
} from './parser'
import { Venues } from './Venues/Venues'

const settingTitle = defineMessage({
  defaultMessage: `{type, select,
    aaa {AAA Settings}
    dpsk {DPSK Settings}
    other {Settings}
  }`
})

export function NetworkForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToNetworks = useTenantLink('/networks')
  const params = useParams()
  const [networkType, setNetworkType] = useState<NetworkTypeEnum | undefined>()

  const [createNetwork] = useCreateNetworkMutation()
  //DetailsState
  const [state, updateState] = useState<CreateNetworkFormFields>({
    name: '',
    type: NetworkTypeEnum.AAA,
    isCloudpathEnabled: false,
    venues: []
  })
  const formRef = useRef<StepsFormInstance<CreateNetworkFormFields>>()

  const updateData = (newData: Partial<CreateNetworkFormFields>) => {
    updateState({ ...state, ...newData })
  }

  const [saveState, updateSaveState] = useState<NetworkSaveData>()

  const updateSaveData = (saveData: Partial<NetworkSaveData>) => {
    if( state.isCloudpathEnabled ){
      delete saveState?.accountingRadius
      delete saveState?.authRadius
    }else{
      delete saveState?.cloudpathServerId
    }
    const newSavedata = { ...saveState, ...saveData }
    newSavedata.wlan = { ...saveState?.wlan, ...saveData.wlan }
    updateSaveState({ ...saveState, ...newSavedata })
  }

  const handleAddNetwork = async () => {
    try {
      await createNetwork({ params, payload: saveState }).unwrap()
      navigate(linkToNetworks, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }
  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Create New Network' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Networks' }), link: '/networks' }
        ]}
      />
      <StepsForm<CreateNetworkFormFields>
        formRef={formRef}
        onCancel={() => navigate(linkToNetworks)}
        onFinish={handleAddNetwork}
      >
        <StepsForm.StepForm<CreateNetworkFormFields>
          name='details'
          title={$t({ defaultMessage: 'Network Details' })}
          onFinish={async (data) => {
            const detailsSaveData = transferDetailToSave(data)
            updateData(data)
            updateSaveData(detailsSaveData)
            return true
          }}
        >
          <NetworkFormContext.Provider value={{ setNetworkType }}>
            <NetworkDetailForm />
          </NetworkFormContext.Provider>
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='settings'
          title={$t(settingTitle, { type: networkType })}
          onFinish={async (data) => {
            data = {
              ...data,
              ...{ type: state.type, isCloudpathEnabled: data.isCloudpathEnabled }
            }
            const settingSaveData = tranferSettingsToSave(data)
            updateData(data)
            updateSaveData(settingSaveData)
            return true
          }}
        >
          {state.type === NetworkTypeEnum.AAA && <AaaSettingsForm />}
          {state.type === NetworkTypeEnum.OPEN && <OpenSettingsForm />}
          {state.type === NetworkTypeEnum.DPSK && <DpskSettingsForm />}
        </StepsForm.StepForm>

        <StepsForm.StepForm
          formRef={formRef}
          name='moreSettings'
          title='More Settings'
          onFinish={async (data) => {
            // const detailsSaveData = transferMoreSettingsToSave(data)
            // const detailsSaveData = data
            updateData(data)
            updateSaveData(detailsSaveData)
            return true
          }}
        >
          <NetworkMoreSettingsForm />
        </StepsForm.StepForm>


        <StepsForm.StepForm
          name='venues'
          title={$t({ defaultMessage: 'Venues' })}
          onFinish={async (data) => {
            updateData(data)
            updateSaveData(data)
            return true
          }}
        >
          <Venues formRef={formRef} />
        </StepsForm.StepForm>

        <StepsForm.StepForm name='summary' title={$t({ defaultMessage: 'Summary' })}>
          <SummaryForm summaryData={state} />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
