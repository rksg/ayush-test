import { isEqual, pick } from 'lodash'

import {
  useActivateEcTenantInSdLanMutation,
  useActivateEdgeMvSdLanNetworkMutation,
  useActivateSdLanNetworkTemplateMutation,
  useAddEdgeMvSdLanMutation,
  useApplyConfigTemplateSkipRecRewriteMutation,
  useDeactivateEcTenantInSdLanMutation,
  useDeactivateEdgeMvSdLanNetworkMutation,
  useDeactivateSdLanNetworkTemplateMutation,
  useLazyGetConfigTemplateListSkipRecRewriteQuery,
  useUpdateEdgeMvSdLanPartialMutation
} from '@acx-ui/rc/services'
import { CommonErrorsResult, EdgeSdLanServiceProfile } from '@acx-ui/rc/utils'
import { CommonResult }                                from '@acx-ui/user'
import { CatchErrorDetails }                           from '@acx-ui/utils'

export const useEdgeSdLanActions = () => {
  const [addEdgeSdLan] = useAddEdgeMvSdLanMutation()
  const [updateEdgeSdLanMutation] = useUpdateEdgeMvSdLanPartialMutation()
  const [activateNetwork] = useActivateEdgeMvSdLanNetworkMutation()
  const [deactivateNetwork] = useDeactivateEdgeMvSdLanNetworkMutation()
  const [activateNetworkTemplate] = useActivateSdLanNetworkTemplateMutation()
  const [deactivateNetworkTemplate] = useDeactivateSdLanNetworkTemplateMutation()
  const [activateEcTenantInSdLan] = useActivateEcTenantInSdLanMutation()
  const [deactivateEcTenantInSdLan] = useDeactivateEcTenantInSdLanMutation()
  const [getConfigTemplateList] = useLazyGetConfigTemplateListSkipRecRewriteQuery()
  const [applyConfigTemplate] = useApplyConfigTemplateSkipRecRewriteMutation()

  const diffVenueNetworks = (
    currentData: EdgeSdLanServiceProfile['activeNetwork'],
    originData?: EdgeSdLanServiceProfile['activeNetwork']
  ) => {
    const deactivateList = originData?.filter(origin =>
      !currentData.some(current =>
        origin.venueId === current.venueId &&
        current.networkId === origin.networkId
      )
    )
    const activateList = currentData.filter(current =>
      !originData?.some(origin =>
        origin.venueId === current.venueId &&
        origin.networkId === current.networkId &&
        origin.tunnelProfileId === current.tunnelProfileId
      )
    )

    return {
      deactivateList,
      activateList
    }
  }

  const toggleNetworkChange = async (
    serviceId: string,
    venueId: string,
    networkId: string,
    currentTunnelProfileId: string | undefined,
    originTunnelProfileId: string | undefined,
    cb?: () => void
  ) => {
    const isChangeTunneling = currentTunnelProfileId !== originTunnelProfileId
    if (!isChangeTunneling) {
      return
    }
    if (originTunnelProfileId !== undefined && originTunnelProfileId !== null) {
      deactivateNetwork({
        customHeaders: {
          'Content-Type': 'application/vnd.ruckus.v1.1+json'
        },
        params: {
          serviceId,
          venueId: venueId,
          wifiNetworkId: networkId
        },
        callback: cb
      }).unwrap()
    }
    if (currentTunnelProfileId !== undefined && currentTunnelProfileId !== null) {
      activateNetwork({
        customHeaders: {
          'Content-Type': 'application/vnd.ruckus.v1.1+json'
        },
        params: {
          serviceId,
          venueId: venueId,
          wifiNetworkId: networkId
        },
        payload: {
          ...(currentTunnelProfileId ? {
            forwardingTunnelProfileId: currentTunnelProfileId
          } : {})
        },
        callback: cb
      }).unwrap()
    }
  }

  const handleNetworkChanges = async (
    serviceId: string,
    // eslint-disable-next-line max-len
    currentData: EdgeSdLanServiceProfile['activeNetwork'] | EdgeSdLanServiceProfile['activeNetworkTemplate'] | undefined,
    // eslint-disable-next-line max-len
    originData?: EdgeSdLanServiceProfile['activeNetwork'] | EdgeSdLanServiceProfile['activeNetworkTemplate'],
    isTemplate = false
  ) => {
    const actions = []
    const {
      deactivateList = [],
      activateList = []
    } = diffVenueNetworks(currentData ?? [], originData)
    if (deactivateList.length > 0) {
      const deactivateFn = isTemplate ? deactivateNetworkTemplate : deactivateNetwork
      actions.push(...deactivateList.map(network => deactivateFn({
        customHeaders: {
          'Content-Type': 'application/vnd.ruckus.v1.1+json'
        },
        params: {
          serviceId,
          venueId: network.venueId,
          wifiNetworkId: network.networkId
        }
      }).unwrap()))
    }

    if (activateList.length > 0) {
      // eslint-disable-next-line max-len
      actions.push(...activateList.map(network => (isTemplate? activateNetworkTemplate : activateNetwork)({
        customHeaders: {
          'Content-Type': 'application/vnd.ruckus.v1.1+json'
        },
        params: {
          serviceId,
          venueId: network.venueId,
          wifiNetworkId: network.networkId
        },
        payload: {
          ...(network.tunnelProfileId ? {
            forwardingTunnelProfileId: network.tunnelProfileId
          } : {})
        }
      }).unwrap()))
    }
    return Promise.all(actions)
  }

  const handleCustomerChanges = async (
    serviceId: string,
    customerTenantIds?: string[],
    originCustomerTenantIds?: string[]
  ) => {
    const actions = []
    const activateList = customerTenantIds?.filter(tenantId =>
      !originCustomerTenantIds?.includes(tenantId)) ?? []
    const deactivateList = originCustomerTenantIds?.filter(tenantId =>
      !customerTenantIds?.includes(tenantId)) ?? []

    if(activateList.length > 0) {
      actions.push(...activateList.map(tenantId => activateEcTenantInSdLan({
        params: {
          serviceId,
          tenantId
        }
      }).unwrap()))
    }
    if(deactivateList.length > 0) {
      actions.push(...deactivateList.map(tenantId => deactivateEcTenantInSdLan({
        params: {
          serviceId,
          tenantId
        }
      }).unwrap()))
    }
    return Promise.all(actions)
  }

  const applyVenueTemplateIfNotApplied = async (
    venueTemplateIds?: string[],
    customerTenantIds?: string[]
  ) => {
    const venueTemplates = await getConfigTemplateList({
      payload: {
        page: 1,
        pageSize: 10000,
        filters: { id: venueTemplateIds }
      }
    }).unwrap()
    const actions: Promise<CommonResult>[] = []
    venueTemplates.data?.forEach(template => {
      customerTenantIds?.forEach(tenantId => {
        if(!template.appliedOnTenants?.includes(tenantId)) {
          actions.push(applyConfigTemplate({
            params: { templateId: template.id, tenantId },
            payload: { overrides: [] },
            enableRbac: true
          }).unwrap())
        }
      })
    })

    await Promise.all(actions)
  }

  const applyNetworkTemplateIfNotApplied = async (
    networkTemplateIds?: string[],
    customerTenantIds?: string[]
  ) => {
    const networkTemplates = await getConfigTemplateList({
      payload: {
        pageSize: 10000,
        filters: { id: networkTemplateIds }
      }
    }).unwrap()
    const actions: Promise<CommonResult>[] = []
    networkTemplates.data?.forEach(template => {
      customerTenantIds?.forEach(tenantId => {
        if(!template.appliedOnTenants?.includes(tenantId)) {
          actions.push(applyConfigTemplate({
            params: { templateId: template.id, tenantId },
            payload: { overrides: [] },
            enableRbac: true
          }).unwrap())
        }
      })
    })

    await Promise.all(actions)
  }

  const createEdgeSdLan = async (
    req: {
      payload: EdgeSdLanServiceProfile,
      callback?: (res: (CommonResult[] | CommonErrorsResult<CatchErrorDetails>)) => void
    },
    isMsp: boolean
  ) => {
    const { payload, callback } = req
    return await addEdgeSdLan({
      customHeaders: {
        'Content-Type': 'application/vnd.ruckus.v1.1+json'
      },
      payload: pick(
        payload,
        isMsp ?
          ['name', 'tunnelProfileId', 'tunnelTemplateId'] :
          ['name', 'tunnelProfileId']
      ),
      callback: async (response: CommonResult) => {
        const serviceId = response.response?.id
        if (!serviceId) {
          // eslint-disable-next-line no-console
          console.error('empty service id')
          callback?.([])
          return
        }

        try {
          const reqResults = await handleNetworkChanges(serviceId, payload.activeNetwork)
          if (isMsp){
            const venueTemplateIds = payload.activeNetworkTemplate?.map(item => item.venueId)
            const networkTemplateIds = payload.activeNetworkTemplate?.map(item => item.networkId)
            await applyVenueTemplateIfNotApplied(venueTemplateIds, payload.customerTenantIds)
            await applyNetworkTemplateIfNotApplied(networkTemplateIds, payload.customerTenantIds)
            await handleNetworkChanges(serviceId, payload.activeNetworkTemplate, undefined, true)
            await handleCustomerChanges(serviceId, payload.customerTenantIds)
          }
          callback?.(reqResults)
        } catch(error) {
          callback?.(error as CommonErrorsResult<CatchErrorDetails>)
        }
      }
    }).unwrap()
  }

  const updateEdgeSdLan = async (
    originData: EdgeSdLanServiceProfile,
    req: {
      payload: EdgeSdLanServiceProfile,
      callback?: (res: (CommonResult[]
        | CommonErrorsResult<CatchErrorDetails>)) => void
    },
    isMsp: boolean
  ) => {
    const { payload, callback } = req
    const actions = []
    const needUpdateSdLan = !isEqual(
      pick(originData, ['name']),
      pick(payload, ['name']))

    if(needUpdateSdLan && originData.id) {
      actions.push(updateEdgeSdLanMutation({
        customHeaders: {
          'Content-Type': 'application/vnd.ruckus.v1.1+json'
        },
        params: { serviceId: originData.id },
        payload: pick(payload, ['name'])
      }).unwrap())
    }

    try {
      const networkResults = await handleNetworkChanges(
        originData.id || '',
        payload.activeNetwork,
        originData.activeNetwork
      )

      if (isMsp) {
        const venueTemplateIds = payload.activeNetworkTemplate?.map(item => item.venueId)
        const networkTemplateIds = payload.activeNetworkTemplate?.map(item => item.networkId)
        await applyVenueTemplateIfNotApplied(venueTemplateIds, payload.customerTenantIds)
        await applyNetworkTemplateIfNotApplied(networkTemplateIds, payload.customerTenantIds)
        await handleNetworkChanges(
          originData.id || '',
          payload.activeNetworkTemplate,
          originData.activeNetworkTemplate,
          isMsp
        )
        await handleCustomerChanges(
          originData.id || '',
          payload.customerTenantIds,
          originData.customerTenantIds
        )
      }

      const reqResults = await Promise.all([...actions, networkResults])
      callback?.(reqResults.flat())
    } catch(error) {
      callback?.(error as CommonErrorsResult<CatchErrorDetails>)
    }
  }

  const activateSdLanForNetwork = async (
    serviceId: string,
    venueId: string,
    networkId: string,
    tunnelProfileId: string,
    callback?: () => void
  ) => {
    await activateNetwork({
      customHeaders: {
        'Content-Type': 'application/vnd.ruckus.v1.1+json'
      },
      params: {
        serviceId,
        venueId,
        wifiNetworkId: networkId
      },
      payload: {
        forwardingTunnelProfileId: tunnelProfileId
      },
      callback
    }).unwrap()
  }

  const removeSdLanFromNetwork = async (
    serviceId: string,
    venueId: string,
    networkId: string,
    callback?: () => void
  ) => {
    await deactivateNetwork({
      customHeaders: {
        'Content-Type': 'application/vnd.ruckus.v1.1+json'
      },
      params: {
        serviceId,
        venueId,
        wifiNetworkId: networkId
      },
      callback
    }).unwrap()
  }

  return {
    createEdgeSdLan,
    updateEdgeSdLan,
    toggleNetworkChange,
    activateSdLanForNetwork,
    removeSdLanFromNetwork
  }
}