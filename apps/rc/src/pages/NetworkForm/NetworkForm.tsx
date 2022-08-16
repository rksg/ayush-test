import { useState, useRef } from 'react'

import _                          from 'lodash'
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
  AnyNetwork
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { OnboardingForm }    from './CaptivePortal/OnboardingForm'
import { PortalTypeForm }    from './CaptivePortal/PortalTypeForm'
import { PortalWebForm }     from './CaptivePortal/PortalWebForm'
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
    isCloudpathEnabled: false
  })
  const formRef = useRef<StepsFormInstance<CreateNetworkFormFields>>()

  const updateData = (newData: Partial<CreateNetworkFormFields>) => {
    updateState({ ...state, ...newData })
  }

  const [saveState, updateSaveState] = useState<AnyNetwork>()

  const updateSaveData = (saveData: AnyNetwork) => {
    if( state.isCloudpathEnabled ){
      delete saveState?.accountingRadius
      delete saveState?.authRadius
    }else{
      delete saveState?.cloudpathServerId
    }
    const wlan = _.merge(saveState?.wlan, saveData.wlan)
    saveData.wlan = wlan
    const newSavedata = _.merge(saveState, saveData)
    updateSaveState(newSavedata)
  }

  const handleNetworkDetail = async (data: CreateNetworkFormFields) => {
    const detailsSaveData = transferDetailToSave(data)
    updateData(data)
    updateSaveData(detailsSaveData as AnyNetwork)
    return true
  }

  const handleSettings = async (data: CreateNetworkFormFields) => {
    data = {
      ...data,
      ...{ type: state.type, isCloudpathEnabled: data.isCloudpathEnabled }
    }
    const settingSaveData = tranferSettingsToSave(data)
    updateData(data)
    updateSaveData(settingSaveData as AnyNetwork)
    return true
  }

  const handlePortalWebPage = async (data: CreateNetworkFormFields) => {
    const tmpGuestPageState = { 
      guestPortal: {
        ...saveState?.guestPortal,
        guestPage: {
          ...data
        }
      } 
    }
    updateSaveData({ ...saveState, ...tmpGuestPageState } as AnyNetwork)
    return true
  }

  const handleVenues = async (data: CreateNetworkFormFields) => {
    updateData(data)
    updateSaveData(data as AnyNetwork)
    return true
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
      <StepsForm<AnyNetwork>
        formRef={formRef}
        onCancel={() => navigate(linkToNetworks)}
        onFinish={handleAddNetwork}
      >
        <StepsForm.StepForm
          name='details'
          title={$t({ defaultMessage: 'Network Details' })}
          onFinish={handleNetworkDetail}
        >
          <NetworkFormContext.Provider value={{ setNetworkType }}>
            <NetworkDetailForm />
          </NetworkFormContext.Provider>
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='Settings'
          title={$t(settingTitle, { type: networkType })}
          onFinish={handleSettings}
        >
          {state.type === NetworkTypeEnum.AAA && <AaaSettingsForm />}
          {state.type === NetworkTypeEnum.OPEN && <OpenSettingsForm />}
          {state.type === NetworkTypeEnum.DPSK && <DpskSettingsForm />}
          {state.type === NetworkTypeEnum.CAPTIVEPORTAL && <PortalTypeForm />}
        </StepsForm.StepForm>

        { networkType === NetworkTypeEnum.CAPTIVEPORTAL && 
        <StepsForm.StepForm
          name='onboarding'
          title={$t({ defaultMessage: 'Onboarding' })}
          onFinish={async () => {
            return true
          }}
        >
          <OnboardingForm formRef={formRef} />
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
          <Venues formRef={formRef} />
        </StepsForm.StepForm>

        <StepsForm.StepForm name='summary' title={$t({ defaultMessage: 'Summary' })}>
          <SummaryForm summaryData={state} />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
