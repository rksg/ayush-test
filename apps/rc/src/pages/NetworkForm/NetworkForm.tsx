import { useState, useRef, useEffect } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import {
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useCreateNetworkMutation, useGetNetworkQuery, useUpdateNetworkMutation } from '@acx-ui/rc/services'
import {
  NetworkTypeEnum,
  NetworkSaveData
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { NetworkDetailForm } from './NetworkDetail/NetworkDetailForm'
import NetworkFormContext    from './NetworkFormContext'
import { AaaSettingsForm }   from './NetworkSettings/AaaSettingsForm'
import { DpskSettingsForm }  from './NetworkSettings/DpskSettingsForm'
import { OpenSettingsForm }  from './NetworkSettings/OpenSettingsForm'
import { PskSettingsForm }   from './NetworkSettings/PskSettingsForm'
import { SummaryForm }       from './NetworkSummary/SummaryForm'
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
  const editMode = params.action === 'edit'
  const [networkType, setNetworkType] = useState<NetworkTypeEnum | undefined>()

  const [createNetwork] = useCreateNetworkMutation()
  const [updateNetwork] = useUpdateNetworkMutation()

  const formRef = useRef<StepsFormInstance<NetworkSaveData>>()

  const [saveState, updateSaveState] = useState<NetworkSaveData>({
    name: '',
    type: NetworkTypeEnum.OPEN,
    isCloudpathEnabled: false,
    venues: []
  })

  const updateSaveData = (saveData: Partial<NetworkSaveData>) => {
    const newSavedata = { ...saveState, ...saveData }
    newSavedata.wlan = { ...saveState?.wlan, ...saveData.wlan }
    updateSaveState({ ...saveState, ...newSavedata })
  }

  const { data } = useGetNetworkQuery({ params })

  useEffect(() => {
    if(data){
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
      updateSaveData({ ...data, isCloudpathEnabled: data.cloudpathServerId !== undefined })
    }
  }, [data])

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

  const handleEditNetwork = async () => {
    try {
      await updateNetwork({ params, payload: saveState }).unwrap()
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
        title={editMode ?
          $t({ defaultMessage: 'Edit Network' }) : $t({ defaultMessage: 'Create New Network' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Networks' }), link: '/networks' }
        ]}
      />
      <NetworkFormContext.Provider value={{ setNetworkType, editMode, data }}>
        <StepsForm<NetworkSaveData>
          formRef={formRef}
          editMode={editMode}
          onCancel={() => navigate(linkToNetworks)}
          onFinish={editMode ? handleEditNetwork : handleAddNetwork}
        >
          <StepsForm.StepForm
            name='details'
            title={$t({ defaultMessage: 'Network Details' })}
            onFinish={async (data) => {
              const detailsSaveData = transferDetailToSave(data)
              updateSaveData(detailsSaveData)
              return true
            }}
          >
            <NetworkDetailForm />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='settings'
            title={$t(settingTitle, { type: networkType })}
            onFinish={async (data) => {
              const settingData = { 
                ...{ type: saveState.type },
                ...data
              }
              const settingSaveData = tranferSettingsToSave(settingData)
              updateSaveData(settingSaveData)
              return true
            }}
          >
            {saveState.type === NetworkTypeEnum.AAA && <AaaSettingsForm />}
            {saveState.type === NetworkTypeEnum.OPEN && <OpenSettingsForm />}
            {saveState.type === NetworkTypeEnum.DPSK && <DpskSettingsForm />}
            {saveState.type === NetworkTypeEnum.PSK && <PskSettingsForm />}
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
            title={$t({ defaultMessage: 'Venues' })}
            onFinish={async (data) => {
              updateSaveData(data)
              return true
            }}
          >
            <Venues />
          </StepsForm.StepForm>

          <StepsForm.StepForm name='summary' title={$t({ defaultMessage: 'Summary' })}>
            <SummaryForm summaryData={saveState} />
          </StepsForm.StepForm>
        </StepsForm>
      </NetworkFormContext.Provider>
    </>
  )
}
