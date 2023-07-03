import { useState, useRef, useEffect } from 'react'

import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useAddNetworkMutation,
  useGetNetworkQuery,
  useUpdateNetworkMutation,
  useAddNetworkVenuesMutation,
  useDeleteNetworkVenuesMutation,
  useUpdateNetworkVenueMutation
} from '@acx-ui/rc/services'
import {
  NetworkTypeEnum,
  NetworkSaveData,
  GuestNetworkTypeEnum,
  Demo,
  GuestPortal,
  redirectPreviousPage,
  LocationExtended,
  NetworkVenue,
  Network,
  AuthRadiusEnum
} from '@acx-ui/rc/utils'
import {
  useLocation,
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
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const [addNetwork] = useAddNetworkMutation()
  const [updateNetwork] = useUpdateNetworkMutation()
  const [addNetworkVenues] = useAddNetworkVenuesMutation()
  const [deleteNetworkVenues] = useDeleteNetworkVenuesMutation()
  const [updateNetworkVenue] = useUpdateNetworkVenueMutation()

  const formRef = useRef<StepsFormLegacyInstance<NetworkSaveData>>()

  const [saveState, updateSaveState] = useState<NetworkSaveData>({
    name: '',
    type: createType || NetworkTypeEnum.OPEN,
    isCloudpathEnabled: false,
    venues: []
  })
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
    if(data){
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
      if (cloneMode) {
        formRef?.current?.setFieldsValue({ name: data.name + ' - copy' })
      }
      updateSaveData({ ...data, isCloudpathEnabled: data.authRadius?true:false,
        enableAccountingService: (data.accountingRadius||
          data.guestPortal?.wisprPage?.accountingRadius)?true:false })
    }
  }, [data])

  useEffect(() => {
    setPreviousPath((location as LocationExtended)?.state?.from?.pathname)
  }, [])

  const handleGuestMoreSetting = (data:GuestMore)=>{
    if(data.guestPortal){
      if(data.guestPortal.userSessionTimeout&&data.userSessionTimeoutUnit)
        data.guestPortal={
          ...data.guestPortal,
          userSessionTimeout: data.guestPortal.userSessionTimeout*
          minutesMapping[data.userSessionTimeoutUnit]
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
    // eslint-disable-next-line
    let radiusUncheckedData = { ...data, ...saveState, ...tmpGuestPageState } as Partial<NetworkSaveData>
    if (radiusUncheckedData.guestPortal?.wisprPage?.authType &&
       radiusUncheckedData.guestPortal?.wisprPage?.authType === AuthRadiusEnum.ALWAYS_ACCEPT &&
       radiusUncheckedData.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr) {
      delete radiusUncheckedData.authRadius
      delete radiusUncheckedData.accountingRadius
      delete radiusUncheckedData.enableAccountingService
      delete radiusUncheckedData.accountingRadiusId
      delete radiusUncheckedData.authRadiusId
      delete radiusUncheckedData.guestPortal?.wisprPage?.authRadius
      // eslint-disable-next-line
       radiusUncheckedData = _.omit(radiusUncheckedData, ['guestPortal.wisprPage.authRadiusId']) as Partial<NetworkSaveData>
    }
    updateSaveData(radiusUncheckedData)
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
        if (_.isUndefined(networkVenue.id)) {
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
      const payload = updateClientIsolationAllowlist(_.omit(saveState, 'id')) // omit id to handle clone
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


  const deleteUnnecessaryFields = function () {
    if(saveState.enableAccountingService === false) {
      delete saveState.accountingRadius
    }
  }

  const handleEditNetwork = async (formData: NetworkSaveData) => {
    try {
      deleteUnnecessaryFields()
      if (saveState.guestPortal?.wisprPage?.authType &&
        saveState.guestPortal?.wisprPage?.authType === AuthRadiusEnum.ALWAYS_ACCEPT &&
        saveState.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr) {
        delete saveState.authRadius
        delete saveState.accountingRadius
        delete saveState.enableAccountingService
        delete saveState.accountingRadiusId
        delete saveState.guestPortal.wisprPage.authRadius
      }
      const payload = updateClientIsolationAllowlist({ ...saveState, venues: formData.venues })
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
        breadcrumb={isNavbarEnhanced ? [
          { text: intl.$t({ defaultMessage: 'Wi-Fi' }) },
          { text: intl.$t({ defaultMessage: 'Wi-Fi Networks' }) },
          { text: intl.$t({ defaultMessage: 'Network List' }), link: '/networks' }
        ] : [
          { text: intl.$t({ defaultMessage: 'Networks' }), link: '/networks' }
        ]}
      />}
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
            onFinish={async (data) => {
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
            }}
          >
            <NetworkDetailForm />
          </StepsFormLegacy.StepForm>

          <StepsFormLegacy.StepForm
            name='settings'
            title={intl.$t(settingTitle, { type: saveState.type })}
            onFinish={async (data) => {
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
                  const settingCaptiveData = {
                    ...{ type: saveState.type },
                    ...data
                  }
                  let settingCaptiveSaveData = tranferSettingsToSave(settingCaptiveData, editMode)
                  if (!editMode) {
                    settingCaptiveSaveData =
                      transferMoreSettingsToSave(data, settingCaptiveSaveData)
                  }
                  updateSaveData(settingCaptiveSaveData)
                }
              }
              return true
            }}
          >
            {saveState.type === NetworkTypeEnum.AAA && <AaaSettingsForm />}
            {saveState.type === NetworkTypeEnum.OPEN && <OpenSettingsForm/>}
            {(saveState.type || createType) === NetworkTypeEnum.DPSK && <DpskSettingsForm />}
            {(saveState.type || createType) === NetworkTypeEnum.CAPTIVEPORTAL && <PortalTypeForm/>}
            {saveState.type === NetworkTypeEnum.PSK && <PskSettingsForm />}

          </StepsFormLegacy.StepForm>
          { saveState.type === NetworkTypeEnum.CAPTIVEPORTAL &&
              <StepsFormLegacy.StepForm
                name='onboarding'
                title={intl.$t(onboardingTitle, { type: saveState.guestPortal?.guestNetworkType })}
                onFinish={async (data) => {
                  delete data.walledGardensString
                  if(saveState.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.Cloudpath){
                    delete data.guestPortal.wisprPage
                  }
                  const dataMore = handleGuestMoreSetting(data)
                  handlePortalWebPage(dataMore)
                  return true
                }}
              >
                {pickOneCaptivePortalForm(saveState)}
              </StepsFormLegacy.StepForm>
          }
          {editMode &&
            <StepsFormLegacy.StepForm
              name='moreSettings'
              title={intl.$t({ defaultMessage: 'More Settings' })}
              onFinish={async (data) => {
                const dataMore = handleGuestMoreSetting(data)
                const settingSaveData = transferMoreSettingsToSave(dataMore, saveState)

                updateSaveData(settingSaveData)
                return true
              }}>

              <NetworkMoreSettingsForm wlanData={saveState} />

            </StepsFormLegacy.StepForm>}
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
            onFinish={async (data) => {
              let venueData = data
              if (cloneMode) {
                venueData = {
                  venues: data.venues.map((v: { apGroups: { id?: string }[] }) => {
                    if (v.apGroups) {
                      v.apGroups.map((ag: { id?: string }) => {
                        delete ag.id
                        return ag
                      })
                    }
                    return v
                  })
                }
              }
              const settingSaveData = transferVenuesToSave(venueData, saveState)
              updateSaveData(settingSaveData)
              return true
            }}
          >
            <Venues />
          </StepsFormLegacy.StepForm>
          {!editMode &&
            <StepsFormLegacy.StepForm name='summary' title={intl.$t({ defaultMessage: 'Summary' })}>
              <SummaryForm summaryData={saveState} portalData={portalDemo}/>
            </StepsFormLegacy.StepForm>
          }
        </StepsFormLegacy>
      </NetworkFormContext.Provider>
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
