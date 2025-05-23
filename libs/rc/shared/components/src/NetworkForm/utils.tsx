/* eslint-disable @typescript-eslint/no-explicit-any, max-len */
import { useEffect, useMemo, useState } from 'react'

import { FormInstance } from 'antd'
import _                from 'lodash'
import { Params }       from 'react-router-dom'

import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import {
  ActionItem,
  ComparisonObjectType,
  UpdateActionItem,
  WifiActionMapType,
  comparePayload,
  useActivateAccessControlProfileOnWifiNetworkMutation,
  useActivateAccessControlProfileTemplateOnWifiNetworkMutation,
  useActivateApplicationPolicyOnWifiNetworkMutation,
  useActivateApplicationPolicyTemplateOnWifiNetworkMutation,
  useActivateDeviceOnWifiNetworkMutation,
  useActivateDeviceTemplateOnWifiNetworkMutation,
  useActivateIpsecMutation,
  useActivateL2AclOnWifiNetworkMutation,
  useActivateL2AclTemplateOnWifiNetworkMutation,
  useActivateL3AclOnWifiNetworkMutation,
  useActivateL3AclTemplateOnWifiNetworkMutation,
  useActivateRadiusServerMutation,
  useActivateRadiusServerTemplateMutation,
  useActivateSoftGreMutation,
  useActivateVlanPoolMutation,
  useActivateVlanPoolTemplateOnWifiNetworkMutation,
  useActivateWifiCallingServiceMutation,
  useActivateWifiCallingServiceTemplateMutation,
  useBindClientIsolationMutation,
  useDeactivateAccessControlProfileOnWifiNetworkMutation,
  useDeactivateAccessControlProfileTemplateOnWifiNetworkMutation,
  useDeactivateApplicationPolicyOnWifiNetworkMutation,
  useDeactivateApplicationPolicyTemplateOnWifiNetworkMutation,
  useDeactivateDeviceOnWifiNetworkMutation,
  useDeactivateDeviceTemplateOnWifiNetworkMutation,
  useDeactivateIpsecMutation,
  useDeactivateL2AclOnWifiNetworkMutation,
  useDeactivateL2AclTemplateOnWifiNetworkMutation,
  useDeactivateL3AclOnWifiNetworkMutation,
  useDeactivateL3AclTemplateOnWifiNetworkMutation,
  useDeactivateRadiusServerMutation,
  useDeactivateRadiusServerTemplateMutation,
  useDeactivateVlanPoolMutation,
  useDeactivateVlanPoolTemplateOnWifiNetworkMutation,
  useDeactivateWifiCallingServiceMutation,
  useDeactivateWifiCallingServiceTemplateMutation,
  useDectivateSoftGreMutation,
  useGetAAAPolicyTemplateListQuery,
  useGetAAAPolicyViewModelListQuery,
  useGetEnhancedClientIsolationListQuery,
  useGetEnhancedWifiCallingServiceListQuery,
  useGetEnhancedWifiCallingServiceTemplateListQuery,
  useGetRadiusServerSettingsQuery,
  useGetRadiusServerTemplateSettingsQuery,
  useGetTunnelProfileViewDataListQuery,
  useUnbindClientIsolationMutation,
  useUpdateRadiusServerSettingsMutation,
  useUpdateRadiusServerTemplateSettingsMutation,
  useActivateCertificateTemplateMutation,
  useDeactivateCertificateTemplateMutation
} from '@acx-ui/rc/services'
import {
  AuthRadiusEnum,
  CommonResult,
  ConfigTemplateType,
  ConfigTemplateUrlsInfo,
  DpskWlanAdvancedCustomization,
  GuestNetworkTypeEnum,
  NetworkRadiusSettings,
  NetworkSaveData,
  NetworkSegmentTypeEnum,
  NetworkTunnelIpsecAction,
  NetworkTunnelSoftGreAction,
  NetworkTypeEnum,
  NetworkVenue,
  TunnelProfileViewData,
  VlanPool,
  WifiRbacUrlsInfo,
  configTemplatePolicyTypeMap,
  configTemplateServiceTypeMap,
  useConfigTemplate,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher
} from '@acx-ui/rc/utils'
import { useParams }  from '@acx-ui/react-router-dom'
import { WifiScopes } from '@acx-ui/types'
import {
  getUserProfile,
  hasAllowedOperations,
  hasPermission
} from '@acx-ui/user'
import { getOpsApi } from '@acx-ui/utils'

import { useIsConfigTemplateEnabledByType } from '../configTemplates'
import { useLazyGetAAAPolicyInstance }      from '../policies/AAAForm/aaaPolicyQuerySwitcher'
import { useIsEdgeReady }                   from '../useEdgeActions'


export const TMP_NETWORK_ID = 'tmpNetworkId'
export interface NetworkVxLanTunnelProfileInfo {
  enableTunnel: boolean,
  enableVxLan: boolean,
  vxLanTunnels: TunnelProfileViewData[] | undefined
}

