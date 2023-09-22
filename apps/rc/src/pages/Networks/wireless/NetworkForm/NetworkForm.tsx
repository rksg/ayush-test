import { useEffect, useRef, useState } from 'react'

import { Form }                   from 'antd'
import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import { PageHeader, StepsForm, StepsFormLegacy, StepsFormLegacyInstance } from '@acx-ui/components'
import {
  useAddNetworkMutation,
  useAddNetworkVenuesMutation,
  useDeleteNetworkVenuesMutation,
  useGetNetworkQuery,
  useUpdateNetworkMutation,
  useUpdateNetworkVenueMutation
} from '@acx-ui/rc/services'
import {
  AuthRadiusEnum,
  Demo,
  GuestNetworkTypeEnum,
  GuestPortal,
  LocationExtended,
  Network,
  NetworkSaveData,
  NetworkTypeEnum,
  NetworkVenue,
  redirectPreviousPage
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

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
  tranferSettingsToSave,
  transferDetailToSave,
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
const minutesMapping: { [key:string]:number }={
  hours: 60,
  days: 1440,
  minutes: 1
}
interface GuestMore {
  guestPortal?: GuestPortal,
  userSessionTimeoutUnit?: string,
  macCredentialsDurationUnit?: string,
  lockoutPeriodUnit?: string

}
export default function NetworkForm (props:{
  modalMode?: boolean,
  createType?: NetworkTypeEnum,
  modalCallBack?: ()=>void
}) {
  const { modalMode, createType, modalCallBack } = props
  const intl = useIntl()
  const navigate = useNavigate()
  const location = useLocation()
  const linkToNetworks = useTenantLink('/networks')
  const params = useParams()
  const editMode = params.action === 'edit'
  const cloneMode = params.action === 'clone'

  const [addNetwork] = useAddNetworkMutation()
  const [updateNetwork] = useUpdateNetworkMutation()
  const [addNetworkVenues] = useAddNetworkVenuesMutation()
  const [updateNetworkVenue] = useUpdateNetworkVenueMutation()
  const [deleteNetworkVenues] = useDeleteNetworkVenuesMutation()
  const formRef = useRef<StepsFormLegacyInstance<NetworkSaveData>>()
  const [form] = Form.useForm()

  const [saveState, updateSaveState] = useState<NetworkSaveData>({
    name: '',
    type: createType || NetworkTypeEnum.OPEN,
    isCloudpathEnabled: false,
    venues: []
  })

  const saveContextRef = useRef<NetworkSaveData>()

  const [portalDemo, setPortalDemo]=useState<Demo>()
  const [previousPath, setPreviousPath] = useState('')
  const updateSaveData = (saveData: Partial<NetworkSaveData>) => {
    if(!editMode&&!saveState.enableAccountingService){
      delete saveState.accountingRadius
    }

    const newSavedata = { ...saveState, ...saveData }
    newSavedata.wlan = { ...saveState?.wlan, ...saveData.wlan }
    updateSaveState({ ...saveState, ...newSavedata })
  }

  const { data } = useGetNetworkQuery({ params })

  useEffect(() => {
    if(saveState){
      saveContextRef.current = saveState
    }
  }, [saveState])

  useEffect(() => {
    if(data){
      let name = data.name
      if (cloneMode) {
        name = data.name + ' - copy'
        formRef.current?.resetFields()
        formRef.current?.setFieldsValue({
          ...data, name, isCloudpathEnabled: data.authRadius?true:false,
          enableAccountingService: (data.accountingRadius||
            data.guestPortal?.wisprPage?.accountingRadius)?true:false })
      }else if(editMode){
        form?.resetFields()
        form?.setFieldsValue({
          ...data, name, isCloudpathEnabled: data.authRadius?true:false,
          enableAccountingService: (data.accountingRadius||
            data.guestPortal?.wisprPage?.accountingRadius)?true:false })
      }
      updateSaveData({ ...data, name, isCloudpathEnabled: data.authRadius?true:false,
        enableAccountingService: (data.accountingRadius||
          data.guestPortal?.wisprPage?.accountingRadius)?true:false })
    }
  }, [data])

  useEffect(() => {
    setPreviousPath((location as LocationExtended)?.state?.from?.pathname)
  }, [])

  const handleDetails = async (data: NetworkSaveData) => {
    const detailsSaveData = transferDetailToSave(data)
    if(modalMode&&createType){
      detailsSaveData.type = createType
    }
    if(createType === NetworkTypeEnum.CAPTIVEPORTAL){
      updateSaveData({ ...detailsSaveData,
        guestPortal: { guestNetworkType: GuestNetworkTypeEnum.GuestPass } })
    }
    else updateSaveData(detailsSaveData)
    return true
  }

  const handleSettings = async (data: NetworkSaveData) => {
    if (saveState.type !== NetworkTypeEnum.CAPTIVEPORTAL) {
      const settingData = {
        ...{ type: saveState.type },
        ...data
      }

      let settingSaveData = tranferSettingsToSave(settingData, editMode)
      if (!editMode) {
        settingSaveData = transferMoreSettingsToSave(data, settingSaveData)
      }
      updateSaveData(settingSaveData)
    }else {
      if(!(editMode||cloneMode)){
        if(_.get(data, 'lockoutPeriodUnit')&&data?.guestPortal?.lockoutPeriod){
          data.guestPortal={
            ...data.guestPortal,
            lockoutPeriod: data.guestPortal.lockoutPeriod*
            minutesMapping[_.get(data, 'lockoutPeriodUnit')]
          }
        }
        const settingCaptiveData = {
          ...{ type: saveState.type },
          ...data
        }
        let settingCaptiveSaveData = tranferSettingsToSave(settingCaptiveData, editMode)
        if (!editMode) {
          settingCaptiveSaveData = transferMoreSettingsToSave(data, settingCaptiveSaveData)
        }
        updateSaveData(settingCaptiveSaveData)
      }
    }
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOnboarding = async (data: any) => {
    delete data.walledGardensString
    if(saveState.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.Cloudpath){
      delete data.guestPortal.wisprPage
    }
    const dataMore = handleGuestMoreSetting(data)
    handlePortalWebPage(dataMore)
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMoreSettings = async (data: any) => {
    const dataMore = handleGuestMoreSetting(data)
    const settingSaveData = transferMoreSettingsToSave(dataMore, saveState)
    updateSaveData(settingSaveData)
    return true
  }

  const handleGuestMoreSetting = (data: GuestMore) => {
    if(data.guestPortal){
      if(saveState.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr
        &&data.guestPortal.wisprPage?.customExternalProvider){
        data.guestPortal = {
          ...data.guestPortal,
          wisprPage: {
            ...data.guestPortal.wisprPage,
            externalProviderName: data.guestPortal.wisprPage.providerName
          }
        }
      }
    }
    return data
  }

  const handleUserConnection = (data: GuestMore) => {
    if(data.guestPortal){
      if(data.guestPortal.userSessionTimeout&&data.userSessionTimeoutUnit){
        data.guestPortal={
          ...data.guestPortal,
          userSessionTimeout: data.guestPortal.userSessionTimeout*
          minutesMapping[data.userSessionTimeoutUnit]
        }
      }
      if(data.lockoutPeriodUnit&&data.guestPortal.lockoutPeriod){
        data.guestPortal={
          ...data.guestPortal,
          lockoutPeriod: data.guestPortal.lockoutPeriod*
          minutesMapping[data.lockoutPeriodUnit]
        }
      }
      if(data.macCredentialsDurationUnit&&data.guestPortal.macCredentialsDuration){
        data.guestPortal={
          ...data.guestPortal,
          macCredentialsDuration: data.guestPortal.macCredentialsDuration*
          minutesMapping[data.macCredentialsDurationUnit]
        }
      }
    }
    return data
  }

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
        //other properties value
        enableSelfService: true,
        endOfDayReauthDelay: false,
        lockoutPeriod: 120,
        lockoutPeriodEnabled: false,
        macCredentialsDuration: 240,
        maxDevices: 1,
        userSessionGracePeriod: 60,
        userSessionTimeout: 1440,
        ...saveState?.guestPortal,
        ...data.guestPortal
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
    if(saveState.guestPortal?.guestNetworkType !== GuestNetworkTypeEnum.Cloudpath){
      delete data.authRadius
      delete data.accountingRadius
      delete data.enableAccountingService
      delete data.accountingRadiusId
      delete data.authRadiusId
    }
    updateSaveData({ ...data, ...saveState, ...tmpGuestPageState } as NetworkSaveData)
    return true
  }

  const handleVenues = async (data: NetworkSaveData) => {
    let venueData = data
    if (cloneMode) {
      venueData = {
        venues: data.venues?.map(v => {
          if (v.apGroups) {
            v.apGroups.map((ag: { id?: string }) => {
              delete ag.id
              return ag
            })
          }
          return v
        }) || []
      }
    }
    const settingSaveData = transferVenuesToSave(venueData, saveState)
    updateSaveData(settingSaveData)
    return true
  }

  const handleNetworkVenues = async (
    networkId : string,
    newNetworkVenues? : NetworkVenue[],
    oldNetworkVenues? : NetworkVenue[]
  )=> {
    let added: NetworkVenue[] = []
    let newIds: string[] = []
    let removed: string[] = []
    let update: NetworkVenue[] = []

    if (newNetworkVenues?.length) {
      newNetworkVenues?.forEach(networkVenue => {
        if (_.isUndefined(networkVenue.id) || _.isNull(networkVenue.id)) {
          networkVenue.networkId = networkId
          added.push(networkVenue)
        } else {
          newIds.push(networkVenue.id as string)
        }
      })
    }
    if (oldNetworkVenues?.length) {
      oldNetworkVenues?.forEach(networkVenue => {
        const networkVenueId = networkVenue.id
        if (!_.isUndefined(networkVenueId)) {
          if (!newIds.includes(networkVenueId)) {
            removed.push(networkVenueId)
          } else if (newNetworkVenues?.length) {
            const newNetworkVenue = newNetworkVenues.find(venue => venue.id === networkVenueId)
            if (newNetworkVenue) {
              // remove the undeifned or null field
              const oldNVenue = _.omitBy(networkVenue, _.isNil)
              const newNVenue = _.omitBy(newNetworkVenue, _.isNil)

              if (!_.isEqual(oldNVenue, newNVenue)) {
                update.push(newNetworkVenue) // config changed need to update
              }
            }
          }
        }
      })
    }

    if (added.length) {
      await addNetworkVenues({ payload: added }).unwrap()
    }
    if (removed.length) {
      await deleteNetworkVenues({ payload: removed }).unwrap()
    }


    if (update.length) {
      // ToDo: wait for backend support the updateNetworkVenues API
      // await updateNetworkVenues({ payload: update }).unwrap()

      update.forEach(networkVenue => {
        updateNetworkVenue({ params: {
          networkVenueId: networkVenue.id
        }, payload: networkVenue }).unwrap()
      })
    }
  }

  const handleAddNetwork = async () => {
    try {
      const dataConnection = handleUserConnection(saveState)
      const saveData = handleGuestMoreSetting(dataConnection)
      const payload = updateClientIsolationAllowlist(
        // omit id to handle clone
        _.omit(saveData,
          ['id',
           'networkSecurity',
           'enableOwe',
           'pskProtocol',
           'isOweMaster',
           'owePairNetworkId']))
      const result = await addNetwork({ params, payload }).unwrap()
      if (result && result.response && payload.venues) {
        // @ts-ignore
        const network: Network = result.response
        await handleNetworkVenues(network.id, payload.venues)
      }

      modalMode? modalCallBack?.() : redirectPreviousPage(navigate, previousPath, linkToNetworks)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const processData = function (data: NetworkSaveData) {
    handleSettings(data)

    if(data?.type === NetworkTypeEnum.CAPTIVEPORTAL){
      handleOnboarding(data)
    }

    const dataConnection = handleUserConnection(data)
    const dataMore = handleGuestMoreSetting(dataConnection)

    if(isPortalWebRender(dataMore)){
      handlePortalWebPage(dataMore)
    }

    if (dataMore.guestPortal?.wisprPage?.authType &&
      dataMore.guestPortal?.wisprPage?.authType === AuthRadiusEnum.ALWAYS_ACCEPT &&
      dataMore.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr) {
      saveContextRef.current = _.omit({ ...saveState, ...dataMore },
        ['authRadius',
          'accountingRadius',
          'enableAccountingService',
          'accountingRadiusId',
          'authRadiusId',
          'guestPortal.wisprPage.authRadius',
          'guestPortal.wisprPage.authRadiusId'
        ]
      )
    } else {
      if(!saveState.enableAccountingService){
        saveContextRef.current = _.omit({ ...saveState, ...dataMore },
          [
            'accountingRadius',
            'enableAccountingService',
            'accountingRadiusId',
            'enableOwe',
            'networkSecurity',
            'pskProtocol',
            'isOweMaster',
            'owePairNetworkId'
          ]
        )
      }else{
        saveContextRef.current = _.omit({ ...saveState, ...dataMore },
          [
            'enableOwe',
            'networkSecurity',
            'pskProtocol',
            'isOweMaster',
            'owePairNetworkId'
          ]
        )
      }
    }
  }

  const handleEditNetwork = async (formData: NetworkSaveData) => {
    try {
      processData(formData)
      const payload = updateClientIsolationAllowlist(saveContextRef.current as NetworkSaveData)
      await updateNetwork({ params, payload }).unwrap()
      if (payload.id && (payload.venues || data?.venues)) {
        await handleNetworkVenues(payload.id, payload.venues, data?.venues)
      }

      modalMode? modalCallBack?.() : redirectPreviousPage(navigate, previousPath, linkToNetworks)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      {!modalMode && <PageHeader
        title={editMode
          ? intl.$t({ defaultMessage: 'Edit Network' })
          : intl.$t({ defaultMessage: 'Create New Network' })}
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'Wi-Fi' }) },
          { text: intl.$t({ defaultMessage: 'Wi-Fi Networks' }) },
          { text: intl.$t({ defaultMessage: 'Network List' }), link: '/networks' }
        ]}
      />}
      {(!editMode || cloneMode) &&
        <NetworkFormContext.Provider value={{
          modalMode,
          createType,
          editMode,
          cloneMode,
          data: saveState,
          setData: updateSaveState
        }}>
          <StepsFormLegacy<NetworkSaveData>
            formRef={formRef}
            editMode={editMode}
            onCancel={() => modalMode
              ? modalCallBack?.()
              : redirectPreviousPage(navigate, previousPath, linkToNetworks)
            }
            onFinish={editMode ? handleEditNetwork : handleAddNetwork}
          >
            <StepsFormLegacy.StepForm
              name='details'
              title={intl.$t({ defaultMessage: 'Network Details' })}
              onFinish={handleDetails}
            >
              <NetworkDetailForm />
            </StepsFormLegacy.StepForm>

            <StepsFormLegacy.StepForm
              name='settings'
              title={intl.$t(settingTitle, { type: saveState.type })}
              onFinish={handleSettings}
            >
              {saveState.type === NetworkTypeEnum.AAA && <AaaSettingsForm />}
              {saveState.type === NetworkTypeEnum.OPEN && <OpenSettingsForm/>}
              {(saveState.type || createType) === NetworkTypeEnum.DPSK && <DpskSettingsForm />}
              {
                (saveState.type || createType) === NetworkTypeEnum.CAPTIVEPORTAL &&
                  <PortalTypeForm/>
              }
              {saveState.type === NetworkTypeEnum.PSK && <PskSettingsForm />}

            </StepsFormLegacy.StepForm>
            { saveState.type === NetworkTypeEnum.CAPTIVEPORTAL &&
                <StepsFormLegacy.StepForm
                  name='onboarding'
                  title={
                    intl.$t(onboardingTitle, { type: saveState.guestPortal?.guestNetworkType })}
                  onFinish={handleOnboarding}
                >
                  {pickOneCaptivePortalForm(saveState)}
                </StepsFormLegacy.StepForm>
            }
            { isPortalWebRender(saveState) &&<StepsFormLegacy.StepForm
              name='portalweb'
              title={intl.$t({ defaultMessage: 'Portal Web Page' })}
              onFinish={handlePortalWebPage}
            >
              <PortalInstance updatePortalData={(data)=>setPortalDemo(data)}/>
            </StepsFormLegacy.StepForm>
            }
            <StepsFormLegacy.StepForm
              name='venues'
              title={intl.$t({ defaultMessage: 'Venues' })}
              onFinish={handleVenues}
            >
              <Venues />
            </StepsFormLegacy.StepForm>
            <StepsFormLegacy.StepForm
              name='summary'
              title={intl.$t({ defaultMessage: 'Summary' })}
            >
              <SummaryForm summaryData={saveState} portalData={portalDemo}/>
            </StepsFormLegacy.StepForm>
          </StepsFormLegacy>
        </NetworkFormContext.Provider>
      }
      {editMode &&
        <NetworkFormContext.Provider value={{
          modalMode,
          createType,
          editMode,
          cloneMode,
          data: saveState,
          setData: updateSaveState
        }}>
          <StepsForm<NetworkSaveData>
            form={form}
            editMode={editMode}
            onCancel={() => modalMode
              ? modalCallBack?.()
              : redirectPreviousPage(navigate, previousPath, linkToNetworks)
            }
            onFinish={editMode ? handleEditNetwork : handleAddNetwork}
          >
            <StepsForm.StepForm
              name='details'
              title={intl.$t({ defaultMessage: 'Network Details' })}
              onFinish={handleDetails}
            >
              <NetworkDetailForm />
            </StepsForm.StepForm>

            <StepsForm.StepForm
              name='settings'
              title={intl.$t(settingTitle, { type: saveState.type })}
              onFinish={handleSettings}
            >
              {saveState.type === NetworkTypeEnum.AAA && <AaaSettingsForm />}
              {saveState.type === NetworkTypeEnum.OPEN && <OpenSettingsForm/>}
              {(saveState.type || createType) === NetworkTypeEnum.DPSK && <DpskSettingsForm />}
              {(saveState.type || createType) === NetworkTypeEnum.CAPTIVEPORTAL &&
                <PortalTypeForm/>}
              {saveState.type === NetworkTypeEnum.PSK && <PskSettingsForm />}

            </StepsForm.StepForm>
            { saveState.type === NetworkTypeEnum.CAPTIVEPORTAL &&
                <StepsForm.StepForm
                  name='onboarding'
                  title={
                    intl.$t(onboardingTitle, { type: saveState.guestPortal?.guestNetworkType })}
                  onFinish={handleOnboarding}
                >
                  {pickOneCaptivePortalForm(saveState)}
                </StepsForm.StepForm>
            }
            {editMode &&
              <StepsForm.StepForm
                name='moreSettings'
                title={intl.$t({ defaultMessage: 'More Settings' })}
                onFinish={handleMoreSettings}>

                <NetworkMoreSettingsForm wlanData={saveState} />

              </StepsForm.StepForm>}
            { isPortalWebRender(saveState) &&<StepsForm.StepForm
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
              onFinish={handleVenues}
            >
              <Venues />
            </StepsForm.StepForm>
          </StepsForm>
        </NetworkFormContext.Provider>
      }
    </>
  )
}

function isPortalWebRender (saveState: NetworkSaveData): boolean {
  if (saveState.type !== NetworkTypeEnum.CAPTIVEPORTAL) {
    return false
  }

  switch (saveState.guestPortal?.guestNetworkType) {
    case GuestNetworkTypeEnum.ClickThrough:
    case GuestNetworkTypeEnum.SelfSignIn:
    case GuestNetworkTypeEnum.GuestPass:
    case GuestNetworkTypeEnum.HostApproval:
      return true
    default:
      // eslint-disable-next-line no-console
      console.error(`Unknown Network Type: ${saveState?.guestPortal?.guestNetworkType}`)
      return false
  }
}

function pickOneCaptivePortalForm (saveState: NetworkSaveData) {
  switch (saveState?.guestPortal?.guestNetworkType) {
    case GuestNetworkTypeEnum.ClickThrough:
      return <OnboardingForm />
    case GuestNetworkTypeEnum.SelfSignIn:
      return <SelfSignInForm />
    case GuestNetworkTypeEnum.Cloudpath:
      return <CloudpathForm/>
    case GuestNetworkTypeEnum.HostApproval:
      return <HostApprovalForm />
    case GuestNetworkTypeEnum.GuestPass:
      return <GuestPassForm />
    case GuestNetworkTypeEnum.WISPr:
      return <WISPrForm />
    default:
      // eslint-disable-next-line no-console
      console.error(`Unknown Network Type: ${saveState?.guestPortal?.guestNetworkType}`)
      return <OnboardingForm />
  }
}
