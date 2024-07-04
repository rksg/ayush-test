/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'

import { FormInstance } from 'antd'
import _                from 'lodash'

import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import {
  covertAAAViewModalTypeToRadius,
  useActivateRadiusServerMutation,
  useActivateVlanPoolMutation,
  useBindClientIsolationMutation,
  useDeactivateRadiusServerMutation,
  useDeactivateVlanPoolMutation,
  useGetAAAPolicyViewModelListQuery,
  useGetEnhancedClientIsolationListQuery,
  useGetRadiusServerSettingsQuery,
  useGetTunnelProfileViewDataListQuery,
  useGetVLANPoolPolicyViewModelListQuery,
  useUpdateRadiusServerSettingsMutation,
  useActivateVlanPoolTemplateOnWifiNetworkMutation,
  useDeactivateVlanPoolTemplateOnWifiNetworkMutation,
  useUnbindClientIsolationMutation
} from '@acx-ui/rc/services'
import {
  AuthRadiusEnum,
  GuestNetworkTypeEnum,
  NetworkSaveData,
  NetworkTypeEnum,
  DpskWlanAdvancedCustomization,
  TunnelTypeEnum,
  TunnelProfileViewData,
  useConfigTemplate,
  ConfigTemplateType,
  configTemplatePolicyTypeMap,
  configTemplateServiceTypeMap,
  CommonResult,
  VlanPool,
  useConfigTemplateMutationFnSwitcher,
  NetworkVenue
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { useIsConfigTemplateEnabledByType } from '../configTemplates'
import { useIsEdgeReady }                   from '../useEdgeActions'

export interface NetworkVxLanTunnelProfileInfo {
  enableTunnel: boolean,
  enableVxLan: boolean,
  vxLanTunnels: TunnelProfileViewData[] | undefined
}

export const hasAuthRadius = (data: NetworkSaveData | null, wlanData: any) => {
  if (!data) return false

  const { type } = data
  const { wlan={} } = wlanData

  switch (type) {
    case NetworkTypeEnum.AAA:
      return true

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

    const vxLanTunnels = tunnelProfileData?.data.filter(item => item.type === TunnelTypeEnum.VXLAN
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
  const isPolicyEnabled = useIsSplitOn(Features.POLICIES)
  const isServiceEnabled = useIsSplitOn(Features.SERVICES)
  const isPolicyConfigTemplate = configTemplatePolicyTypeMap[configTemplateType]
  const isServiceConfigTemplate = configTemplateServiceTypeMap[configTemplateType]
  const { isTemplate } = useConfigTemplate()
  const isConfigTemplateEnabledByType = useIsConfigTemplateEnabledByType(configTemplateType)
  const result = !isTemplate || isConfigTemplateEnabledByType

  if (!isPolicyConfigTemplate && !isServiceConfigTemplate) return false

  if (isPolicyConfigTemplate) {
    return isPolicyEnabled && result
  }

  if (isServiceConfigTemplate) {
    return isServiceEnabled && result
  }

  return false
}

// eslint-disable-next-line max-len
export function deriveFieldsFromServerData (data: NetworkSaveData): NetworkSaveData {
  return {
    ...data,
    isCloudpathEnabled: data.authRadius ? true : false,
    // eslint-disable-next-line max-len
    enableAccountingService: (data.accountingRadius || data.guestPortal?.wisprPage?.accountingRadius)
      ? true
      : false
  }
}

export function useRadiusServer () {
  const enableServicePolicyRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const { networkId } = useParams()
  const [ activateRadiusServer ] = useActivateRadiusServerMutation()
  const [ deactivateRadiusServer ] = useDeactivateRadiusServerMutation()
  const [ updateRadiusServerSettings ] = useUpdateRadiusServerSettingsMutation()
  const { data: radiusServerProfiles } = useGetAAAPolicyViewModelListQuery({
    payload: { filters: { networkIds: [networkId] } },
    enableRbac: enableServicePolicyRbac
  }, { skip: !networkId || !enableServicePolicyRbac })
  const { data: radiusServerSettings } = useGetRadiusServerSettingsQuery({
    params: { networkId }
  }, { skip: !networkId || !enableServicePolicyRbac })
  // eslint-disable-next-line max-len
  const [ radiusServerConfigurations, setRadiusServerConfigurations ] = useState<Partial<NetworkSaveData>>()

  useEffect(() => {
    if (!radiusServerProfiles || !radiusServerSettings) return


    const resolvedResult: Partial<NetworkSaveData> = {
      enableAccountingProxy: radiusServerSettings.enableAccountingProxy,
      enableAuthProxy: radiusServerSettings.enableAuthProxy,
      wlan: {
        macAddressAuthenticationConfiguration: {
          macAuthMacFormat: radiusServerSettings.macAuthMacFormat
        }
      }
    }

    radiusServerProfiles.data.forEach(profile => {
      const { id, type } = profile
      const radius = covertAAAViewModalTypeToRadius(profile)

      if (type === 'ACCOUNTING') {
        resolvedResult.accountingRadiusId = id
        resolvedResult.accountingRadius = radius
      } else if (type === 'AUTHENTICATION') {
        resolvedResult.authRadiusId = id
        resolvedResult.authRadius = radius
      }
    })

    setRadiusServerConfigurations(resolvedResult)
  }, [radiusServerProfiles, radiusServerSettings])


  // eslint-disable-next-line max-len
  const updateProfile = async (saveData: NetworkSaveData, oldSaveData?: NetworkSaveData | null, networkId?: string) => {
    if (!enableServicePolicyRbac || !networkId) return Promise.resolve()

    const mutations: Promise<CommonResult>[] = []

    // eslint-disable-next-line max-len
    const radiusServerIdKeys: Extract<keyof NetworkSaveData, 'authRadiusId' | 'accountingRadiusId'>[] = ['authRadiusId', 'accountingRadiusId']
    radiusServerIdKeys.forEach(radiusKey => {
      const radiusValue = saveData[radiusKey]
      const oldRadiusValue = oldSaveData?.[radiusKey]

      if ((radiusValue ?? '') !== (oldRadiusValue ?? '')) {
        const mutationTrigger = radiusValue ? activateRadiusServer : deactivateRadiusServer
        mutations.push(mutationTrigger({
          params: { networkId, radiusId: radiusValue ?? oldRadiusValue as string }
        }).unwrap())
      }
    })

    return await Promise.all(mutations)
  }

  const updateSettings = async (saveData: NetworkSaveData, networkId?: string) => {
    if (!enableServicePolicyRbac || !networkId) return Promise.resolve()

    return await updateRadiusServerSettings({
      params: { networkId },
      payload: {
        enableAccountingProxy: saveData.enableAccountingProxy,
        enableAuthProxy: saveData.enableAuthProxy,
        macAuthMacFormat: saveData.wlan?.macAddressAuthenticationConfiguration?.macAuthMacFormat
      }
    }).unwrap()
  }

  // eslint-disable-next-line max-len
  const updateRadiusServer = async (saveData: NetworkSaveData, oldSaveData?: NetworkSaveData | null, networkId?: string) => {
    return Promise.all([
      updateProfile(saveData, oldSaveData, networkId),
      updateSettings(saveData, networkId)
    ])
  }

  return {
    updateRadiusServer,
    radiusServerConfigurations
  }
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
      const activation = _.find(item.activations, { wifiNetworkId: networkId })
      if (activation) {
        venueClientIsolationMap.set(activation.venueId, item.id)
      }
    })
    const venueData = saveState?.venues?.map(v => ({ ...v,
      clientIsolationAllowlistId: venueClientIsolationMap.get(v.venueId!) }))
    const fullNetworkSaveData = { ...saveState, venues: venueData }
    const resolvedNetworkSaveData = deriveFieldsFromServerData(fullNetworkSaveData)

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
        (!_.some(oldSaveData?.venues, { id: v.id }) ||
          _.some(oldSaveData?.venues, ov => ov.id === v.id
            && ov.clientIsolationAllowlistId !== v.clientIsolationAllowlistId)
        )
    )

    const unbindData = _.filter(oldSaveData?.venues, ov =>
      ov.clientIsolationAllowlistId != null &&
        _.some(saveData?.venues, v => v.id === ov.id && !v.clientIsolationAllowlistId)
    )

    const bindMutations = createMutationPromises(bindData, bindClientIsolation)
    const unbindMutations = createMutationPromises(unbindData, unbindClientIsolation)

    await Promise.all([...bindMutations, ...unbindMutations])
  }

  return { updateClientIsolationActivations }
}

export function useVlanPool () {
  const isPolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const { networkId } = useParams()
  const [activate] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useActivateVlanPoolMutation,
    useTemplateMutationFn: useActivateVlanPoolTemplateOnWifiNetworkMutation
  })

  const [deactivate] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useDeactivateVlanPoolMutation,
    useTemplateMutationFn: useDeactivateVlanPoolTemplateOnWifiNetworkMutation
  })


  const { vlanPoolId } = useGetVLANPoolPolicyViewModelListQuery({
    payload: {
      fields: ['name', 'id'],
      filters: { wifiNetworkIds: [networkId] },
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 10000
    },
    enableRbac: isPolicyRbacEnabled
  }, {
    skip: !isPolicyRbacEnabled || !networkId,
    selectFromResult: ({ data }) => ({ vlanPoolId: data?.data[0]?.id })
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
    if (vlanPool && originalPoolId !== vlanPool.id) await activateVlanPool(vlanPool, networkId, vlanPool.id)
  }

  return {
    vlanPoolId,
    updateVlanPoolActivation
  }
}