export const hasAuthRadius = (data: NetworkSaveData | null, wlanData: any,
  options?: Record<string, boolean>) => {
  if (!data) return false

  const { type } = data
  const { wlan={} } = wlanData

  switch (type) {
    case NetworkTypeEnum.AAA:
      return true
    case NetworkTypeEnum.HOTSPOT20:
      return options?.isSupportHotspot20NasId

    case NetworkTypeEnum.OPEN:
    case NetworkTypeEnum.PSK:
      const { macAddressAuthentication=false, isMacRegistrationList=false } = wlan
      return (macAddressAuthentication && !isMacRegistrationList)

    case NetworkTypeEnum.DPSK:
      return wlanData?.isCloudpathEnabled

    case NetworkTypeEnum.CAPTIVEPORTAL:
      const { guestPortal, enableAccountingService } = data
      if (guestPortal?.guestNetworkType === GuestNetworkTypeEnum.Cloudpath) {
        return true
      }

      if  (guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr) {
        // keep this for next feature ( authservice is 'always accept')
        const wisprPage = wlanData?.guestPortal?.wisprPage
        if (wisprPage?.customExternalProvider === true) { // custom provider
          if (enableAccountingService !== true &&
              wisprPage?.authType === AuthRadiusEnum.ALWAYS_ACCEPT) {
            return false
          }
        }
        return true
      }
      return false

    default:
      return false
  }
}

const noAccountingPorviderNames = ['Height8', 'SocialSignin', 'WILAS', 'WILAS-2']

export const hasAccountingRadius = (data: NetworkSaveData | null, wlanData: any) => {
  if (!data) return false

  const { type, enableAccountingService } = data

  if (type === NetworkTypeEnum.CAPTIVEPORTAL) {
    const { guestPortal } = data
    if (guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr) {
      const wisprPage = wlanData?.guestPortal?.wisprPage
      if (wisprPage) {
        const { customExternalProvider = false, externalProviderName = '' } = wisprPage
        if (!customExternalProvider && externalProviderName !== '' ) {
          return !noAccountingPorviderNames.includes(externalProviderName)
        }
      }
    }
  }

  return enableAccountingService === true
}

export const isShowDynamicVlan = (data: NetworkSaveData | null, options?: Record<string, boolean>) => {
  const { type, wlan } = data || {}

  if (!type || !wlan) return false
  if (type === NetworkTypeEnum.AAA || type === NetworkTypeEnum.DPSK) return true
  if (type === NetworkTypeEnum.OPEN && wlan?.macAddressAuthentication ) return true

  if (data?.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr &&
      data?.wlan?.bypassCPUsingMacAddressAuthentication) return true

  if (options?.isSupportDVlanWithPskMacAuth &&
    data?.type === NetworkTypeEnum.PSK &&
    data.wlan?.macAddressAuthentication) return true

  return false

}

export const hasVxLanTunnelProfile = (data: NetworkSaveData | null) => {
  if (!data) return false

  const wlanAdvaced = (data?.wlan?.advancedCustomization as DpskWlanAdvancedCustomization)
  if (wlanAdvaced?.tunnelProfileId) {
    return true
  }
  return false
}

export const useNetworkVxLanTunnelProfileInfo =
  (data: NetworkSaveData | null): NetworkVxLanTunnelProfileInfo => {
    const isEdgeEnabled = useIsEdgeReady()

    const { data: tunnelProfileData } = useGetTunnelProfileViewDataListQuery(
      { payload: {
        filters: { networkIds: [data?.id] }
      } },
      { skip: !isEdgeEnabled || !data }
    )

    const vxLanTunnels = tunnelProfileData?.data.filter(item => item.type === NetworkSegmentTypeEnum.VXLAN
      && item.personalIdentityNetworkIds.length > 0)
    const enableTunnel = !_.isEmpty(tunnelProfileData?.data)
    const enableVxLan = !_.isEmpty(vxLanTunnels)

    return {
      enableTunnel,
      enableVxLan,
      vxLanTunnels
    }
  }

// eslint-disable-next-line max-len
export function useServicePolicyEnabledWithConfigTemplate (configTemplateType: ConfigTemplateType): boolean {
  const isPolicyConfigTemplate = configTemplatePolicyTypeMap[configTemplateType]
  const isServiceConfigTemplate = configTemplateServiceTypeMap[configTemplateType]
  const { isTemplate } = useConfigTemplate()
  const isConfigTemplateEnabledByType = useIsConfigTemplateEnabledByType(configTemplateType)
  const result = !isTemplate || isConfigTemplateEnabledByType

  if (!isPolicyConfigTemplate && !isServiceConfigTemplate) return false

  if (isPolicyConfigTemplate || isServiceConfigTemplate) {
    return result
  }

  return false
}

export function deriveRadiusFieldsFromServerData (data: NetworkSaveData): NetworkSaveData {
  return {
    ...data,
    isCloudpathEnabled: data.authRadius ? true : false,
    enableAccountingService: (data.accountingRadius || data.guestPortal?.wisprPage?.accountingRadius)
      ? true
      : false
  }
}

