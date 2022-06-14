import { useState, useRef } from 'react'

import { message } from 'antd'

import {
  PageHeader,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useCreateNetworkMutation }                                     from '@acx-ui/rc/services'
import { NetworkTypeEnum, transferDetailToSave, tranferSettingsToSave } from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { CreateNetworkFormFields, NetworkSaveData } from './interface'
import { NetworkDetailForm }                        from './NetworkDetail/NetworkDetailForm'
import NetworkFormContext                           from './NetworkFormContext'
import { AaaSettingsForm }                          from './NetworkSettings/AaaSettingsForm'
import { OpenSettingsForm }                         from './NetworkSettings/OpenSettingsForm'
import { NetworkSummaryForm }                       from './NetworkSummary/NetworkSummaryForm'
import { Venues }                                   from './Venues/Venues'

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
              ...{ type: state.type }
            }
            const settingSaveData = tranferSettingsToSave(data)
            updateData(data)
            updateSaveData(settingSaveData)
            return true
          }}
        >
          {state.type === 'aaa' && <AaaSettingsForm />}
          {state.type === 'open' && <OpenSettingsForm />}
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
          <NetworkSummaryForm summaryData={state} />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
