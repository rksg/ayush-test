import { useState, useRef } from 'react'

import { message } from 'antd'

import {
  PageHeader,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useCreateNetworkMutation } from '@acx-ui/rc/services'
import { NetworkTypeEnum }          from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { CreateNetworkFormFields, NetworkSaveData } from './interface'
import { NetworkDetailForm }                        from './NetworkDetail/NetworkDetailForm'
import { NetworkMoreSettingsForm }                  from './NetworkMoreSettings/NetworkMoreSettingsForm'
import { AaaSettingsForm }                          from './NetworkSettings/AaaSettingsForm'
import { NetworkSummaryForm }                       from './NetworkSummary/NetworkSummaryForm'
import { Venues }                                   from './Venues/Venues'

export function NetworkForm () {
  const navigate = useNavigate()
  const linkToNetworks = useTenantLink('/networks')
  const params = useParams()
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
          <NetworkDetailForm />
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='aaaSettings'
          title='AAA Settings'
          validateTrigger='onBlur'
          onFinish={async (data) => {
            const aaaSaveData = tranferAaaSettingsToSave(data)

            updateData(data)
            updateSaveData(aaaSaveData)
            return true
          }}
        >
          <AaaSettingsForm />
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

function transferDetailToSave (data: any) {
  return {
    name: data.name,
    description: data.description,
    type: data.type,
    wlan: {
      ssid: data.name
    }
  }
}

function tranferAaaSettingsToSave (data: any) {
  let saveData = {
    wlan: {
      wlanSecurity: data.wlanSecurity
    }
  }

  if (data.isCloudpathEnabled) {
    saveData = {
      ...saveData,
      ...{
        cloudpathServerId: data.cloudpathServerId,
        enableAccountingProxy: false,
        enableAuthProxy: false
      }
    }
  } else {
    let authRadius = {
      primary: {
        ip: data['authRadius.primary.ip'],
        port: data['authRadius.primary.port'],
        sharedSecret: data['authRadius.primary.sharedSecret']
      }
    }
    if (data['authRadius.secondary.ip']) {
      authRadius = {
        ...authRadius,
        ...{
          secondary: {
            ip: data['authRadius.secondary.ip'],
            port: data['authRadius.secondary.port'],
            sharedSecret: data['authRadius.secondary.sharedSecret']
          }
        }
      }
    }

    saveData = {
      ...saveData,
      ...{
        enableAccountingProxy: data.enableAccountingProxy,
        enableAuthProxy: data.enableAuthProxy,
        authRadius
      }
    }

    if (data.enableAccountingService === true) {
      let accountingRadius = {}
      accountingRadius = {
        ...accountingRadius,
        ...{
          primary: {
            ip: data['accountingRadius.primary.ip'],
            port: data['accountingRadius.primary.port'],
            sharedSecret: data['accountingRadius.primary.sharedSecret']
          }
        }
      }

      if (data['accountingRadius.secondary.ip']) {
        accountingRadius = {
          ...accountingRadius,
          ...{
            secondary: {
              ip: data['accountingRadius.secondary.ip'],
              port: data['accountingRadius.secondary.port'],
              sharedSecret: data['accountingRadius.secondary.sharedSecret']
            }
          }
        }
      }

      saveData = {
        ...saveData,
        ...{
          accountingRadius
        }
      }
    }
  }
  return saveData
}