export function deriveWISPrFieldsFromServerData (data: NetworkSaveData): NetworkSaveData {
  if (!isWISPrNetwork(data)) return data

  if (data.guestPortal?.wisprPage?.customExternalProvider) {
    return _.merge({}, data, {
      guestPortal: { wisprPage: { providerName: data.guestPortal.wisprPage.externalProviderName } }
    })
  }

  return data
}

type RadiusIdKey = Extract<keyof NetworkSaveData, 'authRadiusId' | 'accountingRadiusId'>
export function useRadiusServer () {
  const { isTemplate } = useConfigTemplate()
  const enableServicePolicyRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : enableServicePolicyRbac
  const { networkId } = useParams()
  const [ activateRadiusServer ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useActivateRadiusServerMutation,
    useTemplateMutationFn: useActivateRadiusServerTemplateMutation
  })
  const [ deactivateRadiusServer ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeactivateRadiusServerMutation,
    useTemplateMutationFn: useDeactivateRadiusServerTemplateMutation
  })
  const [ updateRadiusServerSettings ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateRadiusServerSettingsMutation,
    useTemplateMutationFn: useUpdateRadiusServerTemplateSettingsMutation
  })
  const { data: radiusServerProfiles } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetAAAPolicyViewModelListQuery,
    useTemplateQueryFn: useGetAAAPolicyTemplateListQuery,
    payload: { filters: { networkIds: [networkId] } },
    enableRbac: resolvedRbacEnabled,
    skip: !networkId || !resolvedRbacEnabled
  })
  const { data: radiusServerSettings } = useConfigTemplateQueryFnSwitcher<NetworkRadiusSettings>({
    useQueryFn: useGetRadiusServerSettingsQuery,
    useTemplateQueryFn: useGetRadiusServerTemplateSettingsQuery,
    enableRbac: resolvedRbacEnabled,
    skip: !networkId || !resolvedRbacEnabled
  })
  const [ getAAAPolicy ] = useLazyGetAAAPolicyInstance()
  // eslint-disable-next-line max-len
  const [ radiusServerConfigurations, setRadiusServerConfigurations ] = useState<Partial<NetworkSaveData>>()

  useEffect(() => {
    if (!radiusServerProfiles || !radiusServerSettings) return

    const fetchRadiusDetails = async () => {
      const resolvedResult: Partial<NetworkSaveData> = {
        enableAccountingProxy: radiusServerSettings.enableAccountingProxy,
        enableAuthProxy: radiusServerSettings.enableAuthProxy,
        wlan: {
          macAddressAuthenticationConfiguration: {
            macAuthMacFormat: radiusServerSettings.macAuthMacFormat
          },
          macAuthMacFormat: radiusServerSettings.macAuthMacFormat
        }
      }

      for (const profile of radiusServerProfiles.data) {
        const { id, type } = profile
        const { data: aaaProfile } = await getAAAPolicy({
          params: { policyId: id },
          enableRbac: resolvedRbacEnabled
        })

        if (type === 'ACCOUNTING') {
          resolvedResult.accountingRadiusId = id
          resolvedResult.accountingRadius = aaaProfile
        } else if (type === 'AUTHENTICATION') {
          resolvedResult.authRadiusId = id
          resolvedResult.authRadius = aaaProfile
        }
      }

      setRadiusServerConfigurations(resolvedResult)
    }

    fetchRadiusDetails()
  }, [radiusServerProfiles, radiusServerSettings])

  const updateProfile = async (saveData: NetworkSaveData, networkId?: string) => {
    if (!shouldSaveRadiusServerProfile(saveData)) return Promise.resolve()

    const mutations: Promise<CommonResult>[] = []

    const radiusServerIdKeys: RadiusIdKey[] = ['authRadiusId', 'accountingRadiusId']
    radiusServerIdKeys.forEach(radiusKey => {
      const newRadiusId = getRadiusIdFromFormData(radiusKey, saveData)
      const oldRadiusId = radiusServerConfigurations?.[radiusKey]

      if (!newRadiusId && !oldRadiusId) return

      const isRadiusIdChanged = isRadiusKeyChanged(radiusKey, saveData, radiusServerConfigurations)
      const isDifferentNetwork = saveData.id !== networkId

      if (isRadiusIdChanged || isDifferentNetwork) {
        const mutationTrigger = newRadiusId ? activateRadiusServer : deactivateRadiusServer
        const radiusIdToUse = newRadiusId ?? oldRadiusId as string

        mutations.push(mutationTrigger({ params: { networkId, radiusId: radiusIdToUse } }).unwrap())
      }
    })

    return await Promise.all(mutations)
  }

  const updateSettings = async (saveData: NetworkSaveData, networkId?: string) => {
    if (!shouldSaveRadiusServerSettings(saveData)) return Promise.resolve()

    return await updateRadiusServerSettings({
      params: { networkId },
      payload: {
        enableAccountingProxy: saveData.enableAccountingProxy,
        enableAuthProxy: saveData.enableAuthProxy,
        macAuthMacFormat: resolveMacAuthFormat(saveData)
      }
    }).unwrap()
  }

  // eslint-disable-next-line max-len
  const updateRadiusServer = async (saveData: NetworkSaveData, networkId?: string) => {
    if (!resolvedRbacEnabled || !networkId) return Promise.resolve()

    await updateSettings(saveData, networkId) // It is necessary to ensure that updateSettings is completed before updateProfile.
    await updateProfile(saveData, networkId)
  }

  return {
    updateRadiusServer,
    radiusServerConfigurations
  }
}

