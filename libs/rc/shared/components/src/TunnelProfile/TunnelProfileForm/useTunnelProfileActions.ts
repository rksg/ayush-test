import { cloneDeep, isNil } from 'lodash'

import { Features }                                                                                                                                                       from '@acx-ui/feature-toggle'
import { useActivateTunnelProfileByEdgeClusterMutation, useCreateTunnelProfileMutation, useDeactivateTunnelProfileByEdgeClusterMutation, useUpdateTunnelProfileMutation } from '@acx-ui/rc/services'
import { AgeTimeUnit, CommonErrorsResult, CommonResult, MtuRequestTimeoutUnit, MtuTypeEnum, TunnelProfileFormType, TunnelTypeEnum }                                       from '@acx-ui/rc/utils'
import { CatchErrorDetails }                                                                                                                                              from '@acx-ui/utils'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'

export const useTunnelProfileActions = () => {
  const isEdgeVxLanKaReady = useIsEdgeFeatureReady(Features.EDGE_VXLAN_TUNNEL_KA_TOGGLE)
  const isEdgeL2greReady = useIsEdgeFeatureReady(Features.EDGE_L2GRE_TOGGLE)
  // eslint-disable-next-line max-len
  const [createTunnelProfile, { isLoading: isTunnelProfileCreating }] = useCreateTunnelProfileMutation()
  // eslint-disable-next-line max-len
  const [updateTunnelProfile, { isLoading: isTunnelProfileUpdating }] = useUpdateTunnelProfileMutation()
  const [activateByEdgeCluster] = useActivateTunnelProfileByEdgeClusterMutation()
  const [deactivateByEdgeCluster] = useDeactivateTunnelProfileByEdgeClusterMutation()
  const requestPreProcess = (data: TunnelProfileFormType) => {
    const result = cloneDeep(data)
    if (data.ageTimeUnit === AgeTimeUnit.WEEK) {
      result.ageTimeMinutes = data.ageTimeMinutes * 7 * 24 * 60
    } else if (data.ageTimeUnit === AgeTimeUnit.DAYS) {
      result.ageTimeMinutes = data.ageTimeMinutes * 24 * 60
    }


    if (isEdgeVxLanKaReady) {
      if (data.mtuRequestTimeoutUnit === MtuRequestTimeoutUnit.SECONDS
          && !!data.mtuRequestTimeout) {
        result.mtuRequestTimeout = data.mtuRequestTimeout * 1000
      }

      if (data.mtuType === MtuTypeEnum.MANUAL) {
        delete result.mtuRequestRetry
        delete result.mtuRequestTimeout
      }

      delete result.mtuRequestTimeoutUnit
    } else {
      delete result.keepAliveInterval
      delete result.keepAliveRetry
      delete result.mtuRequestRetry
      delete result.mtuRequestTimeout
      delete result.mtuRequestTimeoutUnit
    }

    if (data.mtuType === MtuTypeEnum.AUTO) {
      delete result.mtuSize
    }

    if (isEdgeL2greReady) {
      if(data.tunnelType === TunnelTypeEnum.L2GRE) {
        data.mtuType = MtuTypeEnum.MANUAL
        data.natTraversalEnabled = false
        delete result.mtuRequestRetry
        delete result.mtuRequestTimeout
        delete result.mtuRequestTimeoutUnit
        delete result.keepAliveInterval
        delete result.keepAliveRetry
      } else {
        delete result.destinationIpAddress
      }
    }

    delete result.ageTimeUnit
    //remove for acitvate api params
    delete result.edgeClusterId
    delete result.venueId
    // remove UI used data
    delete result.disabledFields
    return result
  }

  const createTunnelProfileOperation = async (data: TunnelProfileFormType) => {
    try {
      await new Promise(async (resolve, reject) => {
        await handleCreateTunnelProfile({
          data,
          callback: (result) => {
            // callback is after all RBAC related APIs sent
            if (
              isNil(result) ||
            (result as CommonErrorsResult<CatchErrorDetails>)?.data?.errors.length > 0)
            {
              reject(result)
            } else {
              resolve(true)
            }
          }
        // need to catch basic service profile failed
        }).catch(reject)

      })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  const handleCreateTunnelProfile = async (req: {
    data: TunnelProfileFormType,
    callback?: (res: (CommonResult
      | CommonErrorsResult<CatchErrorDetails> | void)) => void
  }) => {
    const { data, callback } = req
    const venueId = data.venueId
    const clusterId = data.edgeClusterId
    const payload = requestPreProcess(data)
    return await createTunnelProfile({
      payload,
      callback: async (addResponse: CommonResult) => {
        const tunnelProfileId = addResponse.response?.id
        if (!tunnelProfileId) {
          // eslint-disable-next-line no-console
          console.error('empty tunnel profile id')
          callback?.()
          return
        }

        if(!isEdgeL2greReady || data?.tunnelType === TunnelTypeEnum.L2GRE) {
          callback?.()
          return
        }

        try {
          // eslint-disable-next-line max-len
          const reqResult = await associationWithEdgeCluster(venueId, clusterId, tunnelProfileId)
          callback?.(reqResult)
        } catch(error) {
          callback?.(error as CommonErrorsResult<CatchErrorDetails>)
        }
      }
    }).unwrap()
  }

  const updateTunnelProfileOperation = async (id:string, data: TunnelProfileFormType) => {
    try {
      await new Promise(async (resolve, reject) => {
        await handleUpdateTunnelProfile({
          id,
          data,
          callback: (result) => {
            // callback is after all RBAC related APIs sent
            if (Array.isArray(result)) {
              resolve(true)
            } else {
              reject(result)
            }
          }
        // need to catch basic service profile failed
        }).catch(reject)
      })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  const handleUpdateTunnelProfile = async (req: {
    id: string
    data: TunnelProfileFormType,
    callback?: (res: (CommonResult
      | CommonErrorsResult<CatchErrorDetails> | void)) => void
  }) => {
    const { id, data, callback } = req
    const pathParams = { id }
    const venueId = data.venueId
    const clusterId = data.edgeClusterId
    const payload = requestPreProcess(data)
    return await updateTunnelProfile({
      params: pathParams,
      payload,
      callback: async () => {
        const tunnelProfileId = id
        if(!isEdgeL2greReady || data?.tunnelType === TunnelTypeEnum.L2GRE) {
          if(clusterId && venueId) {
            try {
              // eslint-disable-next-line max-len
              const reqResult = await deassociationWithEdgeCluster(venueId, clusterId, tunnelProfileId)
              callback?.(reqResult)
            } catch(error) {
              callback?.(error as CommonErrorsResult<CatchErrorDetails>)
            }
            return
          } else {
            callback?.()
            return
          }
        }
        try {
          // eslint-disable-next-line max-len
          const reqResult = await associationWithEdgeCluster(venueId, clusterId, tunnelProfileId)
          callback?.(reqResult)
        } catch(error) {
          callback?.(error as CommonErrorsResult<CatchErrorDetails>)
        }
      }
    }).unwrap()
  }

  const associationWithEdgeCluster = async (
    venueId?: string,
    clusterId?: string,
    tunnelProfileId?: string
  ): Promise<CommonResult | CommonErrorsResult<CatchErrorDetails>> => {
    try {
      const response = await activateByEdgeCluster({
        params: {
          venueId: venueId,
          clusterId: clusterId,
          id: tunnelProfileId
        }
      }).unwrap()
      return response
    } catch (error) {
      return error as CommonErrorsResult<CatchErrorDetails>
    }
  }

  const deassociationWithEdgeCluster = async (
    venueId?: string,
    clusterId?: string,
    tunnelProfileId?: string
  ): Promise<CommonResult | CommonErrorsResult<CatchErrorDetails>> => {
    try {
      const response = await deactivateByEdgeCluster({
        params: {
          venueId: venueId,
          clusterId: clusterId,
          id: tunnelProfileId
        }
      }).unwrap()
      return response
    } catch (error) {
      return error as CommonErrorsResult<CatchErrorDetails>
    }
  }

  return {
    createTunnelProfileOperation,
    updateTunnelProfileOperation,
    isTunnelProfileCreating,
    isTunnelProfileUpdating
  }
}