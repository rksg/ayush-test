import { useState, useRef } from 'react'

import {
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useCreateNetworkMutation, useGetNetworkQuery, useUpdateNetworkDeepMutation } from '@acx-ui/rc/services'
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
  const editMode = params.action === 'edit'
  const [networkType, setNetworkType] = useState<NetworkTypeEnum | undefined>()

  const [createNetwork] = useCreateNetworkMutation()
  const [updateNetworkDeep] = useUpdateNetworkDeepMutation()
  //DetailsState
  const [state, updateState] = useState<CreateNetworkFormFields>({
    name: '',
    type: NetworkTypeEnum.OPEN,
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

  const { data } = useGetNetworkQuery({ params })

  if(data){
    formRef?.current?.setFieldsValue({ ...data, 
      isCloudpathEnabled: typeof data.cloudpathServerId !== 'undefined'
    })
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

  const handleEditNetwork = async () => {
    try {
      await updateNetworkDeep({ params, payload: saveState }).unwrap()
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
        title={editMode?'Edit Network':'Create New Network'}
        breadcrumb={[
          { text: 'Networks', link: '/networks' }
        ]}
      />
      <StepsForm<CreateNetworkFormFields>
        formRef={formRef}
        editMode={editMode}
        onCancel={() => navigate(linkToNetworks)}
        onFinish={editMode ? handleEditNetwork: handleAddNetwork}
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
            <NetworkDetailForm editMode={editMode}/>
          </NetworkFormContext.Provider>
        </StepsForm.StepForm>

        <StepsForm.StepForm
          formRef={formRef}
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
        </StepsForm.StepForm>

        <StepsForm.StepForm
          initialValues={data}
          params={data}
          request={(params) => {
            return Promise.resolve({
              data: params,
              success: true
            })
          }}
          name='venues'
          title='Venues'
          onFinish={async (data) => {
            updateData(data)
            updateSaveData(data)
            return true
          }}
        >
          <Venues formRef={formRef} editMode={editMode} />
        </StepsForm.StepForm>

        <StepsForm.StepForm name='summary' title='Summary'>
          <SummaryForm summaryData={state} />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