function resolveMacAuthFormat (newSettings: NetworkSaveData): string | undefined {
  return newSettings.type === NetworkTypeEnum.AAA
    ? newSettings.wlan?.macAddressAuthenticationConfiguration?.macAuthMacFormat
    : newSettings.wlan?.macAuthMacFormat
}

export function hasRadiusProfileInFormData (key: RadiusIdKey, formData: NetworkSaveData): boolean {
  return _.has(formData, isWISPrNetwork(formData)
    ? key === 'authRadiusId' ? 'guestPortal.wisprPage.authRadius' : 'guestPortal.wisprPage.accountingRadius'
    : key
  )
}

function isRadiusKeyChanged (key: RadiusIdKey, formData: NetworkSaveData, serverData?: NetworkSaveData): boolean {
  if (!hasRadiusProfileInFormData(key, formData)) return false

  const keyFromForm = getRadiusIdFromFormData(key, formData)
  const keyFromServer = serverData?.[key]

  return keyFromForm !== keyFromServer
}

function isWISPrNetwork (formData: NetworkSaveData) {
  return formData.type === NetworkTypeEnum.CAPTIVEPORTAL
    && formData.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr
}

export function getRadiusIdFromFormData (key: RadiusIdKey, formData: NetworkSaveData): string | undefined | null {
  const { guestPortal, enableAccountingService } = formData
  const wisprPage = guestPortal?.wisprPage

  if (isWISPrNetwork(formData)) {
    if (wisprPage?.customExternalProvider) {
      return key === 'authRadiusId' ? wisprPage.authRadius?.id : wisprPage.accountingRadius?.id
    }
    return undefined
  }

  return (key === 'authRadiusId' || enableAccountingService) ? formData[key] : undefined
}

export function shouldSaveRadiusServerSettings (saveData: NetworkSaveData): boolean {
  switch (saveData.type) {
    case NetworkTypeEnum.PSK:
    case NetworkTypeEnum.OPEN:
      return !!saveData.wlan?.macAuthMacFormat
    case NetworkTypeEnum.DPSK:
      return !!saveData.isCloudpathEnabled
    case NetworkTypeEnum.AAA:
      return !saveData.useCertificateTemplate
    case NetworkTypeEnum.CAPTIVEPORTAL:
      return saveData.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.Cloudpath
  }

  return false
}

export function shouldSaveRadiusServerProfile (saveData: NetworkSaveData): boolean {
  if (saveData.type === NetworkTypeEnum.CAPTIVEPORTAL
    && saveData.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr
    && saveData.guestPortal?.wisprPage?.customExternalProvider
  ) {
    return true
  }
  return shouldSaveRadiusServerSettings(saveData)
}

export function useClientIsolationActivations (shouldSkipMode: boolean,
  saveState: NetworkSaveData, updateSaveData: Function, form: FormInstance) {
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const { networkId } = useParams()
  const [ bindClientIsolation ] = useBindClientIsolationMutation()
  const [ unbindClientIsolation ] = useUnbindClientIsolationMutation()

  const { data: clientIsolationBindingData } = useGetEnhancedClientIsolationListQuery(
    { payload: { pageSize: 10000, page: 1, filters: { 'activations.wifiNetworkId': [networkId] } },
      enableRbac },
    { skip: shouldSkipMode || saveState.venues?.length === 0 || !enableRbac })

  useEffect(() => {
    if (!clientIsolationBindingData || !saveState) return

    const venueClientIsolationMap = new Map<string, string>()
    _.forEach(clientIsolationBindingData?.data, item => {
      const activations = _.filter(item.activations, { wifiNetworkId: networkId })
      activations.forEach(activation => venueClientIsolationMap.set(activation.venueId, item.id))
    })

    const venueData = saveState?.venues?.map(v => ({ ...v,
      clientIsolationAllowlistId: venueClientIsolationMap.get(v.venueId!) }))
    const fullNetworkSaveData = { ...saveState, venues: venueData }
    const resolvedNetworkSaveData = deriveRadiusFieldsFromServerData(fullNetworkSaveData)

    form.setFieldsValue({
      ...resolvedNetworkSaveData
    })
    updateSaveData(resolvedNetworkSaveData)
  }, [clientIsolationBindingData])

  // eslint-disable-next-line max-len
  const updateClientIsolationActivations = async (saveData: NetworkSaveData, oldSaveData?: NetworkSaveData | null, networkId?: string) => {
    if (!enableRbac || !networkId) return Promise.resolve()
    const createMutationPromises = (data: NetworkVenue[], action: Function) =>
      _.map(data, item => action({
        params: {
          venueId: item.venueId, networkId: networkId, policyId: item.clientIsolationAllowlistId }
      }).unwrap())

    const bindData = _.filter(saveData?.venues, v =>
      v.clientIsolationAllowlistId != null &&
        (!_.some(oldSaveData?.venues, { venueId: v.venueId }) ||
          _.some(oldSaveData?.venues, ov => ov.venueId === v.venueId
            && ov.clientIsolationAllowlistId !== v.clientIsolationAllowlistId)
        )
    )

    const unbindData = _.filter(oldSaveData?.venues, ov =>
      ov.clientIsolationAllowlistId != null &&
        _.some(saveData?.venues, v => v.venueId === ov.venueId && !v.clientIsolationAllowlistId)
    )

    const bindMutations = createMutationPromises(bindData, bindClientIsolation)
    const unbindMutations = createMutationPromises(unbindData, unbindClientIsolation)

    await Promise.all([...bindMutations, ...unbindMutations])
  }

  return { updateClientIsolationActivations }
}

