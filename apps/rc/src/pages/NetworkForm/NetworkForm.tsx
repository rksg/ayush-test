import { useState, useRef, useEffect } from 'react'

import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { 
  useAddNetworkMutation,
  useGetNetworkQuery,
  useUpdateNetworkMutation } from '@acx-ui/rc/services'
import {
  NetworkTypeEnum,
  NetworkSaveData
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { OnboardingForm }          from './CaptivePortal/OnboardingForm'
import { PortalTypeForm }          from './CaptivePortal/PortalTypeForm'
import { PortalWebForm }           from './CaptivePortal/PortalWebForm'
import { NetworkDetailForm }       from './NetworkDetail/NetworkDetailForm'
import NetworkFormContext          from './NetworkFormContext'
import { NetworkMoreSettingsForm } from './NetworkMoreSettings/NetworkMoreSettingsForm'
import { AaaSettingsForm }         from './NetworkSettings/AaaSettingsForm'
import { DpskSettingsForm }        from './NetworkSettings/DpskSettingsForm'
import { OpenSettingsForm }        from './NetworkSettings/OpenSettingsForm'
import { PskSettingsForm }         from './NetworkSettings/PskSettingsForm'
import { SummaryForm }             from './NetworkSummary/SummaryForm'
import {
  transferDetailToSave,
  tranferSettingsToSave,
  transferMoreSettingsToSave
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
  const cloneMode = params.action === 'clone'
  const [networkType, setNetworkType] = useState<NetworkTypeEnum | undefined>()

  const [addNetwork] = useAddNetworkMutation()
  const [updateNetwork] = useUpdateNetworkMutation()
  const [enableMoreSettings, setEnabled] = useState(false)


  const formRef = useRef<StepsFormInstance<NetworkSaveData>>()

  const [saveState, updateSaveState] = useState<NetworkSaveData>({
    name: '',
    type: NetworkTypeEnum.AAA,
    isCloudpathEnabled: false
  })

  const updateSaveData = (saveData: Partial<NetworkSaveData>) => {
    if(saveData.isCloudpathEnabled){
      delete saveState.authRadius
      delete saveState.accountingRadius
    }else{
      delete saveState.cloudpathServerId
    }
    const newSavedata = { ...saveState, ...saveData }
    newSavedata.wlan = { ...saveState?.wlan, ...saveData.wlan }
    updateSaveState({ ...saveState, ...newSavedata })
  }

  const handleNetworkDetail = async (data: NetworkSaveData) => {
    const detailsSaveData = transferDetailToSave(data)
    updateSaveData(detailsSaveData as NetworkSaveData)
    return true
  }

  const handleSettings = async (data: NetworkSaveData) => {
    const settingData = {
      ...{ type: saveState.type },
      ...data
    }
    let settingSaveData = tranferSettingsToSave(settingData) as NetworkSaveData
    if(!editMode) {
      settingSaveData = transferMoreSettingsToSave(data, settingSaveData)
    }
    updateSaveData(settingSaveData as NetworkSaveData)
    return true
  }

  const handlePortalWebPage = async (data: NetworkSaveData) => {
    const tmpGuestPageState = { 
      guestPortal: {
        ...saveState?.guestPortal,
        guestPage: {
          ...data
        }
      } 
    }
    updateSaveData({ ...saveState, ...tmpGuestPageState } as NetworkSaveData)
    return true
  }

  const handleVenues = async (data: NetworkSaveData) => {
    updateSaveData(data as NetworkSaveData)
    return true
  }

  const { data } = useGetNetworkQuery({ params })

  useEffect(() => {
    if(data){
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
      if (cloneMode) {
        formRef?.current?.setFieldsValue({ name: data.name + ' - copy' })
      }
      updateSaveData({ ...data, isCloudpathEnabled: data.cloudpathServerId !== undefined })
    }
  }, [data])

  const handleAddNetwork = async () => {
    try {
      const payload = _.omit(saveState, 'id') // omit id to handle clone
      await addNetwork({ params: { tenantId: params.tenantId }, payload: payload }).unwrap()
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
      <NetworkFormContext.Provider value={{ setNetworkType, editMode, cloneMode, data }}>
        <StepsForm<NetworkSaveData>
          formRef={formRef}
          editMode={editMode}
          onCancel={() => navigate(linkToNetworks)}
          onFinish={editMode ? handleEditNetwork : handleAddNetwork}
        >
          <StepsForm.StepForm
            name='details'
            title={$t({ defaultMessage: 'Network Details' })}
            onFinish={handleNetworkDetail}
          >
            <NetworkDetailForm />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='Settings'
            title={$t(settingTitle, { type: networkType })}
            onFinish={handleSettings}
          >
            {saveState.type === NetworkTypeEnum.AAA && <AaaSettingsForm />}
            {saveState.type === NetworkTypeEnum.OPEN && <OpenSettingsForm />}
            {saveState.type === NetworkTypeEnum.DPSK && <DpskSettingsForm />}
            {saveState.type === NetworkTypeEnum.CAPTIVEPORTAL && <PortalTypeForm />}
            {saveState.type === NetworkTypeEnum.PSK && <PskSettingsForm />}

            {!editMode && <>
              <Button
                type='link'
                onClick={() => {
                  setEnabled(!enableMoreSettings)
                }}
              >
                {enableMoreSettings ? $t({ defaultMessage: 'Show less settings' }) :
                  $t({ defaultMessage: 'Show more settings' })}
              </Button>
              {enableMoreSettings &&
                <NetworkMoreSettingsForm wlanData={saveState} />}
            </>
            }
          </StepsForm.StepForm>

          { networkType === NetworkTypeEnum.CAPTIVEPORTAL && 
            <StepsForm.StepForm
              name='onboarding'
              title={$t({ defaultMessage: 'Onboarding' })}
              onFinish={async () => {
                return true
              }}
            >
              <OnboardingForm />
            </StepsForm.StepForm>
          }

          { networkType === NetworkTypeEnum.CAPTIVEPORTAL && 
            <StepsForm.StepForm
              name='portalweb'
              title={$t({ defaultMessage: 'Portal Web Page' })}
              onFinish={handlePortalWebPage}
            >
              <PortalWebForm />
            </StepsForm.StepForm>
          }         

          <StepsForm.StepForm
            name='venues'
            title={$t({ defaultMessage: 'Venues' })}
            onFinish={handleVenues}
          >
            <Venues />
          </StepsForm.StepForm>
          {!editMode &&
            <StepsForm.StepForm name='summary' title={$t({ defaultMessage: 'Summary' })}>
              <SummaryForm summaryData={saveState} />
            </StepsForm.StepForm>
          }
        </StepsForm>
      </NetworkFormContext.Provider>
    </>
  )
}


