import { useState, useRef } from 'react'

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

import { PortalTypeForm }    from './CaptivePortal/PortalTypeForm'
import { NetworkTypeTitle }  from './contentsMap'
import { NetworkDetailForm } from './NetworkDetail/NetworkDetailForm'
import NetworkFormContext    from './NetworkFormContext'
import { AaaSettingsForm }   from './NetworkSettings/AaaSettingsForm'
import { DpskSettingsForm }  from './NetworkSettings/DpskSettingsForm'
import { OpenSettingsForm }  from './NetworkSettings/OpenSettingsForm'
import { SummaryForm }       from './NetworkSummary/SummaryForm'
import {
  transferDetailToSave,
  tranferSettingsToSave
} from './parser'
import { Venues } from './Venues/Venues'

export function NetworkForm () {
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
        content: 'An error occurred'
      })
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
          name='Settings'
          title={networkType ? NetworkTypeTitle[networkType] : 'Settings'}
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
          {state.type === NetworkTypeEnum.CAPTIVEPORTAL && <PortalTypeForm />}
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
          <SummaryForm summaryData={state} />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
