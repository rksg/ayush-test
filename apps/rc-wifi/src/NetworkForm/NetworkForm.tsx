import { useState, useRef } from 'react'

import { message } from 'antd'

import {
  PageHeader,
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
import { OpenSettingsForm }        from './NetworkSettings/OpenSettingsForm'
import { AaaSummaryForm }          from './NetworkSummary/AaaSummaryForm'
import { OpenSummaryForm }         from './NetworkSummary/OpenSummaryForm'
import {
  transferDetailToSave,
  tranferSettingsToSave
} from './parser'
import { Venues } from './Venues/Venues'

export function NetworkForm () {
  const navigate = useNavigate()
  const linkToNetworks = useTenantLink('/networks')
  const params = useParams()
  const [settingStepTitle, setSettingStepTitle] = useState('Settings')

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
    const newSavedata = { ...saveState, ...saveData }
    newSavedata.wlan = { ...saveState?.wlan, ...saveData.wlan }
    updateSaveState({ ...saveState, ...newSavedata })
  }

  const handleAddNetwork = async () => {
    try {
      await createNetwork({ params, payload: saveState }).unwrap()
      navigate(linkToNetworks, { replace: true })
    } catch {
      message.error('An error occurred')
    }
  }
  return (
    <>
      <PageHeader
        title='Create New Network'
        breadcrumb={[
          { text: 'Networks', link: '/networks' }
        ]}
      />
      <StepsForm<CreateNetworkFormFields>
        formRef={formRef}
        onCancel={() => navigate(linkToNetworks)}
        onFinish={handleAddNetwork}
      >
        <StepsForm.StepForm
          name='moreSettings'
          title='More Settings'
          validateTrigger='onBlur'
          onFinish={async (data) => {
            const detailsSaveData = transferDetailToSave(data)
            updateData(data)
            updateSaveData(detailsSaveData)
            return true
          }}
        >
          <NetworkMoreSettingsForm />
        </StepsForm.StepForm>




        <StepsForm.StepForm<CreateNetworkFormFields>
          name='details'
          title='Network Details'
          validateTrigger='onBlur'
          onFinish={async (data) => {
            const detailsSaveData = transferDetailToSave(data)
            updateData(data)
            updateSaveData(detailsSaveData)
            return true
          }}
        >
          <NetworkFormContext.Provider value={{ setSettingStepTitle }}>
            <NetworkDetailForm />
          </NetworkFormContext.Provider>
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='Settings'
          title={settingStepTitle}
          validateTrigger='onBlur'
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
          {state.type === NetworkTypeEnum.OPEN && <OpenSettingsForm formRef={formRef} />}
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='venues'
          title='Venues'
          onFinish={async (data) => {
            updateData(data)
            updateSaveData(data)
            return true
          }}
        >
          <Venues formRef={formRef} />
        </StepsForm.StepForm>

        <StepsForm.StepForm name='summary' title='Summary'>
          {state.type === NetworkTypeEnum.AAA && <AaaSummaryForm summaryData={state} />}
          {state.type === NetworkTypeEnum.OPEN && <OpenSummaryForm summaryData={state} />}
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
