import { useState, useRef, useEffect } from 'react'

import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import {
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  useAddNetworkMutation,
  useGetNetworkQuery,
  useUpdateNetworkMutation
} from '@acx-ui/rc/services'
import {
  NetworkTypeEnum,
  NetworkSaveData,
  GuestNetworkTypeEnum,
  Demo
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { CloudpathForm }           from './CaptivePortal/CloudpathForm'
import { GuestPassForm }           from './CaptivePortal/GuestPassForm'
import { HostApprovalForm }        from './CaptivePortal/HostApprovalForm'
import { OnboardingForm }          from './CaptivePortal/OnboardingForm'
import { PortalTypeForm }          from './CaptivePortal/PortalTypeForm'
import { SelfSignInForm }          from './CaptivePortal/SelfSignInForm'
import { WISPrForm }               from './CaptivePortal/WISPrForm'
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
  transferMoreSettingsToSave,
  transferVenuesToSave,
  updateClientIsolationAllowlist
} from './parser'
import PortalInstance from './PortalInstance'
import { Venues }     from './Venues/Venues'


const settingTitle = defineMessage({
  defaultMessage: `{type, select,
    aaa {AAA Settings}
    dpsk {DPSK Settings}
    other {Settings}
    guest {Portal Type}
  }`
})
const onboardingTitle = defineMessage({
  defaultMessage: `{type, select,
    WISPr {Settings}
    Cloudpath {Settings}
    GuestPass {Host Settings}
    HostApproval {Host Settings}
    other {Onboarding}
  }`
})
export default function NetworkForm () {
  const intl = useIntl()
  const navigate = useNavigate()
  const linkToNetworks = useTenantLink('/networks')
  const params = useParams()
  const editMode = params.action === 'edit'
  const cloneMode = params.action === 'clone'

  const [addNetwork] = useAddNetworkMutation()
  const [updateNetwork] = useUpdateNetworkMutation()
  const formRef = useRef<StepsFormInstance<NetworkSaveData>>()

  const [saveState, updateSaveState] = useState<NetworkSaveData>({
    name: '',
    type: NetworkTypeEnum.OPEN,
    isCloudpathEnabled: false,
    venues: []
  })
  const [portalDemo, setPortalDemo]=useState<Demo>()
  const updateSaveData = (saveData: Partial<NetworkSaveData>) => {
    if(saveState.isCloudpathEnabled){
      delete saveState.authRadius
      delete saveState.accountingRadius
    }else{
      delete saveState.cloudpathServerId
    }
    if(!editMode&&!saveState.enableAccountingService){
      delete saveState.accountingRadius
    }
    const newSavedata = { ...saveState, ...saveData }
    newSavedata.wlan = { ...saveState?.wlan, ...saveData.wlan }
    updateSaveState({ ...saveState, ...newSavedata })
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

  const handlePortalWebPage = async (data: NetworkSaveData) => {
    if(!data.guestPortal?.socialIdentities?.facebook){
      delete data.guestPortal?.socialIdentities?.facebook
    }
    if(!data.guestPortal?.socialIdentities?.google){
      delete data.guestPortal?.socialIdentities?.google
    }
    if(!data.guestPortal?.socialIdentities?.twitter){
      delete data.guestPortal?.socialIdentities?.twitter
    }
    if(!data.guestPortal?.socialIdentities?.linkedin){
      delete data.guestPortal?.socialIdentities?.linkedin
    }
    const tmpGuestPageState = {
      enableDhcp: _.isUndefined(data.enableDhcp)? saveState.enableDhcp : data.enableDhcp,
      guestPortal: {
        ...saveState?.guestPortal,
        ...data.guestPortal,
        //other properties value
        enableSelfService: true,
        endOfDayReauthDelay: false,
        lockoutPeriod: 120,
        lockoutPeriodEnabled: false,
        macCredentialsDuration: 240,
        maxDevices: 1,
        userSessionGracePeriod: 60,
        userSessionTimeout: 1440
      },
      wlan: {
        ...saveState.wlan,
        ...data.wlan
      },
      portalServiceProfileId: data.portalServiceProfileId
    }
    if(!tmpGuestPageState.portalServiceProfileId){
      delete tmpGuestPageState.portalServiceProfileId
    }
    if(!tmpGuestPageState.guestPortal.redirectUrl){
      delete tmpGuestPageState.guestPortal.redirectUrl
    }
    if(tmpGuestPageState.guestPortal.wisprPage){
      if(data.authRadius){
        tmpGuestPageState.guestPortal.wisprPage.authRadius = { ...data.authRadius }
      }
      if(data.accountingRadius){
        tmpGuestPageState.guestPortal.wisprPage.accountingRadius = { ...data.accountingRadius }
      }
    }
    if(saveState.guestPortal?.guestNetworkType !== GuestNetworkTypeEnum.Cloudpath){
      delete data.authRadius
      delete data.accountingRadius
      delete data.enableAccountingService
    }
    updateSaveData({ ...data, ...saveState, ...tmpGuestPageState } as NetworkSaveData)
    return true
  }

  const handleAddNetwork = async () => {
    try {
      const payload = updateClientIsolationAllowlist(_.omit(saveState, 'id')) // omit id to handle clone
      await addNetwork({ params, payload }).unwrap()
      navigate(linkToNetworks, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleEditNetwork = async (data: NetworkSaveData) => {
    try {
      const payload = updateClientIsolationAllowlist({ ...saveState, venues: data.venues })
      await updateNetwork({ params, payload }).unwrap()
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
        title={editMode
          ? intl.$t({ defaultMessage: 'Edit Network' })
          : intl.$t({ defaultMessage: 'Create New Network' })}
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'Networks' }), link: '/networks' }
        ]}
      />
      <NetworkFormContext.Provider value={{
        editMode,
        cloneMode,
        data: saveState,
        setData: updateSaveState
      }}>
        <StepsForm<NetworkSaveData>
          formRef={formRef}
          editMode={editMode}
          onCancel={() => navigate(linkToNetworks)}
          onFinish={editMode ? handleEditNetwork : handleAddNetwork}
        >
          <StepsForm.StepForm
            name='details'
            title={intl.$t({ defaultMessage: 'Network Details' })}
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
            title={intl.$t(settingTitle, { type: saveState.type })}
            onFinish={async (data) => {
              if(saveState.type === NetworkTypeEnum.CAPTIVEPORTAL &&
                 (editMode||cloneMode))return true
              const settingData = {
                ...{ type: saveState.type },
                ...data
              }
              let settingSaveData = tranferSettingsToSave(settingData, editMode)
              if(!editMode) {
                settingSaveData = transferMoreSettingsToSave(data, settingSaveData)
              }
              updateSaveData(settingSaveData)
              return true
            }}
          >
            {saveState.type === NetworkTypeEnum.AAA && <AaaSettingsForm saveState={saveState}/>}
            {saveState.type === NetworkTypeEnum.OPEN && <OpenSettingsForm saveState={saveState}/>}
            {saveState.type === NetworkTypeEnum.DPSK && <DpskSettingsForm saveState={saveState}/>}
            {saveState.type === NetworkTypeEnum.CAPTIVEPORTAL && <PortalTypeForm/>}
            {saveState.type === NetworkTypeEnum.PSK && <PskSettingsForm saveState={saveState}/>}

          </StepsForm.StepForm>
          { saveState.type === NetworkTypeEnum.CAPTIVEPORTAL &&
              <StepsForm.StepForm
                name='onboarding'
                title={intl.$t(onboardingTitle, { type: saveState.guestPortal?.guestNetworkType })}
                onFinish={async (data) => {
                  delete data.walledGardensString
                  handlePortalWebPage(data)
                  return true
                }}
              >
                {saveState?.guestPortal?.guestNetworkType===
                 GuestNetworkTypeEnum.ClickThrough&&<OnboardingForm />}
                {saveState?.guestPortal?.guestNetworkType===
                 GuestNetworkTypeEnum.SelfSignIn&&<SelfSignInForm />}
                {saveState?.guestPortal?.guestNetworkType===
                 GuestNetworkTypeEnum.Cloudpath&&<CloudpathForm/>}
                {saveState?.guestPortal?.guestNetworkType===
                 GuestNetworkTypeEnum.HostApproval&&<HostApprovalForm />}
                {saveState?.guestPortal?.guestNetworkType===
                 GuestNetworkTypeEnum.GuestPass&&<GuestPassForm />}
                {saveState?.guestPortal?.guestNetworkType===
                 GuestNetworkTypeEnum.WISPr&&<WISPrForm />}
              </StepsForm.StepForm>
          }
          {editMode &&
            <StepsForm.StepForm
              name='moreSettings'
              title={intl.$t({ defaultMessage: 'More Settings' })}
              onFinish={async (data) => {
                const settingSaveData = transferMoreSettingsToSave(data, saveState)

                updateSaveData(settingSaveData)
                return true
              }}>

              <NetworkMoreSettingsForm wlanData={saveState} />

            </StepsForm.StepForm>}
          { saveState.type === NetworkTypeEnum.CAPTIVEPORTAL &&(
            saveState.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.ClickThrough||
            saveState.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.SelfSignIn||
            saveState.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.GuestPass||
            saveState.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.HostApproval
          )
              &&<StepsForm.StepForm
                name='portalweb'
                title={intl.$t({ defaultMessage: 'Portal Web Page' })}
                onFinish={handlePortalWebPage}
              >
                <PortalInstance updatePortalData={(data)=>setPortalDemo(data)}/>
              </StepsForm.StepForm>
          }
          <StepsForm.StepForm
            name='venues'
            title={intl.$t({ defaultMessage: 'Venues' })}
            onFinish={async (data) => {
              const settingSaveData = transferVenuesToSave(data, saveState)
              updateSaveData(settingSaveData)
              return true
            }}
          >
            <Venues />
          </StepsForm.StepForm>
          {!editMode &&
            <StepsForm.StepForm name='summary' title={intl.$t({ defaultMessage: 'Summary' })}>
              <SummaryForm summaryData={saveState} portalData={portalDemo}/>
            </StepsForm.StepForm>
          }
        </StepsForm>
      </NetworkFormContext.Provider>
    </>
  )
}

