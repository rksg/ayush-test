import { useEffect, useRef, useState, createContext } from 'react'

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
  useUpdateNetworkVenuesMutation,
  useAddNetworkTemplateMutation,
  useGetNetworkTemplateQuery,
  useUpdateNetworkTemplateMutation,
  useAddNetworkVenueTemplatesMutation,
  useActivateWifiOperatorOnWifiNetworkMutation,
  useActivateIdentityProviderOnWifiNetworkMutation,
  useActivateCertificateTemplateMutation,
  useGetCertificateTemplatesQuery
} from '@acx-ui/rc/services'
import {
  AuthRadiusEnum,
  Demo,
  generatePageHeaderTitle,
  GuestNetworkTypeEnum,
  GuestPortal,
  LocationExtended,
  Network,
  NetworkSaveData,
  NetworkTypeEnum,
  NetworkVenue,
  redirectPreviousPage,
  useConfigTemplateBreadcrumb,
  useConfigTemplate,
  useConfigTemplateMutationFnSwitcher,
  CommonResult,
  WlanSecurityEnum
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
import { Hotspot20SettingsForm }   from './NetworkSettings/Hotspot20SettingsForm'
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
import PortalInstance                       from './PortalInstance'
import { useNetworkVxLanTunnelProfileInfo } from './utils'
import { Venues }                           from './Venues/Venues'

export interface MLOContextType {
  isDisableMLO: boolean,
  disableMLO: (state: boolean) => void
}

export const MLOContext = createContext({} as MLOContextType)

const settingTitle = defineMessage({
  defaultMessage: `{type, select,
    aaa {AAA Settings}
    hotspot20 {Hotspot 2.0 Settings}
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
  minutes: 1,
  weeks: 10080
}
interface GuestMore {
  guestPortal?: GuestPortal,
  userSessionTimeoutUnit?: string,
  macCredentialsDurationUnit?: string,
  lockoutPeriodUnit?: string

}
export function NetworkForm (props:{
  modalMode?: boolean,
  createType?: NetworkTypeEnum,
  modalCallBack?: ()=>void,
  defaultActiveVenues?: string[]
}) {
  const { modalMode, createType, modalCallBack, defaultActiveVenues } = props
  const intl = useIntl()
  const navigate = useNavigate()
  const location = useLocation()
  const linkToNetworks = useTenantLink('/networks')
  const params = useParams()
  const editMode = params.action === 'edit'
  const cloneMode = params.action === 'clone'

  const addNetworkInstance = useAddInstance()
  const updateNetworkInstance = useUpdateInstance()
  const [addNetworkVenues] = useConfigTemplateMutationFnSwitcher(
    useAddNetworkVenuesMutation, useAddNetworkVenueTemplatesMutation
  )
  const [updateNetworkVenues] = useUpdateNetworkVenuesMutation()
  const [deleteNetworkVenues] = useDeleteNetworkVenuesMutation()
  const [activateHotspot20NetworkOperator] = useActivateWifiOperatorOnWifiNetworkMutation()
  const [activateHotspot20NetworkProvider] = useActivateIdentityProviderOnWifiNetworkMutation()
  const activateCertificateTemplate = useCertificateTemplateActivation()
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
  const [MLOButtonDisable, setMLOButtonDisable] = useState(true)

  const updateSaveData = (saveData: Partial<NetworkSaveData>) => {
    if(!editMode&&!saveState.enableAccountingService){
      delete saveState.accountingRadius
    }

    // dpsk wpa3/wpa2 mixed mode doesn't support radius server option
    if (saveData.dpskWlanSecurity === WlanSecurityEnum.WPA23Mixed
        && !saveData.isCloudpathEnabled) {
      delete saveState.authRadius
      delete saveState.authRadiusId
      delete saveData?.authRadius
      delete saveData?.authRadiusId
    }

    const newSavedata = { ...saveState, ...saveData }
    newSavedata.wlan = { ...saveState?.wlan, ...saveData.wlan }
    updateSaveState({ ...saveState, ...newSavedata })
  }

  const { data } = useGetInstance(editMode)
  const networkVxLanTunnelProfileInfo = useNetworkVxLanTunnelProfileInfo(data ?? null)
  const { certificateTemplateId } = useGetCertificateTemplatesQuery(
    { payload: { pageSize: 1, page: 1, filters: { networkId: [data?.id] } } },
    {
      skip: !(editMode || cloneMode) || !data?.useCertificateTemplate,
      selectFromResult: ({ data }) => ({ certificateTemplateId: data?.data[0]?.id })
    })

  // Config Template related states
  const { isTemplate } = useConfigTemplate()
  const breadcrumb = useConfigTemplateBreadcrumb([
    { text: intl.$t({ defaultMessage: 'Wi-Fi' }) },
    { text: intl.$t({ defaultMessage: 'Wi-Fi Networks' }) },
    { text: intl.$t({ defaultMessage: 'Network List' }), link: '/networks' }
  ])
  const pageTitle = generatePageHeaderTitle({
    isEdit: editMode,
    isTemplate,
    instanceLabel: intl.$t({ defaultMessage: 'Network' }),
    addLabel: intl.$t({ defaultMessage: 'Create New' })
  })

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
          data.guestPortal?.wisprPage?.accountingRadius)?true:false, certificateTemplateId })
    }
  }, [data, certificateTemplateId])

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
        // eslint-disable-next-line max-len
        settingSaveData = transferMoreSettingsToSave(data, settingSaveData, networkVxLanTunnelProfileInfo)
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
    let dataMore = handleGuestMoreSetting(data)

    if (!editMode) {
      // eslint-disable-next-line max-len
      dataMore = transferMoreSettingsToSave(dataMore, saveState, networkVxLanTunnelProfileInfo)
    }
    handlePortalWebPage(dataMore)
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMoreSettings = async (data: any) => {
    const dataMore = handleGuestMoreSetting(data)
    // eslint-disable-next-line max-len
    const settingSaveData = transferMoreSettingsToSave(dataMore, saveState, networkVxLanTunnelProfileInfo)
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
      await updateNetworkVenues({ payload: update }).unwrap()
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
            'owePairNetworkId',
            'certificateTemplateId',
            'hotspot20Settings.wifiOperator',
            'hotspot20Settings.identityProviders']))
      const result = await addNetworkInstance({ params, payload,
        callback: async (res: CommonResult) => {
          if (saveState.type === NetworkTypeEnum.HOTSPOT20) {
            await activateHotspot20NetworkOperator(
              { params: {
                wifiNetworkId: res.response?.id,
                providerId: saveState.hotspot20Settings?.wifiOperator } }).unwrap()
            saveState.hotspot20Settings?.identityProviders?.forEach(async (id) => {
              await activateHotspot20NetworkProvider(
                { params: {
                  wifiNetworkId: res.response?.id,
                  providerId: id
                } }
              ).unwrap()
            })
          }
        } }).unwrap()
        .catch(err => {
          console.log(err) // eslint-disable-line no-console
        })
      if (result && result.response && payload.venues) {
        // @ts-ignore
        const network: Network = networkResponse.response
        await handleNetworkVenues(network.id, payload.venues)
      }

      modalMode ? modalCallBack?.() : redirectPreviousPage(navigate, previousPath, linkToNetworks)
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
            'owePairNetworkId',
            'certificateTemplateId'
          ]
        )
      }else{
        saveContextRef.current = _.omit({ ...saveState, ...dataMore },
          [
            'enableOwe',
            'networkSecurity',
            'pskProtocol',
            'isOweMaster',
            'owePairNetworkId',
            'certificateTemplateId'
          ]
        )
      }
    }
  }

  const handleEditNetwork = async (formData: NetworkSaveData) => {
    try {
      processData(formData)
      const payload = updateClientIsolationAllowlist(saveContextRef.current as NetworkSaveData)
      await updateNetworkInstance({ params, payload }).unwrap()
      await activateCertificateTemplate(formData.certificateTemplateId, payload.id)
      if (payload.id && (payload.venues || data?.venues)) {
        await handleNetworkVenues(payload.id, payload.venues, data?.venues)
      }

      modalMode ? modalCallBack?.() : redirectPreviousPage(navigate, previousPath, linkToNetworks)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      {!modalMode && <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
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
          <MLOContext.Provider value={{
            isDisableMLO: MLOButtonDisable,
            disableMLO: setMLOButtonDisable
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
                {saveState.type === NetworkTypeEnum.HOTSPOT20 && <Hotspot20SettingsForm />}
                {saveState.type === NetworkTypeEnum.OPEN && <OpenSettingsForm/>}
                {(saveState.type || createType) === NetworkTypeEnum.DPSK &&
              <DpskSettingsForm />}
                {
                  (saveState.type || createType) === NetworkTypeEnum.CAPTIVEPORTAL &&
                  <PortalTypeForm/>
                }
                {saveState.type === NetworkTypeEnum.PSK &&
              <PskSettingsForm/>}

              </StepsFormLegacy.StepForm>
              { saveState.type === NetworkTypeEnum.CAPTIVEPORTAL &&
                <StepsFormLegacy.StepForm
                  name='onboarding'
                  title={
                    intl.$t(onboardingTitle, { type: saveState.guestPortal?.guestNetworkType })}
                  onFinish={handleOnboarding}
                >
                  {!!(saveState?.guestPortal?.guestNetworkType) &&
                      pickOneCaptivePortalForm(saveState)}
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
                <Venues defaultActiveVenues={defaultActiveVenues} />
              </StepsFormLegacy.StepForm>
              <StepsFormLegacy.StepForm
                name='summary'
                title={intl.$t({ defaultMessage: 'Summary' })}
              >
                <SummaryForm summaryData={saveState} portalData={portalDemo}/>
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
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
          <MLOContext.Provider value={{
            isDisableMLO: MLOButtonDisable,
            disableMLO: setMLOButtonDisable
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
                {saveState.type === NetworkTypeEnum.HOTSPOT20 && <Hotspot20SettingsForm />}
                {saveState.type === NetworkTypeEnum.OPEN && <OpenSettingsForm/>}
                {(saveState.type || createType) === NetworkTypeEnum.DPSK &&
              <DpskSettingsForm />}
                {(saveState.type || createType) === NetworkTypeEnum.CAPTIVEPORTAL &&
                <PortalTypeForm/>}
                {saveState.type === NetworkTypeEnum.PSK &&
              <PskSettingsForm />}

              </StepsForm.StepForm>
              { saveState.type === NetworkTypeEnum.CAPTIVEPORTAL &&
                <StepsForm.StepForm
                  name='onboarding'
                  title={
                    intl.$t(onboardingTitle, { type: saveState.guestPortal?.guestNetworkType })}
                  onFinish={handleOnboarding}
                >
                  {!!(saveState?.guestPortal?.guestNetworkType) &&
                      pickOneCaptivePortalForm(saveState)}
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
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      }
    </>
  )
}

function isPortalWebRender (saveState: NetworkSaveData): boolean {
  if (saveState.type !== NetworkTypeEnum.CAPTIVEPORTAL) {
    return false
  }
  const portalWebTypes = [
    GuestNetworkTypeEnum.ClickThrough,
    GuestNetworkTypeEnum.SelfSignIn,
    GuestNetworkTypeEnum.GuestPass,
    GuestNetworkTypeEnum.HostApproval
  ]

  // eslint-disable-next-line max-len
  const guestNetworkType = saveState.guestPortal?.guestNetworkType
  return !!(guestNetworkType && portalWebTypes.includes(guestNetworkType))
}

function pickOneCaptivePortalForm (saveState: NetworkSaveData) {
  const guestNetworkType = saveState?.guestPortal?.guestNetworkType
  switch (guestNetworkType) {
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

function useAddInstance () {
  const { isTemplate } = useConfigTemplate()
  const [ addNetwork ] = useAddNetworkMutation()
  const [ addNetworkTemplate ] = useAddNetworkTemplateMutation()

  return isTemplate ? addNetworkTemplate : addNetwork
}

function useUpdateInstance () {
  const { isTemplate } = useConfigTemplate()
  const [ updateNetwork ] = useUpdateNetworkMutation()
  const [ updateNetworkTemplate ] = useUpdateNetworkTemplateMutation()

  return isTemplate ? updateNetworkTemplate : updateNetwork
}

function useGetInstance (isEdit: boolean) {
  const { isTemplate } = useConfigTemplate()
  const params = useParams()
  const networkResult = useGetNetworkQuery({ params }, { skip: isTemplate })
  // eslint-disable-next-line max-len
  const networkTemplateResult = useGetNetworkTemplateQuery({ params }, { skip: !isEdit || !isTemplate })

  return isTemplate ? networkTemplateResult : networkResult
}

function useCertificateTemplateActivation () {
  const [activate] = useActivateCertificateTemplateMutation()
  const activateCertificateTemplate =
    async (certificateTemplateId?: string, networkId?: string) => {
      if (certificateTemplateId && networkId) {
        return await activate({ params: { networkId, certificateTemplateId } }).unwrap()
      }
      return null
    }

  return activateCertificateTemplate
}