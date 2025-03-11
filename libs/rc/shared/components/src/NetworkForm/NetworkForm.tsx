/* eslint-disable @typescript-eslint/no-unused-vars, max-len */
import { useEffect, useRef, useState, createContext } from 'react'

import { Form }                                                                     from 'antd'
import { get, isEqual, isNil, isNull, isUndefined, merge, omit, omitBy, cloneDeep } from 'lodash'
import _                                                                            from 'lodash'
import { defineMessage, useIntl }                                                   from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsForm,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn }                             from '@acx-ui/feature-toggle'
import {
  useAddNetworkMutation,
  useAddNetworkVenuesMutation,
  useDeleteNetworkVenuesMutation,
  useUpdateNetworkMutation,
  useUpdateNetworkVenuesMutation,
  useAddNetworkTemplateMutation,
  useUpdateNetworkTemplateMutation,
  useAddNetworkVenueTemplatesMutation,
  useActivateWifiOperatorOnWifiNetworkMutation,
  useActivateIdentityProviderOnWifiNetworkMutation,
  useActivateCertificateTemplateMutation,
  useUpdateNetworkVenueTemplateMutation,
  useDeleteNetworkVenuesTemplateMutation,
  useDeactivateIdentityProviderOnWifiNetworkMutation,
  useActivateMacRegistrationPoolMutation,
  useActivateDpskServiceMutation,
  useActivateDpskServiceTemplateMutation,
  useGetDpskServiceQuery,
  useGetDpskServiceTemplateQuery,
  useGetCertificateTemplateNetworkBindingQuery,
  useAddNetworkVenueTemplateMutation,
  useDeleteNetworkVenueTemplateMutation,
  useActivatePortalMutation,
  useActivatePortalTemplateMutation,
  useGetEnhancedPortalProfileListQuery,
  useGetEnhancedPortalTemplateListQuery,
  useUpdateNetworkVenueMutation,
  useGetMacRegistrationPoolNetworkBindingQuery,
  useAddRbacNetworkVenueMutation,
  useDeleteRbacNetworkVenueMutation,
  useActivateDirectoryServerMutation,
  useBindingPersonaGroupWithNetworkMutation,
  useBindingSpecificIdentityPersonaGroupWithNetworkMutation
} from '@acx-ui/rc/services'
import {
  AuthRadiusEnum,
  Demo,
  GuestNetworkTypeEnum,
  GuestPortal,
  LocationExtended,
  Network,
  NetworkSaveData,
  SocialIdentities,
  NetworkTypeEnum,
  NetworkVenue,
  redirectPreviousPage,
  useConfigTemplateBreadcrumb,
  useConfigTemplate,
  useConfigTemplateMutationFnSwitcher,
  WlanSecurityEnum,
  useConfigTemplatePageHeaderTitle,
  useConfigTemplateQueryFnSwitcher,
  NetworkTunnelSdLanAction,
  NetworkTunnelSoftGreAction,
  VlanPool,
  NetworkTunnelIpsecAction
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useParams } from '@acx-ui/react-router-dom'

import { usePathBasedOnConfigTemplate } from '../configTemplates'
import { useGetNetwork }                from '../NetworkDetails/services'
import { useIsEdgeFeatureReady }        from '../useEdgeActions'

import { CloudpathForm }           from './CaptivePortal/CloudpathForm'
import { DirectoryServerForm }     from './CaptivePortal/DirectoryServerForm'
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
  handleServicePolicyRbacPayload,
  tranferSettingsToSave,
  transferDetailToSave,
  transferMoreSettingsToSave,
  transferVenuesToSave,
  updateClientIsolationAllowlist
} from './parser'
import PortalInstance         from './PortalInstance'
import {
  useNetworkVxLanTunnelProfileInfo,
  deriveRadiusFieldsFromServerData,
  useRadiusServer,
  useVlanPool,
  useClientIsolationActivations,
  useWifiCalling,
  useAccessControlActivation,
  getDefaultMloOptions,
  useUpdateEdgeSdLanActivations,
  useUpdateSoftGreActivations,
  deriveWISPrFieldsFromServerData,
  useUpdateIpsecActivations
} from './utils'
import { Venues } from './Venues/Venues'

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

interface UserConnection {
  lockoutPeriod?: number
  lockoutPeriodUnit?: string
  userSessionTimeout?: number
  userSessionTimeoutUnit?: string
  macCredentialsDuration?: number
  macCredentialsDurationUnit?: string
}
interface GuestMore {
  guestPortal?: GuestPortal,
  userConnection?: UserConnection
}

type Processor<NetworkSaveData> = (data: NetworkSaveData) => NetworkSaveData

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const process = (data: NetworkSaveData, ...processors: Processor<any>[]): NetworkSaveData =>
  processors.reduce((acc, fn) => fn(acc), data)

const mergeButDoNothing: Processor<NetworkSaveData> = (data:NetworkSaveData) => data

const mergeSocialIdentities = (newIdentities?: SocialIdentities): Processor<NetworkSaveData> => {
  if(newIdentities === undefined) return mergeButDoNothing
  return (mergedData) => {
    const cloneData = _.cloneDeep(mergedData)
    if (cloneData.guestPortal?.socialIdentities) {
      cloneData.guestPortal.socialIdentities = newIdentities
    }
    return cloneData
  }
}

const mergeSocialEmails = (newEmails?: string[]): Processor<NetworkSaveData> => {
  if(newEmails === undefined) return mergeButDoNothing
  return (mergedData) => {
    const cloneData = _.cloneDeep(mergedData)
    if (cloneData.guestPortal?.hostGuestConfig) {
      cloneData.guestPortal.hostGuestConfig.hostEmails = newEmails
    }
    return cloneData
  }
}