export function useVlanPool () {
  const isPolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const [activate] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useActivateVlanPoolMutation,
    useTemplateMutationFn: useActivateVlanPoolTemplateOnWifiNetworkMutation
  })

  const [deactivate] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeactivateVlanPoolMutation,
    useTemplateMutationFn: useDeactivateVlanPoolTemplateOnWifiNetworkMutation
  })

  // eslint-disable-next-line max-len
  const activateVlanPool = async (payload: { name: string, vlanMembers: string[] }, networkId?: string, providerId?: string) => {
    return networkId && providerId ?
      await activate({
        params: { networkId: networkId, profileId: providerId },
        payload: payload
      }).unwrap(): null
  }

  const deactivateVlanPool = async (networkId?: string, providerId?: string) => {
    return networkId && providerId ?
      await deactivate({ params: { networkId: networkId, profileId: providerId } }).unwrap() : null
  }

  // eslint-disable-next-line max-len
  const updateVlanPoolActivation = async (networkId?: string, vlanPool?: VlanPool | null, originalPoolId?: string) => {
    if (!isPolicyRbacEnabled) return
    if (!vlanPool && !originalPoolId) return
    if (originalPoolId && !vlanPool) await deactivateVlanPool(networkId, originalPoolId)
    // eslint-disable-next-line max-len
    if (vlanPool && originalPoolId !== vlanPool.id)  await activateVlanPool(vlanPool, networkId, vlanPool.id)
  }

  return {
    //vlanPoolId,
    updateVlanPoolActivation
  }
}

export function useWifiCalling (notReady: boolean) {
  const { isTemplate } = useConfigTemplate()
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const isServicePolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const enableRbac = isTemplate ? isConfigTemplateRbacEnabled : isServicePolicyRbacEnabled

  const { networkId } = useParams()
  const { data: wifiCallingData } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetEnhancedWifiCallingServiceListQuery,
    useTemplateQueryFn: useGetEnhancedWifiCallingServiceTemplateListQuery,
    payload: { page: 1, pageSize: 1000, filters: { networkIds: [networkId] } },
    enableRbac,
    skip: !enableRbac || !networkId || notReady
  })
  const wifiCallingIds = useMemo(() =>
    wifiCallingData?.data.map(p => p.id) || []
  , [wifiCallingData])

  const [ activate ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useActivateWifiCallingServiceMutation,
    useTemplateMutationFn: useActivateWifiCallingServiceTemplateMutation
  })
  const [ deactivate ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeactivateWifiCallingServiceMutation,
    useTemplateMutationFn: useDeactivateWifiCallingServiceTemplateMutation
  })

  const activateAll = async (networkId: string, ids: string[]) => {
    if (ids.length === 0) return

    return Promise.all(ids.map(serviceId => activate({ params: { networkId, serviceId } })))
  }

  const deactivateAll = async (networkId: string, ids: string[]) => {
    if (ids.length === 0) return

    return Promise.all(ids.map(serviceId => deactivate({ params: { networkId, serviceId } })))
  }

  const updateWifiCallingActivation = async (networkId?: string, newData?: NetworkSaveData) => {
    if (!enableRbac || !networkId) return

    const { wifiCallingEnabled = false, wifiCallingIds: newIds = [] }
      = newData?.wlan?.advancedCustomization ?? {}
    const { wifiCallingEnabled: originalEnabled = false, wifiCallingIds: originalIds = [] }
      = { wifiCallingEnabled: wifiCallingIds.length !== 0, wifiCallingIds }

    if (wifiCallingEnabled) {
      if (originalEnabled) {
        const activateIds = newIds.filter(id => !originalIds.includes(id))
        const deactivateIds = originalIds.filter(id => !newIds.includes(id))

        return Promise.all([
          activateAll(networkId, activateIds),
          deactivateAll(networkId, deactivateIds)
        ])
      } else {
        return activateAll(networkId, newIds)
      }
    } else if (originalEnabled) {
      return deactivateAll(networkId, originalIds)
    }

    return
  }

  return {
    wifiCallingIds,
    updateWifiCallingActivation
  }
}

