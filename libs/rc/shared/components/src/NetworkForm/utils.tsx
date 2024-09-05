/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import { FormInstance }            from 'antd'
import _, { cloneDeep, findIndex } from 'lodash'
import { Params }                  from 'react-router-dom'

import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import {
  ActionItem,
  comparePayload,
  ComparisonObjectType,
  UpdateActionItem,
  useActivateL2AclOnWifiNetworkMutation,
  useDeactivateL2AclOnWifiNetworkMutation,
  useActivateRadiusServerMutation,
  useActivateVlanPoolMutation,
  useBindClientIsolationMutation,
  useActivateWifiCallingServiceMutation,
  useDeactivateRadiusServerMutation,
  useDeactivateVlanPoolMutation,
  useDeactivateWifiCallingServiceMutation,
  useGetAAAPolicyViewModelListQuery,
  useGetEnhancedClientIsolationListQuery,
  useGetEnhancedWifiCallingServiceListQuery,
  useGetRadiusServerSettingsQuery,
  useGetTunnelProfileViewDataListQuery,
  useGetVLANPoolPolicyViewModelListQuery,
  useActivateVlanPoolTemplateOnWifiNetworkMutation,
  useDeactivateVlanPoolTemplateOnWifiNetworkMutation,
  useUnbindClientIsolationMutation,
  useUpdateRadiusServerSettingsMutation,
  WifiActionMapType,
  useActivateL3AclOnWifiNetworkMutation,
  useDeactivateL3AclOnWifiNetworkMutation,
  useActivateDeviceOnWifiNetworkMutation,
  useDeactivateDeviceOnWifiNetworkMutation,
  useActivateApplicationPolicyOnWifiNetworkMutation,
  useDeactivateApplicationPolicyOnWifiNetworkMutation,
  useActivateAccessControlProfileOnWifiNetworkMutation,
  useDeactivateAccessControlProfileOnWifiNetworkMutation,
  useDeactivateRadiusServerTemplateMutation,
  useActivateRadiusServerTemplateMutation,
  useUpdateRadiusServerTemplateSettingsMutation,
  useGetRadiusServerTemplateSettingsQuery,
  useGetAAAPolicyTemplateListQuery,
  useActivateWifiCallingServiceTemplateMutation,
  useDeactivateWifiCallingServiceTemplateMutation,
  useGetEnhancedWifiCallingServiceTemplateListQuery,
  useActivateL2AclTemplateOnWifiNetworkMutation,
  useDeactivateL2AclTemplateOnWifiNetworkMutation,
  useActivateL3AclTemplateOnWifiNetworkMutation,
  useDeactivateL3AclTemplateOnWifiNetworkMutation,
  useDeactivateAccessControlProfileTemplateOnWifiNetworkMutation,
  useActivateAccessControlProfileTemplateOnWifiNetworkMutation,
  useDeactivateDeviceTemplateOnWifiNetworkMutation,
  useActivateDeviceTemplateOnWifiNetworkMutation,
  useDeactivateApplicationPolicyTemplateOnWifiNetworkMutation,
  useActivateApplicationPolicyTemplateOnWifiNetworkMutation,
  useGetEnhancedVlanPoolPolicyTemplateListQuery
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
  NetworkVenue,
  useConfigTemplateQueryFnSwitcher,
  NetworkRadiusSettings,
  EdgeMvSdLanViewData,
  NetworkTunnelSdLanAction,
  VLANPoolViewModelType
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { useIsConfigTemplateEnabledByType }               from '../configTemplates'
import { useEdgeMvSdLanActions }                          from '../EdgeSdLan/useEdgeSdLanActions'
import { NetworkTunnelActionModalProps }                  from '../NetworkTunnelActionModal'
import { NetworkTunnelActionForm, NetworkTunnelTypeEnum } from '../NetworkTunnelActionModal/types'
import { getNetworkTunnelType }                           from '../NetworkTunnelActionModal/utils'
import { useLazyGetAAAPolicyInstance }                    from '../policies/AAAForm/aaaPolicyQuerySwitcher'
import { useIsEdgeReady }                                 from '../useEdgeActions'

export const TMP_NETWORK_ID = 'tmpNetworkId'
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

// eslint-disable-next-line max-len
export function deriveRadiusFieldsFromServerData (data: NetworkSaveData): NetworkSaveData {
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
          }
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


  // eslint-disable-next-line max-len
  const updateProfile = async (saveData: NetworkSaveData, networkId?: string) => {
    if (!resolvedRbacEnabled || !networkId) return Promise.resolve()

    const mutations: Promise<CommonResult>[] = []

    // eslint-disable-next-line max-len
    const radiusServerIdKeys: Extract<keyof NetworkSaveData, 'authRadiusId' | 'accountingRadiusId'>[] = ['authRadiusId', 'accountingRadiusId']
    radiusServerIdKeys.forEach(radiusKey => {
      const radiusValue = saveData[radiusKey]
      const oldRadiusValue = radiusServerConfigurations?.[radiusKey]

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
    if (!resolvedRbacEnabled || !networkId) return Promise.resolve()

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
  const updateRadiusServer = async (saveData: NetworkSaveData, networkId?: string) => {
    return Promise.all([
      updateProfile(saveData, networkId),
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

function useVlanPoolId (networkId: string | undefined): string | undefined {
  const { isTemplate } = useConfigTemplate()
  const isPolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)

  const transformVlanPoolData = ({ data }: { data?: { data: VLANPoolViewModelType[] } }) => {
    return { vlanPoolId: data?.data[0]?.id }
  }

  const vlanPoolPayload = {
    fields: ['name', 'id'],
    filters: { wifiNetworkIds: [networkId] },
    sortField: 'name',
    sortOrder: 'ASC',
    page: 1,
    pageSize: 10000
  }

  const vlanPool: { vlanPoolId?: string } = useGetVLANPoolPolicyViewModelListQuery({
    payload: vlanPoolPayload,
    enableRbac: true
  }, {
    skip: isTemplate || !isPolicyRbacEnabled || !networkId,
    selectFromResult: transformVlanPoolData
  })

  const vlanPoolTemplate: { vlanPoolId?: string } = useGetEnhancedVlanPoolPolicyTemplateListQuery({
    payload: vlanPoolPayload,
    enableRbac: true
  }, {
    skip: !isTemplate || !enableTemplateRbac || !networkId,
    selectFromResult: transformVlanPoolData
  })

  return isTemplate ? vlanPoolTemplate.vlanPoolId : vlanPool.vlanPoolId
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

  const vlanPoolId = useVlanPoolId(networkId)

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
  const { networkId } = useParams()

  const accessControlWifiActionMap = {
    l2AclPolicyId: {
      added: (params: Params<string>) => {
        return activateL2Acl({ params, enableRbac: enableServicePolicyRbac }).unwrap()
      },
      removed: (params: Params<string>) => {
        return deactivateL2Acl({ params, enableRbac: enableServicePolicyRbac }).unwrap()
      },
      updated: (oldParams: Params<string>, params: Params<string>) => {
        return [
          deactivateL2Acl({ params: oldParams, enableRbac: enableServicePolicyRbac }).unwrap(),
          activateL2Acl({ params, enableRbac: enableServicePolicyRbac }).unwrap()
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
      updated: (oldParams: Params<string>, params: Params<string>) => {
        return [
          deactivateL3Acl({ params: oldParams, enableRbac: enableServicePolicyRbac }).unwrap(),
          activateL3Acl({ params, enableRbac: enableServicePolicyRbac }).unwrap()
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
      updated: (oldParams: Params<string>, params: Params<string>) => {
        return [
          deactivateDevice({ params: oldParams, enableRbac: enableServicePolicyRbac }).unwrap(),
          activateDevice({ params, enableRbac: enableServicePolicyRbac }).unwrap()
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
      updated: (oldParams: Params<string>, params: Params<string>) => {
        return [
          activateApplication({ params: oldParams, enableRbac: enableServicePolicyRbac }).unwrap(),
          deactivateApplication({ params, enableRbac: enableServicePolicyRbac }).unwrap()
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
      updated: (oldParams: Params<string>, params: Params<string>) => {
        return [
          // eslint-disable-next-line max-len
          activateAccessControl({ params: oldParams, enableRbac: enableServicePolicyRbac }).unwrap(),
          deactivateAccessControl({ params, enableRbac: enableServicePolicyRbac }).unwrap()
        ]
      }
    }
  }

  const filterForAccessControlComparison = (data: NetworkSaveData) => {
    let object = {} as Record<string, unknown>
    if (data.wlan?.advancedCustomization?.hasOwnProperty('l2AclPolicyId')
      && data.wlan?.advancedCustomization.l2AclEnable) {
      object['l2AclPolicyId'] = data.wlan.advancedCustomization.l2AclPolicyId
    }

    if (data.wlan?.advancedCustomization?.hasOwnProperty('l3AclPolicyId')
      && data.wlan?.advancedCustomization.l3AclEnable) {
      object['l3AclPolicyId'] = data.wlan.advancedCustomization.l3AclPolicyId
    }

    if (data.wlan?.advancedCustomization?.hasOwnProperty('devicePolicyId')
      && data.enableDeviceOs) {
      object['devicePolicyId'] = data.wlan.advancedCustomization.devicePolicyId
    }

    if (data.wlan?.advancedCustomization?.hasOwnProperty('applicationPolicyId')
      && data.wlan?.advancedCustomization?.applicationPolicyEnable) {
      object['applicationPolicyId'] = data.wlan.advancedCustomization.applicationPolicyId
    }

    if (data.wlan?.advancedCustomization?.hasOwnProperty('accessControlProfileId')
      && data.wlan?.advancedCustomization.accessControlEnable) {
      // eslint-disable-next-line max-len
      object['accessControlProfileId'] = data.wlan.advancedCustomization.accessControlProfileId
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
      ...addActions,
      ...removeActions,
      ...updateActions
    ])
  }

  const updateAccessControl = async (formData: NetworkSaveData, data?: NetworkSaveData | null) => {
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

export const useUpdateEdgeSdLanActivations = () => {
  const { toggleNetwork } = useEdgeMvSdLanActions()

  // eslint-disable-next-line max-len
  const updateEdgeSdLanActivations = async (networkId: string, updates: NetworkTunnelSdLanAction[], activatedVenues: NetworkVenue[]) => {
    const actions = updates.filter(item => {
      return _.find(activatedVenues, { venueId: item.venueId })
    }).map((actInfo) => {
      // eslint-disable-next-line max-len
      return toggleNetwork(actInfo.serviceId, actInfo.venueId, networkId, actInfo.enabled, actInfo.enabled && actInfo.guestEnabled)
    })

    return await Promise.all(actions)
  }

  return updateEdgeSdLanActivations
}

export const getNetworkTunnelSdLanUpdateData = (
  modalFormValues: NetworkTunnelActionForm,
  sdLanAssociationUpdates: NetworkTunnelSdLanAction[],
  tunnelModalProps: NetworkTunnelActionModalProps,
  venueSdLanInfo: EdgeMvSdLanViewData
) => {
  // networkId is undefined in Add mode.
  const networkId = tunnelModalProps.network?.id ?? TMP_NETWORK_ID
  const networkVenueId = tunnelModalProps.network?.venueId

  const formTunnelType = modalFormValues.tunnelType
  const sdLanTunneled = formTunnelType === NetworkTunnelTypeEnum.SdLan
  const sdLanTunnelGuest = modalFormValues.sdLan?.isGuestTunnelEnabled

  const tunnelTypeInitVal = getNetworkTunnelType(tunnelModalProps.network, venueSdLanInfo)
  const isFwdGuest = sdLanTunneled ? sdLanTunnelGuest : false
  let isNeedUpdate: boolean = false

  // activate/deactivate SDLAN tunneling
  if (formTunnelType !== tunnelTypeInitVal) {
    // activate/deactivate network
    isNeedUpdate = true
  } else {
  // tunnelType still SDLAN
    if (tunnelTypeInitVal === NetworkTunnelTypeEnum.SdLan) {
      const isGuestTunnelEnabledInitState = !!venueSdLanInfo?.isGuestTunnelEnabled
      && Boolean(venueSdLanInfo?.tunneledGuestWlans?.find(wlan =>
        wlan.networkId === networkId && wlan.venueId === networkVenueId))

      // check if tunnel guest changed
      if(isGuestTunnelEnabledInitState !== sdLanTunnelGuest) {

        // activate/deactivate network
        isNeedUpdate = true
      }
    }
  }

  if (!isNeedUpdate)
    return

  const updateContent = cloneDeep(sdLanAssociationUpdates as NetworkTunnelSdLanAction[]) ?? []

  // eslint-disable-next-line max-len
  const existDataIdx = findIndex(updateContent, { serviceId: venueSdLanInfo?.id, venueId: networkVenueId })

  if (existDataIdx !== -1) {
    updateContent[existDataIdx].guestEnabled = isFwdGuest
    updateContent[existDataIdx].enabled = sdLanTunneled
  } else {
    updateContent.push({
      serviceId: venueSdLanInfo?.id!,
      venueId: networkVenueId,
      guestEnabled: isFwdGuest,
      networkId: networkId,
      enabled: sdLanTunneled,
      venueSdLanInfo
    } as NetworkTunnelSdLanAction)
  }

  return updateContent
}
