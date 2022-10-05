import { useState, useRef } from 'react'

import {
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
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

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

export function AddIntegrator () {
  const navigate = useNavigate()
  const linkToIntegrators = useTenantLink('/integrators', 'v')
  const params = useParams()
  const [networkType, setNetworkType] = useState<NetworkTypeEnum | undefined>()

  //   const [createNetwork] = useCreateNetworkMutation()
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

  const handleAddIntegrator = async () => {
    try {
    //   await createNetwork({ params, payload: saveState }).unwrap()
      await wait(1000) // mimic external service call
      showToast({ type: 'success', content: 'Submitted' }) // show notification to indicate submission successful
      navigate(linkToIntegrators, { replace: true })
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
        title='Add Integrator'
        breadcrumb={[
          { text: 'Integrators', link: '/integrators', tenantType: 'v' }
        ]}
      />
      <StepsForm<CreateNetworkFormFields>
        formRef={formRef}
        onCancel={() => navigate(linkToIntegrators)}
        onFinish={handleAddIntegrator}
      >
        <StepsForm.StepForm<CreateNetworkFormFields>
          name='details'
          title='Account Details'
          //   validateTrigger='onBlur'
          onFinish={async (data) => {
            // // const detailsSaveData = transferDetailToSave(data)
            // updateData(data)
            // updateSaveData(detailsSaveData)
            return true
          }}
        >
          {/* <NetworkFormContext.Provider value={{ setNetworkType }}>
            <NetworkDetailForm />
          </NetworkFormContext.Provider> */}
        </StepsForm.StepForm>

        <StepsForm.StepForm<CreateNetworkFormFields>
          name='customers'
          title='Customers'
          //   validateTrigger='onBlur'
          onFinish={async (data) => {
            // // const detailsSaveData = transferDetailToSave(data)
            // updateData(data)
            // updateSaveData(detailsSaveData)
            return true
          }}
        >
          {/* <NetworkFormContext.Provider value={{ setNetworkType }}>
            <NetworkDetailForm />
          </NetworkFormContext.Provider> */}
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='subscriptions'
          title={'Subscriptions'}
          //   validateTrigger='onBlur'
          onFinish={async (data) => {
            data = {
              ...data,
              ...{ type: state.type, isCloudpathEnabled: data.isCloudpathEnabled }
            }
            // const settingSaveData = tranferSettingsToSave(data)
            // updateData(data)
            // updateSaveData(settingSaveData)
            return true
          }}
        >
        </StepsForm.StepForm>

        <StepsForm.StepForm name='summary' title='Summary'>
          {/* <SummaryForm summaryData={state} /> */}
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