export function useCertificateTemplateActivation () {
  const [ activateTemplate ] = useActivateCertificateTemplateMutation()
  const [ deactivateTemplate ] = useDeactivateCertificateTemplateMutation()

  const activateCertificateTemplate =
    async (certificateTemplateId?: string, networkId?: string) => {
      if (certificateTemplateId && networkId) {
        return await activateTemplate({ params: { networkId, certificateTemplateId } }).unwrap()
      }
      return null
    }

  const deactivateCertificateTemplate =
    async (certificateTemplateId?: string, networkId?: string) => {
      if (certificateTemplateId && networkId) {
        return await deactivateTemplate({ params: { networkId, certificateTemplateId } }).unwrap()
      }
      return null
    }

  const updateCertificateTemplateActivation =
    async (networkId?: string, formIds?: string[], existingIds: string[] = []) => {
      if (!formIds) return  // no updated

      const activateIds = _.difference(formIds, existingIds)
      const deactivateIds = _.difference(existingIds, formIds)

      const [preserveDeactivateId, ...restDeactivate] = deactivateIds
      const [preserveActivateId, ...restActivate] = activateIds

      await Promise.all(restDeactivate.map(id => deactivateCertificateTemplate(id, networkId)))
      await Promise.all(restActivate.map(id => activateCertificateTemplate(id, networkId)))
      if (preserveDeactivateId) {
        await deactivateCertificateTemplate(preserveDeactivateId, networkId)
      }
      if (preserveActivateId) {
        await activateCertificateTemplate(preserveActivateId, networkId)
      }
    }

  return { activateCertificateTemplate, updateCertificateTemplateActivation }
}