export function NetworkForm (props:{
  modalMode?: boolean,
  createType?: NetworkTypeEnum,
  modalCallBack?: (payload?: NetworkSaveData)=>void,
  defaultValues?: Record<string, unknown>,
  isRuckusAiMode?: boolean,
  gptEditId?: string
}) {
  const isRuckusAiMode = props.isRuckusAiMode === true
  const wifiRbacApiEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const configTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const serviceRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const isUseWifiRbacApi = isRuckusAiMode ? false : wifiRbacApiEnabled
  const isConfigTemplateRbacEnabled = isRuckusAiMode ? false : configTemplateRbacEnabled
  const { isTemplate, saveEnforcementConfig } = useConfigTemplate()
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isUseWifiRbacApi
  const enableServiceRbac = isRuckusAiMode ? false : serviceRbacEnabled
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const isIpsecEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
  const isSupportDVlanWithPskMacAuth = useIsSplitOn(Features.NETWORK_PSK_MACAUTH_DYNAMIC_VLAN_TOGGLE)
  const isSupportDpsk3NonProxyMode = useIsSplitOn(Features.WIFI_DPSK3_NON_PROXY_MODE_TOGGLE)


  const { modalMode, createType, modalCallBack, defaultValues } = props
  const intl = useIntl()
  const navigate = useNavigate()
  const location = useLocation()
  const initVlanPoolRef = useRef<VlanPool>()
  const wifi7Mlo3LinkFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_MLO_3LINK_TOGGLE)
  // eslint-disable-next-line max-len
  const isWifiIdentityManagementEnable = useIsSplitOn(Features.WIFI_IDENTITY_AND_IDENTITY_GROUP_MANAGEMENT_TOGGLE)
  const linkToNetworks = usePathBasedOnConfigTemplate('/networks', '/templates')
  const params = useParams()
  const gptEditId = props.gptEditId || ''
  const editMode = params.action === 'edit' || !_.isEmpty(gptEditId)
  const cloneMode = params.action === 'clone'
  const addNetworkInstance = useAddInstance()
  const updateNetworkInstance = useUpdateInstance()

  const [ addRbacNetworkVenue ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddRbacNetworkVenueMutation,
    useTemplateMutationFn: useAddNetworkVenueTemplateMutation
  })

  const [ deleteRbacNetworkVenue ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeleteRbacNetworkVenueMutation,
    useTemplateMutationFn: useDeleteNetworkVenueTemplateMutation
  })

  const [ updateNetworkVenue ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateNetworkVenueMutation,
    useTemplateMutationFn: useUpdateNetworkVenueTemplateMutation
  })

  // The RBAC APIs not support the addNetworkVenues, updateNetworkVenues and deleteNetworkVenues.
  const [addNetworkVenues] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddNetworkVenuesMutation,
    useTemplateMutationFn: useAddNetworkVenueTemplatesMutation
  })
  const [updateNetworkVenues] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateNetworkVenuesMutation,
    useTemplateMutationFn: useUpdateNetworkVenueTemplateMutation
  })
  const [deleteNetworkVenues] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeleteNetworkVenuesMutation,
    useTemplateMutationFn: useDeleteNetworkVenuesTemplateMutation
  })

  const activateCertificateTemplate = useCertificateTemplateActivation()
  const activateDpskPool = useDpskServiceActivation()
  const activatePortal = useRbacProfileServiceActivation()
  const activateMacRegistrationPool = useMacRegistrationPoolActivation()
  const [ activateDirectoryServer ] = useActivateDirectoryServerMutation()
  const addHotspot20NetworkActivations = useAddHotspot20Activation()
  const updateHotspot20NetworkActivations = useUpdateHotspot20Activation()
  const activateIdentityGroupOnNetwork = useIdentityGroupOnNetworkActivation()
  const { updateRadiusServer, radiusServerConfigurations } = useRadiusServer()
  const { updateVlanPoolActivation } = useVlanPool()
  const { updateAccessControl } = useAccessControlActivation()
  const updateEdgeSdLanActivations = useUpdateEdgeSdLanActivations()
  const updateSoftGreActivations = useUpdateSoftGreActivations()
  const updateIpsecActivations = useUpdateIpsecActivations()
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
  const directoryServerDataRef = useRef<{ id:string,name:string }>({ id: '',name: '' })
  const { wifiCallingIds, updateWifiCallingActivation } = useWifiCalling(saveState.name === '')
  const { updateClientIsolationActivations }
    = useClientIsolationActivations(!(editMode || cloneMode), saveState, updateSaveState, form)

  const updateSaveData = (saveData: Partial<NetworkSaveData>) => {
    updateSaveState((preState) => {
      const updateSate = { ...preState }
      if(!editMode&&!updateSate.enableAccountingService){
        delete updateSate.accountingRadius
      }

      // dpsk wpa3/wpa2 mixed mode doesn't support radius server option
      if (saveData.dpskWlanSecurity === WlanSecurityEnum.WPA23Mixed
          && !saveData.isCloudpathEnabled) {
        delete updateSate.authRadius
        delete updateSate.authRadiusId
        delete saveData?.authRadius
        delete saveData?.authRadiusId
      }

      if(editMode &&
        saveData.dpskWlanSecurity === WlanSecurityEnum.WPA23Mixed &&
        saveData.isCloudpathEnabled){
        updateSate.enableAuthProxy = false
        updateSate.enableAccountingProxy = false
        saveData.enableAuthProxy = false
        saveData.enableAccountingProxy = false
      }

      const mergedData = merge({}, updateSate, saveData)
      mergedData.wlan = { ...updateSate?.wlan, ...saveData.wlan }
      if(saveData.guestPortal?.walledGardens !== undefined && mergedData.guestPortal){
        mergedData.guestPortal.walledGardens = saveData.guestPortal?.walledGardens
      }
      const processedData = process(mergedData,
        mergeSocialIdentities(saveData.guestPortal?.socialIdentities),
        mergeSocialEmails(saveData.guestPortal?.hostGuestConfig?.hostEmails)
      )
      return { ...saveState, ...processedData }
    })
  }

  const { data, isLoading } = useGetNetwork({ isRuckusAiMode, gptEditId })
  const networkVxLanTunnelProfileInfo = useNetworkVxLanTunnelProfileInfo(data ?? null)
  const { certificateTemplateId } = useGetCertificateTemplateNetworkBindingQuery(
    { params: { networkId: data?.id } },
    {
      skip: !(editMode || cloneMode) || !data?.useCertificateTemplate,
      selectFromResult: ({ data }) => ({ certificateTemplateId: data?.id })
    })

  const { data: macRegistrationPool } = useGetMacRegistrationPoolNetworkBindingQuery(
    { params: { networkId: data?.id } },
    { skip: !saveState?.wlan?.macAddressAuthentication }
  )

  const { data: dpskService } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetDpskServiceQuery,
    useTemplateQueryFn: useGetDpskServiceTemplateQuery,
    // eslint-disable-next-line max-len
    skip: !enableServiceRbac || !((editMode || cloneMode) && saveState.type === NetworkTypeEnum.DPSK),
    extraParams: { networkId: data?.id }
  })

  const { data: portalService } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetEnhancedPortalProfileListQuery,
    useTemplateQueryFn: useGetEnhancedPortalTemplateListQuery,
    // eslint-disable-next-line max-len
    skip: !isUseWifiRbacApi || !((editMode || cloneMode) && saveState.type === NetworkTypeEnum.CAPTIVEPORTAL &&
    saveState.guestPortal?.guestNetworkType &&
    ![GuestNetworkTypeEnum.WISPr, GuestNetworkTypeEnum.Cloudpath]
      .includes(saveState.guestPortal?.guestNetworkType)),
    payload: {
      fields: ['id', 'name'],
      filters: {
        wifiNetworkIds: [data?.id]
      },
      pageSize: 1
    },
    enableRbac: isUseWifiRbacApi
  })

  // Config Template related states
  const breadcrumb = useConfigTemplateBreadcrumb([
    { text: intl.$t({ defaultMessage: 'Wi-Fi' }) },
    { text: intl.$t({ defaultMessage: 'Wi-Fi Networks' }) },
    { text: intl.$t({ defaultMessage: 'Network List' }), link: '/networks' }
  ])
  const pageTitle = useConfigTemplatePageHeaderTitle({
    isEdit: editMode,
    instanceLabel: intl.$t({ defaultMessage: 'Network' }),
    addLabel: intl.$t({ defaultMessage: 'Create New' })
  })

  useEffect(() => {
    if(saveState){
      saveContextRef.current = saveState
      if(saveState.guestPortal?.guestNetworkType !== GuestNetworkTypeEnum.WISPr && saveState.guestPortal?.wisprPage) {
        updateSaveState(_.omit(saveState, ['guestPortal', 'wisprPage']))
      }
    }
  }, [saveState])

  useEffect(() => {
    if (!data) return
    let resolvedData = isUseWifiRbacApi ? data : deriveRadiusFieldsFromServerData(data)
    resolvedData = deriveWISPrFieldsFromServerData(resolvedData)

    if (cloneMode) {
      formRef.current?.resetFields()
      formRef.current?.setFieldsValue({ ...resolvedData, name: data.name + ' - copy' })
    } else if (editMode) {
      form?.resetFields()
      form?.setFieldsValue(resolvedData)
    }

    const vlanPool = resolvedData.wlan?.advancedCustomization?.vlanPool
    if (vlanPool) {
      initVlanPoolRef.current = vlanPool
    }

    updateSaveData({
      ...resolvedData,
      certificateTemplateId,
      ...(dpskService && { dpskServiceProfileId: dpskService.id }),
      ...(portalService?.data?.[0]?.id && { portalServiceProfileId: portalService.data[0].id })
    })
  }, [data, certificateTemplateId, dpskService, portalService])
  //}, [data, certificateTemplateId, dpskService, portalService, vlanPoolId])

  useEffect(() => {
    if (!wifiCallingIds || wifiCallingIds.length === 0 || saveState?.wlan?.advancedCustomization?.wifiCallingEnabled) return

    const wifiCallingEnabled = saveState?.wlan?.advancedCustomization?.wifiCallingEnabled !== undefined
      ? saveState?.wlan?.advancedCustomization?.wifiCallingEnabled
      : true

    const fullNetworkSaveData = merge(
      {},
      saveState,
      {
        wlan: {
          advancedCustomization: {
            wifiCallingIds: wifiCallingIds,
            wifiCallingEnabled: wifiCallingEnabled
          }
        }
      }
    )

    form.setFieldValue(['wlan', 'advancedCustomization', 'wifiCallingIds'], wifiCallingIds)
    form.setFieldValue(['wlan', 'advancedCustomization', 'wifiCallingEnabled'], wifiCallingEnabled)
    updateSaveData(fullNetworkSaveData)
  }, [wifiCallingIds, saveState])

  useEffect(() => {
    if (!macRegistrationPool?.data?.length) return

    const targetMacRegistrationListId = macRegistrationPool.data[0].id
    const resolvedNetworkSaveData = {
      wlan: {
        macRegistrationListId: targetMacRegistrationListId
      }
    }

    form.setFieldValue('wlan.macRegistrationListId', targetMacRegistrationListId)

    updateSaveData(resolvedNetworkSaveData)
  }, [macRegistrationPool])

  useEffect(() => {
    if (!radiusServerConfigurations) return

    const resolvedNetworkSaveData = deriveRadiusFieldsFromServerData(radiusServerConfigurations)

    form.setFieldsValue({
      ...resolvedNetworkSaveData
    })

    updateSaveData(resolvedNetworkSaveData)
  }, [radiusServerConfigurations])

  useEffect(() => {
    setPreviousPath((location as LocationExtended)?.state?.from?.pathname)
  }, [])

  const handleDetails = async (data: NetworkSaveData) => {
    const detailsSaveData = transferDetailToSave(data)
    if(modalMode&&createType){
      detailsSaveData.type = createType
    }
    if (createType === NetworkTypeEnum.CAPTIVEPORTAL && !isRuckusAiMode) {
      updateSaveData({
        ...detailsSaveData,
        guestPortal: { guestNetworkType: GuestNetworkTypeEnum.GuestPass }
      })
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
        settingSaveData = transferMoreSettingsToSave(data, settingSaveData, networkVxLanTunnelProfileInfo,
          { isSupportDVlanWithPskMacAuth })
      }
      updateSaveData(settingSaveData)
    } else {
      if(!(editMode||cloneMode)){
        if(get(data, 'lockoutPeriodUnit')&&data?.guestPortal?.lockoutPeriod){
          data.guestPortal={
            ...data.guestPortal,
            lockoutPeriod: data.guestPortal.lockoutPeriod*
            minutesMapping[get(data, 'lockoutPeriodUnit')]
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
    } else {
      // Force set the VLAN ID to 3000 when the RUCKUS DHCP Service checkbox is enabled
      const isPortalDefaultVLANId = data?.enableDhcp
      if (isPortalDefaultVLANId) {
        data.wlan.vlanId = 3000
      }
    }
    let dataMore = handleGuestMoreSetting(data)

    if (!editMode) {
      // eslint-disable-next-line max-len
      dataMore = transferMoreSettingsToSave(dataMore, saveState, networkVxLanTunnelProfileInfo,
        { isSupportDVlanWithPskMacAuth })
    }
    handlePortalWebPage(dataMore)
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMoreSettings = async (data: any) => {
    const dataMore = handleGuestMoreSetting(data)
    // eslint-disable-next-line max-len
    const settingSaveData = transferMoreSettingsToSave(dataMore, saveState, networkVxLanTunnelProfileInfo,
      { isSupportDVlanWithPskMacAuth })
    updateSaveData(settingSaveData)
    return true
  }

  const handleGuestMoreSetting = (data: GuestMore): NetworkSaveData => {
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
    return handleUserConnection(data)
  }

  const handleUserConnection = (data: GuestMore): NetworkSaveData => {
    if(data.guestPortal && data.userConnection){
      const { userSessionTimeout, userSessionTimeoutUnit,
        lockoutPeriod, lockoutPeriodUnit,
        macCredentialsDuration, macCredentialsDurationUnit
      } = data.userConnection
      if(userSessionTimeout && userSessionTimeoutUnit){
        data.guestPortal={
          ...data.guestPortal,
          userSessionTimeout: userSessionTimeout* minutesMapping[userSessionTimeoutUnit]
        }
      }
      if(lockoutPeriod && lockoutPeriodUnit){
        data.guestPortal={
          ...data.guestPortal,
          lockoutPeriod: lockoutPeriod* minutesMapping[lockoutPeriodUnit]
        }
      }
      if(macCredentialsDurationUnit && macCredentialsDuration){
        data.guestPortal={
          ...data.guestPortal,
          // eslint-disable-next-line max-len
          macCredentialsDuration: macCredentialsDuration * minutesMapping[macCredentialsDurationUnit]
        }
      }
    }
    return data
  }

  const handleWlanAdvanced3MLO = (data: NetworkSaveData, wifi7Mlo3LinkFlag: boolean) => {
    if (data.wlan?.advancedCustomization &&
        !data.wlan?.advancedCustomization?.multiLinkOperationEnabled) {
      data.wlan.advancedCustomization = {
        ...data.wlan?.advancedCustomization,
        multiLinkOperationOptions: getDefaultMloOptions(wifi7Mlo3LinkFlag)
      }
    }
    return data
  }

  const handleWlanIdentityGroup = (data: NetworkSaveData, identityGroupFlag: boolean) => {
    if (
      (data.type === NetworkTypeEnum.PSK || data.type === NetworkTypeEnum.AAA || data.type === NetworkTypeEnum.HOTSPOT20)
      && identityGroupFlag
    ) {
      return omit(data, ['identityGroupId', 'identityId'])
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
      enableDhcp: isUndefined(data.enableDhcp)? saveState.enableDhcp : data.enableDhcp,
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
        if (isUndefined(networkVenue.id) || isNull(networkVenue.id)) {
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
        if (!isUndefined(networkVenueId)) {
          if (!newIds.includes(networkVenueId)) {
            removed.push(networkVenueId)
          } else if (newNetworkVenues?.length) {
            const newNetworkVenue = newNetworkVenues.find(venue => venue.id === networkVenueId)
            if (newNetworkVenue) {
              // remove the undeifned or null field
              const oldNVenue = omitBy(networkVenue, isNil)
              const newNVenue = omitBy(newNetworkVenue, isNil)

              if (!isEqual(oldNVenue, newNVenue)) {
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
      case GuestNetworkTypeEnum.Directory:
        return <DirectoryServerForm directoryServerDataRef={directoryServerDataRef} />
      default:
      // eslint-disable-next-line no-console
        console.error(`Unknown Network Type: ${saveState?.guestPortal?.guestNetworkType}`)
        return <OnboardingForm />
    }
  }

  const handleRbacNetworkVenues = async (
    networkId : string,
    newNetworkVenues? : NetworkVenue[],
    oldNetworkVenues? : NetworkVenue[]
  )=> {

    const added: NetworkVenue[] = []
    const removed: string[] = []
    const update: NetworkVenue[] = []
    const newVenueIds: string[] = []
    const oldVenueIds = oldNetworkVenues?.map(oldNv => oldNv.venueId) ?? []

    //console.log('newNetworkVenues: ', newNetworkVenues)
    //console.log('oldNetworkVenues: ', oldNetworkVenues)

    if (newNetworkVenues?.length) {
      newNetworkVenues?.forEach(networkVenue => {
        if (!networkVenue.networkId || networkVenue.networkId !== networkId) {
          networkVenue.networkId = networkId
        }

        const { networkId: curNetworkId, venueId } = networkVenue
        if (!oldVenueIds.includes(venueId)) { // new networkVenue
          added.push(networkVenue)
          update.push(networkVenue)
        } else { // networkVenue has existed
          newVenueIds.push(networkVenue.venueId!)
        }
      })
    }

    if (oldNetworkVenues?.length) {
      oldNetworkVenues?.forEach(networkVenue => {
        const { venueId, networkId } = networkVenue
        if (networkId && venueId) {
          if (!newVenueIds.includes(venueId)) {
            removed.push(venueId)
          } else if (newNetworkVenues?.length) {
            const newNetworkVenue = newNetworkVenues.find(venue => venue.venueId === venueId)
            if (newNetworkVenue) {
              // remove the undeifned or null field
              const oldNVenue = omitBy(networkVenue, isNil)
              const newNVenue = omitBy(newNetworkVenue, isNil)

              if (!isEqual(oldNVenue, newNVenue)) {
                update.push(newNetworkVenue) // config changed need to update
              }
            }
          }
        }
      })
    }

    //console.log('added: ', added)
    //console.log('removed: ', removed)
    //console.log('update: ', update)

    if (added.length) {
      const addNetworkVenueReqs = added.map((networkVenue) => {
        const params = {
          venueId: networkVenue.venueId,
          networkId: networkId
        }
        return addRbacNetworkVenue({ params, payload: networkVenue, enableRbac: true })
      })

      await Promise.allSettled(addNetworkVenueReqs)
    }

    if (removed.length) {
      const deleteNetworkVenueReqs = removed.map((networkVenueId) => {
        const curParams = {
          venueId: networkVenueId,
          networkId: networkId
        }
        return deleteRbacNetworkVenue({ params: curParams, enableRbac: true })
      })

      await Promise.allSettled(deleteNetworkVenueReqs)
    }

    if (update.length) {
      const updateNetworkVenueReqs = update.map((networkVenue) => {
        const venueId = networkVenue.venueId
        // eslint-disable-next-line max-len
        const oldNetworkVenue = oldNetworkVenues?.find((oldNetworkVenue) => oldNetworkVenue.venueId === venueId)!

        const params = {
          venueId: networkVenue.venueId,
          networkId: networkId
        }
        return updateNetworkVenue({ params, payload: {
          oldPayload: oldNetworkVenue,
          newPayload: networkVenue
        }, enableRbac: true })
      })

      await Promise.allSettled(updateNetworkVenueReqs)
    }
  }

  const processAddData = function (data: NetworkSaveData) {
    const processWlanAdvanced3MLO = (data: NetworkSaveData) => handleWlanAdvanced3MLO(data, wifi7Mlo3LinkFlag)
    const processGuestMoreSetting = (data: NetworkSaveData) => handleGuestMoreSetting(data)
    const processCloneMode = (data: NetworkSaveData) => omit(data,
      ['id',
        'networkSecurity',
        'enableOwe',
        'pskProtocol',
        'isOweMaster',
        'owePairNetworkId',
        'certificateTemplateId',
        'hotspot20Settings.wifiOperator',
        'hotspot20Settings.originalOperator',
        'hotspot20Settings.identityProviders',
        'hotspot20Settings.originalProviders',
        'userConnection'
      ])
    // eslint-disable-next-line max-len
    const processClientIsolationAllowlist = (data: NetworkSaveData) => updateClientIsolationAllowlist(data)
    const processBindingIdentityGroup = (data: NetworkSaveData) => handleWlanIdentityGroup(data, isWifiIdentityManagementEnable)
    const processFns = [
      processWlanAdvanced3MLO,
      processGuestMoreSetting,
      processCloneMode,
      processClientIsolationAllowlist,
      processBindingIdentityGroup
    ]
    return processFns.reduce((tempData, processFn) => processFn(tempData), data)
  }
  const handleAddNetwork = async (formData: NetworkSaveData) => {
    try {
      const payload = processAddData(saveState)
      if (isRuckusAiMode) {
        modalCallBack?.(payload)
        return
      }

      // eslint-disable-next-line max-len
      const networkResponse = await addNetworkInstance({
        params,
        payload: resolvedRbacEnabled ? handleServicePolicyRbacPayload(payload) : payload,
        enableRbac: resolvedRbacEnabled
      }).unwrap()
      const networkId = networkResponse?.response?.id

      const beforeVenueActivationRequest = []
      const afterVenueActivationRequest = []

      if (isUseWifiRbacApi) {
        beforeVenueActivationRequest.push(activatePortal(networkId, formData.portalServiceProfileId))
      }
      beforeVenueActivationRequest.push(addHotspot20NetworkActivations(saveState, networkId))
      beforeVenueActivationRequest.push(updateVlanPoolActivation(networkId, saveState.wlan?.advancedCustomization?.vlanPool))
      if (formData.type !== NetworkTypeEnum.HOTSPOT20) {
        beforeVenueActivationRequest.push(updateRadiusServer(saveState, networkId))
      }
      beforeVenueActivationRequest.push(updateWifiCallingActivation(networkId, saveState))
      beforeVenueActivationRequest.push(updateAccessControl(saveState, data, networkId))
      // eslint-disable-next-line max-len
      beforeVenueActivationRequest.push(activateCertificateTemplate(saveState.certificateTemplateId, networkId))
      if (enableServiceRbac) {
        beforeVenueActivationRequest.push(activateDpskPool(saveState.dpskServiceProfileId, networkId))
        beforeVenueActivationRequest.push(activateMacRegistrationPool(saveState.wlan?.macRegistrationListId, networkId))
      }

      if(directoryServerDataRef.current.id) {
        beforeVenueActivationRequest.push(
          activateDirectoryServer({ params: { networkId: networkId, policyId: directoryServerDataRef.current.id } })
        )
      }

      if (!isTemplate && isWifiIdentityManagementEnable) {
        beforeVenueActivationRequest.push(activateIdentityGroupOnNetwork(formData, networkId))
      }

      await Promise.all(beforeVenueActivationRequest)
      if (networkResponse?.response && payload.venues) {
        // @ts-ignore
        const network: Network = networkResponse.response
        if (resolvedRbacEnabled) {
          await handleRbacNetworkVenues(network.id, payload.venues)
        } else {
          await handleNetworkVenues(network.id, payload.venues)
        }
      }
      afterVenueActivationRequest.push(updateClientIsolationActivations(payload, null, networkId))

      // Tunnel Activation/Deactivation
      if (!isTemplate && networkId && payload.venues) {
        // eslint-disable-next-line max-len
        if (isEdgeSdLanMvEnabled && formData['sdLanAssociationUpdate']) {
        // eslint-disable-next-line max-len
          afterVenueActivationRequest.push(updateEdgeSdLanActivations(networkId, formData['sdLanAssociationUpdate'] as NetworkTunnelSdLanAction[], payload.venues))
        }

        if (isSoftGreEnabled && formData['softGreAssociationUpdate']) {
        // eslint-disable-next-line max-len
          afterVenueActivationRequest.push(updateSoftGreActivations(networkId, formData['softGreAssociationUpdate'] as NetworkTunnelSoftGreAction, payload.venues, cloneMode, false))

          if (isIpsecEnabled && formData['ipsecAssociationUpdate']) {
            // eslint-disable-next-line max-len
            afterVenueActivationRequest.push(updateIpsecActivations(networkId, formData['ipsecAssociationUpdate'] as NetworkTunnelIpsecAction, payload.venues, cloneMode, false))
          }
        }
      }

      if (networkId) {
        afterVenueActivationRequest.push(saveEnforcementConfig(networkId))
      }

      await Promise.all(afterVenueActivationRequest)

      modalMode ? modalCallBack?.() : redirectPreviousPage(navigate, previousPath, linkToNetworks)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const processEditData = function (data: NetworkSaveData) {
    handleSettings(data)

    if(data?.type === NetworkTypeEnum.CAPTIVEPORTAL){
      handleOnboarding(data)
    }

    const dataWlan = handleWlanAdvanced3MLO(data, wifi7Mlo3LinkFlag)
    const dataRemoveIdentity = handleWlanIdentityGroup(dataWlan, isWifiIdentityManagementEnable)
    const dataMore = handleGuestMoreSetting(dataRemoveIdentity)

    if(isPortalWebRender(dataMore)){
      handlePortalWebPage(dataMore)
    }

    if (dataMore.guestPortal?.wisprPage?.authType &&
      dataMore.guestPortal?.wisprPage?.authType === AuthRadiusEnum.ALWAYS_ACCEPT &&
      dataMore.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr) {
      saveContextRef.current = omit({ ...saveState, ...dataMore },
        ['authRadius',
          'accountingRadius',
          'enableAccountingService',
          'accountingRadiusId',
          'authRadiusId',
          'guestPortal.wisprPage.authRadius',
          'guestPortal.wisprPage.authRadiusId',
          'userConnection'
        ]
      )
    } else {
      if(!saveState.enableAccountingService){
        saveContextRef.current = omit({ ...saveState, ...dataMore },
          [
            'accountingRadius',
            'enableAccountingService',
            'accountingRadiusId',
            'enableOwe',
            'networkSecurity',
            'pskProtocol',
            'isOweMaster',
            'owePairNetworkId',
            'certificateTemplateId',
            'hotspot20Settings.wifiOperator',
            'hotspot20Settings.originalOperator',
            'hotspot20Settings.identityProviders',
            'hotspot20Settings.originalProviders',
            'userConnection',
            ...(isUseWifiRbacApi) ? ['portalServiceProfileId'] : []
          ]
        )
      }else{
        saveContextRef.current = omit({ ...saveState, ...dataMore },
          [
            'enableOwe',
            'networkSecurity',
            'pskProtocol',
            'isOweMaster',
            'owePairNetworkId',
            'certificateTemplateId',
            'userConnection',
            ...(enableServiceRbac) ? ['dpskServiceProfileId', 'macRegistrationPoolId'] : [],
            ...(isUseWifiRbacApi) ? ['portalServiceProfileId'] : []
          ]
        )
      }
    }
    if (editMode && data.wlan?.wlanSecurity) {
      const toRemoveFromWlan: string[] = []
      if (data.wlan.wlanSecurity === WlanSecurityEnum.OWE) {
        toRemoveFromWlan.push('passphrase', 'saePassphrase')
      } else if (data.wlan.wlanSecurity === WlanSecurityEnum.None) {
        toRemoveFromWlan.push('managementFrameProtection', 'passphrase', 'saePassphrase')
      } else {
        toRemoveFromWlan.push('managementFrameProtection')
        if (data.wlan.wlanSecurity === WlanSecurityEnum.WPA3) {
          toRemoveFromWlan.push('passphrase')
        } else if (data.wlan.wlanSecurity !== WlanSecurityEnum.WPA23Mixed) {
          toRemoveFromWlan.push('saePassphrase')
        }
      }
      saveContextRef.current.wlan = omit(saveContextRef.current.wlan,
        toRemoveFromWlan
      )
      if ( saveState.wlan?.wlanSecurity === WlanSecurityEnum.OWETransition
        && saveState.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr) {
        saveContextRef.current = { ...saveContextRef.current,
          ...{
            wlan: {
              ...saveContextRef.current?.wlan,
              ...{ wlanSecurity: WlanSecurityEnum.OWETransition }
            }
          } }
      }
    }
  }

  const handleEditNetwork = async (formData: NetworkSaveData) => {
    try {
      processEditData(formData)
      const oldData = cloneDeep(saveContextRef.current)
      const payload = updateClientIsolationAllowlist(saveContextRef.current as NetworkSaveData)
      if (isRuckusAiMode) {
        modalCallBack?.(payload)
        return
      }

      // Due to proxy mode validation, the Radius proxy mode update must execute before the network update
      if(formData.wlanSecurity === WlanSecurityEnum.WPA23Mixed && formData.isCloudpathEnabled) {
        await updateRadiusServer(formData, payload.id)
      }

      await updateNetworkInstance({
        params,
        payload: resolvedRbacEnabled ? handleServicePolicyRbacPayload(payload) : payload,
        enableRbac: resolvedRbacEnabled
      }).unwrap()

      const beforeVenueActivationRequest = []
      const afterVenueActivationRequest = []

      beforeVenueActivationRequest.push(activateCertificateTemplate(formData.certificateTemplateId, payload.id))
      if (isUseWifiRbacApi) {
        beforeVenueActivationRequest.push(activatePortal(payload.id, formData.portalServiceProfileId))
      }
      if (enableServiceRbac) {
        beforeVenueActivationRequest.push(activateDpskPool(formData.dpskServiceProfileId, payload.id))
        // eslint-disable-next-line max-len
        beforeVenueActivationRequest.push(activateMacRegistrationPool(formData.wlan?.macRegistrationListId, payload.id))
      }
      beforeVenueActivationRequest.push(updateHotspot20NetworkActivations(formData))

      if (!isTemplate && isWifiIdentityManagementEnable) {
        beforeVenueActivationRequest.push(activateIdentityGroupOnNetwork(formData, payload.id))
      }

      if (formData.type !== NetworkTypeEnum.HOTSPOT20 &&
        !(formData.wlanSecurity === WlanSecurityEnum.WPA23Mixed && formData.isCloudpathEnabled)
      ) {
        // HS 20 Network:
        // The Radius service is binding on the Identity provider profile
        // So it doesn't need to do the network and radius service binding
        beforeVenueActivationRequest.push(updateRadiusServer(formData, payload.id))
      }
      beforeVenueActivationRequest.push(updateWifiCallingActivation(payload.id, formData))
      // eslint-disable-next-line max-len
      beforeVenueActivationRequest.push(updateVlanPoolActivation(payload.id, formData.wlan?.advancedCustomization?.vlanPool, initVlanPoolRef.current?.id))
      beforeVenueActivationRequest.push(updateAccessControl(formData, data, payload.id))
      if(directoryServerDataRef.current.id) {
        beforeVenueActivationRequest.push(activateDirectoryServer(
          { params: { networkId: payload.id, policyId: directoryServerDataRef.current.id } }
        ))
      }
      await Promise.all(beforeVenueActivationRequest)

      if (payload.id && (payload.venues || data?.venues)) {
        if (resolvedRbacEnabled) {
          await handleRbacNetworkVenues(payload.id, payload.venues, data?.venues)
        } else {
          await handleNetworkVenues(payload.id, payload.venues, data?.venues)
        }
      }
      afterVenueActivationRequest.push(updateClientIsolationActivations(payload, oldData, payload.id))

      // eslint-disable-next-line max-len
      if (isEdgeSdLanMvEnabled && form.getFieldValue('sdLanAssociationUpdate') && payload.id && payload.venues) {
        afterVenueActivationRequest.push(
          // eslint-disable-next-line max-len
          updateEdgeSdLanActivations(payload.id, form.getFieldValue('sdLanAssociationUpdate') as NetworkTunnelSdLanAction[], payload.venues)
        )
      }

      // eslint-disable-next-line max-len
      if (isSoftGreEnabled && formData['softGreAssociationUpdate'] && payload.id && payload.venues) {
        afterVenueActivationRequest.push(
          // eslint-disable-next-line max-len
          updateSoftGreActivations(payload.id, formData['softGreAssociationUpdate'] as NetworkTunnelSoftGreAction, payload.venues, cloneMode, true)
        )

        if (isIpsecEnabled && formData['ipsecAssociationUpdate'] && payload.id && payload.venues) {
          afterVenueActivationRequest.push(
            // eslint-disable-next-line max-len
            updateIpsecActivations(payload.id, formData['ipsecAssociationUpdate'] as NetworkTunnelIpsecAction, payload.venues, cloneMode, true)
          )
        }
      }

      if (payload.id) {
        afterVenueActivationRequest.push(saveEnforcementConfig(payload.id))
      }

      await Promise.all(afterVenueActivationRequest)
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
      <Loader states={[{ isLoading: isLoading }]}>
        <NetworkFormContext.Provider value={{
          modalMode,
          createType,
          editMode,
          cloneMode,
          isRuckusAiMode,
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
              {!isRuckusAiMode &&
                <StepsFormLegacy.StepForm
                  name='details'
                  title={intl.$t({ defaultMessage: 'Network Details' })}
                  onFinish={handleDetails}
                >
                  <NetworkDetailForm />
                </StepsFormLegacy.StepForm>
              }

              <StepsFormLegacy.StepForm
                name='settings'
                title={intl.$t(settingTitle, { type: saveState.type })}
                onFinish={handleSettings}
              >
                {saveState.type === NetworkTypeEnum.AAA && <AaaSettingsForm />}
                {saveState.type === NetworkTypeEnum.HOTSPOT20 && <Hotspot20SettingsForm />}
                {saveState.type === NetworkTypeEnum.OPEN && <OpenSettingsForm/>}
                {(saveState.type || createType) === NetworkTypeEnum.DPSK &&
              <DpskSettingsForm defaultSelectedDpsk={defaultValues?.dpskServiceProfileId as string} />}
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
              {!isRuckusAiMode &&
                <StepsFormLegacy.StepForm
                  name='venues'
                  title={intl.$t({ defaultMessage: '<VenuePlural></VenuePlural>' })}
                  onFinish={handleVenues}
                >
                  <Venues defaultActiveVenues={defaultValues?.defaultActiveVenues as string[]} />
                </StepsFormLegacy.StepForm>}

              <StepsFormLegacy.StepForm
                name='summary'
                title={intl.$t({ defaultMessage: 'Summary' })}
              >
                <SummaryForm
                  summaryData={saveState}
                  portalData={portalDemo}
                  extraData={{ directoryServer: directoryServerDataRef.current }}
                />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Loader>
      }
      {editMode &&
      <Loader states={[{ isLoading: isLoading }]}>
        <NetworkFormContext.Provider value={{
          modalMode,
          createType,
          editMode,
          cloneMode,
          isRuckusAiMode,
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
              {
                !isRuckusAiMode && <StepsForm.StepForm
                  name='details'
                  title={intl.$t({ defaultMessage: 'Network Details' })}
                  onFinish={handleDetails}
                >
                  <NetworkDetailForm />
                </StepsForm.StepForm>

              }

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
              { editMode && !isRuckusAiMode &&
                <StepsForm.StepForm
                  name='moreSettings'
                  title={intl.$t({ defaultMessage: 'More Settings' })}
                  onFinish={handleMoreSettings}>

                  <NetworkMoreSettingsForm wlanData={saveState} />

                </StepsForm.StepForm>
              }
              { isPortalWebRender(saveState) &&<StepsForm.StepForm
                name='portalweb'
                title={intl.$t({ defaultMessage: 'Portal Web Page' })}
                onFinish={handlePortalWebPage}
              >
                <PortalInstance updatePortalData={(data)=>setPortalDemo(data)}/>
              </StepsForm.StepForm>
              }
              {!isRuckusAiMode &&
                  <StepsForm.StepForm
                    name='venues'
                    title={intl.$t({ defaultMessage: '<VenuePlural></VenuePlural>' })}
                    onFinish={handleVenues}
                  >
                    <Venues />
                  </StepsForm.StepForm>
              }

            </StepsForm>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Loader>
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
    GuestNetworkTypeEnum.HostApproval,
    GuestNetworkTypeEnum.Directory
  ]

  // eslint-disable-next-line max-len
  const guestNetworkType = saveState.guestPortal?.guestNetworkType
  return !!(guestNetworkType && portalWebTypes.includes(guestNetworkType))
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

function useMacRegistrationPoolActivation () {
  const [activate] = useActivateMacRegistrationPoolMutation()
  return async (macRegistrationPoolId?: string, networkId?: string) => {
    if (macRegistrationPoolId && networkId) {
      return await activate({ params: { networkId, macRegistrationPoolId } }).unwrap()
    }
    return null
  }
}

function useDpskServiceActivation () {
  const [activate] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useActivateDpskServiceMutation,
    useTemplateMutationFn: useActivateDpskServiceTemplateMutation
  })
  return async (dpskServiceId?: string, networkId?: string) => {
    if (dpskServiceId && networkId) {
      return await activate({ params: { networkId, dpskServiceId } }).unwrap()
    }
    return null
  }
}

function useRbacProfileServiceActivation () {
  const [activate] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useActivatePortalMutation,
    useTemplateMutationFn: useActivatePortalTemplateMutation
  })
  return async (networkId?: string, serviceId?: string) => {
    if (networkId && serviceId) {
      return await activate({ params: { networkId, serviceId } }).unwrap()
    }
    return null
  }
}

function useIdentityGroupOnNetworkActivation () {
  const [ bindingPersonaGroupWithNetwork ] = useBindingPersonaGroupWithNetworkMutation()
  const [ bindingSpecificIdentityPersonaGroupWithNetwork ] = useBindingSpecificIdentityPersonaGroupWithNetworkMutation()
  return async (network?: NetworkSaveData, networkId?: string) => {
    if(
      network &&
      networkId &&
      (network.type === NetworkTypeEnum.HOTSPOT20 || network.type === NetworkTypeEnum.PSK || network.type === NetworkTypeEnum.AAA)
    ) {
      const identityGroupId = network?.identityGroupId
      const identityId = network?.identityId
      if (identityGroupId) {
        if (identityId) {
          return await bindingSpecificIdentityPersonaGroupWithNetwork({
            params: { networkId: networkId, identityGroupId: identityGroupId, identityId: identityId }
          }).unwrap()
        }
        else {
          return await bindingPersonaGroupWithNetwork({
            params: { networkId: networkId, identityGroupId: identityGroupId }
          }).unwrap()
        }
      }
    }
    return null
  }
}

function useWifiOperatorActivation () {
  const [activate] = useActivateWifiOperatorOnWifiNetworkMutation()
  const activateWifiOperator =
    async (wifiNetworkId?: string, operatorId?: string) => {
      return wifiNetworkId && operatorId ?
        await activate({ params: { wifiNetworkId, operatorId } }).unwrap() : null
    }

  return activateWifiOperator
}

function useIdentityProviderActivation () {
  const [activate] = useActivateIdentityProviderOnWifiNetworkMutation()
  const activateIdentityProvider =
    async (wifiNetworkId?: string, providerId?: string) => {
      return wifiNetworkId && providerId ?
        await activate({ params: { wifiNetworkId, providerId } }).unwrap() : null
    }

  return activateIdentityProvider
}

function useIdentityProviderDeactivation () {
  const [deactivate] = useDeactivateIdentityProviderOnWifiNetworkMutation()
  const deactivateIdentityProvider =
    async (wifiNetworkId?: string, providerId?: string) => {
      return wifiNetworkId && providerId ?
        await deactivate({ params: { wifiNetworkId, providerId } }).unwrap() : null
    }

  return deactivateIdentityProvider
}

function useAddHotspot20Activation () {
  const activateHotspot20NetworkOperator = useWifiOperatorActivation()
  const activateHotspot20NetworkProvider = useIdentityProviderActivation()
  const addHotspot20Activations =
    async (network?: NetworkSaveData, networkId?: string) => {
      if (network?.type === NetworkTypeEnum.HOTSPOT20 && networkId &&
        network?.hotspot20Settings) {
        const hotspot20 = network?.hotspot20Settings
        await activateHotspot20NetworkOperator(networkId, hotspot20.wifiOperator)
        if (hotspot20.identityProviders) {
          await Promise.allSettled(hotspot20.identityProviders.map(id =>
            activateHotspot20NetworkProvider(networkId, id)))
        }
      }
      return
    }

  return addHotspot20Activations
}

function useUpdateHotspot20Activation () {
  const activateOperator = useWifiOperatorActivation()
  const activateProvider = useIdentityProviderActivation()
  const deactivateProvider = useIdentityProviderDeactivation()
  const updateHotspot20Activations =
    async (network?: NetworkSaveData) => {
      if (network && network.type === NetworkTypeEnum.HOTSPOT20) {
        const networkId = network.id
        const hotspot20Setting = network.hotspot20Settings
        const hotspot20OriginalOperator = hotspot20Setting?.originalOperator
        const hotspot20OriginalProviders = hotspot20Setting?.originalProviders
        const newProviderIds = hotspot20Setting?.identityProviders

        if (hotspot20OriginalOperator &&
          hotspot20OriginalOperator !== hotspot20Setting.wifiOperator) {
          await activateOperator(networkId, hotspot20Setting.wifiOperator)
        }

        if (hotspot20OriginalProviders && newProviderIds &&
          !isEqual(hotspot20OriginalProviders, newProviderIds)) {

          const deactivateProviderIds = hotspot20OriginalProviders.filter(providerId =>
            !(hotspot20Setting.identityProviders!.includes(providerId))
          )

          const activateProviderIds = newProviderIds.filter(providerId =>
            !hotspot20OriginalProviders.includes(providerId)
          )

          const deactivateLength = deactivateProviderIds.length
          const activateLength = activateProviderIds.length

          // if remove all original providers
          if (deactivateLength === hotspot20OriginalProviders.length &&
            deactivateLength === 1 && activateLength > 0) {
            // can only activate before deativate to avoid remove reuiqred field
            // max number of providers activated with a network is 6
            await activateProvider(networkId, activateProviderIds[activateLength - 1])
            activateProviderIds.pop()
            await deactivateProvider(networkId, deactivateProviderIds[0])
            deactivateProviderIds.pop()
          } else {
            // deactivate first to have space to activate
            if (deactivateLength > 0) {
              await deactivateProvider(network.id, deactivateProviderIds[deactivateLength - 1])
              deactivateProviderIds.pop()
            }

            if (activateLength > 0) {
              await activateProvider(network.id, activateProviderIds[activateLength - 1])
              activateProviderIds.pop()
            }
          }

          await Promise.allSettled(deactivateProviderIds.map(id =>
            deactivateProvider(networkId, id)))

          await Promise.allSettled(activateProviderIds.map(id => activateProvider(networkId, id)))
        }
      }
      return
    }

  return updateHotspot20Activations
}