// eslint-disable-next-line max-len
export function useAccessControlActivation () {
  const enableServicePolicyRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const [ activateL2Acl ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useActivateL2AclOnWifiNetworkMutation,
    useTemplateMutationFn: useActivateL2AclTemplateOnWifiNetworkMutation
  })
  const [ deactivateL2Acl ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeactivateL2AclOnWifiNetworkMutation,
    useTemplateMutationFn: useDeactivateL2AclTemplateOnWifiNetworkMutation
  })
  const [ activateL3Acl ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useActivateL3AclOnWifiNetworkMutation,
    useTemplateMutationFn: useActivateL3AclTemplateOnWifiNetworkMutation
  })
  const [ deactivateL3Acl ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeactivateL3AclOnWifiNetworkMutation,
    useTemplateMutationFn: useDeactivateL3AclTemplateOnWifiNetworkMutation
  })
  const [ activateDevice ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useActivateDeviceOnWifiNetworkMutation,
    useTemplateMutationFn: useActivateDeviceTemplateOnWifiNetworkMutation
  })
  const [ deactivateDevice ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeactivateDeviceOnWifiNetworkMutation,
    useTemplateMutationFn: useDeactivateDeviceTemplateOnWifiNetworkMutation
  })
  const [ activateApplication ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useActivateApplicationPolicyOnWifiNetworkMutation,
    useTemplateMutationFn: useActivateApplicationPolicyTemplateOnWifiNetworkMutation
  })
  const [ deactivateApplication ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeactivateApplicationPolicyOnWifiNetworkMutation,
    useTemplateMutationFn: useDeactivateApplicationPolicyTemplateOnWifiNetworkMutation
  })
  const [ activateAccessControl ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useActivateAccessControlProfileOnWifiNetworkMutation,
    useTemplateMutationFn: useActivateAccessControlProfileTemplateOnWifiNetworkMutation
  })
  const [ deactivateAccessControl ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeactivateAccessControlProfileOnWifiNetworkMutation,
    useTemplateMutationFn: useDeactivateAccessControlProfileTemplateOnWifiNetworkMutation
  })

  const accessControlWifiActionMap = {
    l2AclPolicyId: {
      added: (params: Params<string>) => {
        return activateL2Acl({ params, enableRbac: enableServicePolicyRbac }).unwrap()
      },
      removed: (params: Params<string>) => {
        return deactivateL2Acl({ params, enableRbac: enableServicePolicyRbac }).unwrap()
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updated: (oldParams: Params<string>, params: Params<string>) => {
        return [
          deactivateL2Acl({ params: oldParams, enableRbac: enableServicePolicyRbac }).unwrap()
          // activateL2Acl({ params, enableRbac: enableServicePolicyRbac }).unwrap()
        ]
      }
    },
    l3AclPolicyId: {
      added: (params: Params<string>) => {
        return activateL3Acl({ params, enableRbac: enableServicePolicyRbac }).unwrap()
      },
      removed: (params: Params<string>) => {
        return deactivateL3Acl({ params, enableRbac: enableServicePolicyRbac }).unwrap()
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updated: (oldParams: Params<string>, params: Params<string>) => {
        return [
          deactivateL3Acl({ params: oldParams, enableRbac: enableServicePolicyRbac }).unwrap()
          // activateL3Acl({ params, enableRbac: enableServicePolicyRbac }).unwrap()
        ]
      }
    },
    devicePolicyId: {
      added: (params: Params<string>) => {
        return activateDevice({ params, enableRbac: enableServicePolicyRbac }).unwrap()
      },
      removed: (params: Params<string>) => {
        return deactivateDevice({ params, enableRbac: enableServicePolicyRbac }).unwrap()
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updated: (oldParams: Params<string>, params: Params<string>) => {
        return [
          deactivateDevice({ params: oldParams, enableRbac: enableServicePolicyRbac }).unwrap()
          // activateDevice({ params, enableRbac: enableServicePolicyRbac }).unwrap()
        ]
      }
    },
    applicationPolicyId: {
      added: (params: Params<string>) => {
        return activateApplication({ params, enableRbac: enableServicePolicyRbac }).unwrap()
      },
      removed: (params: Params<string>) => {
        return deactivateApplication({ params, enableRbac: enableServicePolicyRbac }).unwrap()
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updated: (oldParams: Params<string>, params: Params<string>) => {
        return [
          deactivateApplication({ params: oldParams, enableRbac: enableServicePolicyRbac }).unwrap()
          // activateApplication({ params, enableRbac: enableServicePolicyRbac }).unwrap()
        ]
      }
    },
    accessControlProfileId: {
      added: (params: Params<string>) => {
        return activateAccessControl({ params, enableRbac: enableServicePolicyRbac }).unwrap()
      },
      removed: (params: Params<string>) => {
        return deactivateAccessControl({ params, enableRbac: enableServicePolicyRbac }).unwrap()
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updated: (oldParams: Params<string>, params: Params<string>) => {
        return [
          // eslint-disable-next-line max-len
          deactivateAccessControl({ params: oldParams, enableRbac: enableServicePolicyRbac }).unwrap()
          // activateAccessControl({ params, enableRbac: enableServicePolicyRbac }).unwrap()
        ]
      }
    }
  }

  const filterForAccessControlComparison = (data: NetworkSaveData) => {
    let object = {} as Record<string, unknown>
    if (data.wlan?.advancedCustomization?.accessControlEnable) {
      object['accessControlProfileId'] = data.wlan.advancedCustomization.accessControlProfileId
    } else {
      if (data.wlan?.advancedCustomization?.hasOwnProperty('l2AclPolicyId')
        && data.wlan?.advancedCustomization.l2AclEnable) {
        object['l2AclPolicyId'] = data.wlan.advancedCustomization.l2AclPolicyId
      }

      if (data.wlan?.advancedCustomization?.hasOwnProperty('l3AclPolicyId')
        && data.wlan?.advancedCustomization.l3AclEnable) {
        object['l3AclPolicyId'] = data.wlan.advancedCustomization.l3AclPolicyId
      }

      if (data.wlan?.advancedCustomization?.hasOwnProperty('devicePolicyId')
        && data.wlan?.advancedCustomization.enableDeviceOs) {
        object['devicePolicyId'] = data.wlan.advancedCustomization.devicePolicyId
      }

      if (data.wlan?.advancedCustomization?.hasOwnProperty('applicationPolicyId')
        && data.wlan?.advancedCustomization?.applicationPolicyEnable) {
        object['applicationPolicyId'] = data.wlan.advancedCustomization.applicationPolicyId
      }
    }

    return object
  }


  // eslint-disable-next-line max-len
  const itemProcessFn = (currentPayload: Record<string, unknown>, oldPayload: Record<string, unknown>, key: string, id: string) => {
    if (!Object.keys(oldPayload).length) {
      const keyObject = currentPayload[key]
      return {
        [key]: { networkId: id, [key]: keyObject }
      } as ActionItem
    }

    const oldObject = oldPayload[key]
    const updateObject = currentPayload[key]
    return {
      [key]: {
        oldAction: { networkId: id, [key]: oldObject },
        action: { networkId: id, [key]: updateObject }
      }
    } as UpdateActionItem
  }

  const operateAction = async (
    comparisonObject: ComparisonObjectType, actionMap: WifiActionMapType, enableRbac: boolean
  ) => {
    if (!enableRbac) return Promise.resolve()

    // eslint-disable-next-line max-len
    const removeActions: Promise<CommonResult>[] = []
    for (const removedObject of comparisonObject.removed) {
      Object.entries(removedObject).forEach(([key, value]) => {
        if (key in actionMap) {
          removeActions.push(actionMap[key].removed(value))
        }
      })
    }
    // eslint-disable-next-line max-len
    const addActions: Promise<CommonResult>[] = []
    for (const addedObject of comparisonObject.added) {
      Object.entries(addedObject).forEach(([key, value]) => {
        if (key in actionMap) {
          addActions.push(actionMap[key].added(value))
        }
      })
    }

    // eslint-disable-next-line max-len
    const updateActions: Promise<CommonResult>[] = []
    for(const updatedObject of comparisonObject.updated) {
      Object.entries(updatedObject).forEach(([key, value]) => {
        if (key in actionMap) {
          const updatedActionRequests = actionMap[key].updated(value.oldAction, value.action)
          for (const request of updatedActionRequests) {
            updateActions.push(request)
          }
        }
      })
    }

    return Promise.all([
      ...removeActions,
      ...updateActions,
      ...addActions
    ])
  }

  const updateAccessControl = async (formData: NetworkSaveData, data?: NetworkSaveData | null, networkId?: string) => {
    if (!enableServicePolicyRbac || !networkId) return Promise.resolve()

    const comparisonResult = comparePayload(
      filterForAccessControlComparison(formData),
      filterForAccessControlComparison(data || {}),
      networkId || '',
      itemProcessFn
    )

    return await operateAction(
      comparisonResult,
      accessControlWifiActionMap,
      enableServicePolicyRbac
    )
  }

  return {
    updateAccessControl
  }
}

export const getDefaultMloOptions = (wifi7Mlo3LinkFlag: boolean) => ({
  enable24G: true,
  enable50G: true,
  enable6G: wifi7Mlo3LinkFlag ? true : false
})

export const useUpdateSoftGreActivations = () => {
  const [ activateSoftGre ] = useActivateSoftGreMutation()
  const [ dectivateSoftGre ] = useDectivateSoftGreMutation()

  // eslint-disable-next-line max-len
  const updateSoftGreActivations = async (networkId: string, updates: NetworkTunnelSoftGreAction, activatedVenues: NetworkVenue[], cloneMode: boolean, editMode: boolean) => {
    const actions = Object.keys(updates).filter(venueId => {
      return _.find(activatedVenues, { venueId })
    }).map((venueId) => {
      // eslint-disable-next-line max-len
      const action = updates[venueId]
      if (editMode && !cloneMode && !action.newProfileId && action.oldProfileId) {
        return dectivateSoftGre({ params: { venueId, networkId, policyId: action.oldProfileId } })
      } else if (action.newProfileId && action.newProfileId !== action.oldProfileId) {
        return activateSoftGre({ params: { venueId, networkId, policyId: action.newProfileId } })
      }
      return Promise.resolve()
    })

    return await Promise.all(actions)
  }

  return updateSoftGreActivations
}

export const useUpdateIpsecActivations = () => {
  const [ activateIpsec ] = useActivateIpsecMutation()
  const [ deactivateIpsec ] = useDeactivateIpsecMutation()
  const [ activateSoftGre ] = useActivateSoftGreMutation()

  // eslint-disable-next-line max-len
  const updateIpsecActivations = async (networkId: string, updates: NetworkTunnelIpsecAction, activatedVenues: NetworkVenue[], cloneMode: boolean, editMode: boolean) => {
    const actions = Object.keys(updates).filter(venueId => {
      return _.find(activatedVenues, { venueId })
    }).map((venueId) => {
      // eslint-disable-next-line max-len
      const action = updates[venueId]
      if (editMode && !cloneMode && !action.newProfileId && action.oldProfileId) {
        return deactivateIpsec({ params: { venueId, networkId, softGreProfileId: action.softGreProfileId, ipsecProfileId: action.oldProfileId } })
      } else if (action.newProfileId && action.newProfileId !== action.oldProfileId && action.enableIpsec === true) {
        return activateIpsec({ params: { venueId, networkId, softGreProfileId: action.softGreProfileId, ipsecProfileId: action.newProfileId } })
      } else if (action.softGreProfileId && action.enableIpsec === false) {
        return activateSoftGre({ params: { venueId, networkId, policyId: action.softGreProfileId } })
      }
      return Promise.resolve()
    })

    return await Promise.all(actions)
  }

  return updateIpsecActivations
}

export const hasControlnetworkVenuePermission = (isTemplate: boolean) => {
  const hasActivatePermission = hasPermission({ scopes: [WifiScopes.CREATE, WifiScopes.UPDATE] })
  const { rbacOpsApiEnabled } = getUserProfile()

  const addNetworkVenueOpsAPi = getOpsApi(isTemplate
    ? ConfigTemplateUrlsInfo.addNetworkVenueTemplateRbac
    : WifiRbacUrlsInfo.addNetworkVenue)

  const updateNetworkVenueOpsAPi = getOpsApi(isTemplate
    ? ConfigTemplateUrlsInfo.updateNetworkVenueTemplateRbac
    : WifiRbacUrlsInfo.updateNetworkVenue)

  const deleteNetworkVenueOpsAPi = getOpsApi(isTemplate
    ? ConfigTemplateUrlsInfo.deleteNetworkVenueTemplateRbac
    : WifiRbacUrlsInfo.deleteNetworkVenue)

  const hasActivateNetworkVenuePermission = rbacOpsApiEnabled
    ? hasAllowedOperations([[ addNetworkVenueOpsAPi, deleteNetworkVenueOpsAPi]])
    : (hasActivatePermission)

  const hasUpdateNetworkVenuePermission = rbacOpsApiEnabled
    ? hasAllowedOperations([updateNetworkVenueOpsAPi])
    : (hasActivatePermission)

  return {
    addNetworkVenueOpsAPi,
    updateNetworkVenueOpsAPi,
    deleteNetworkVenueOpsAPi,
    hasActivateNetworkVenuePermission,
    hasUpdateNetworkVenuePermission
  }
}
