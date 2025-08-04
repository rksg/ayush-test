import { cloneDeep, isEqual, omit } from 'lodash'

import { Features }                        from '@acx-ui/feature-toggle'
import {
  useActivateTunnelProfileByEdgeClusterMutation, useActivateTunnelProfileByIpsecProfileMutation,
  useCreateTunnelProfileMutation,
  useCreateTunnelProfileTemplateMutation,
  useDeactivateTunnelProfileByEdgeClusterMutation, useDeactivateTunnelProfileByIpsecProfileMutation,
  useUpdateTunnelProfileMutation,
  useUpdateTunnelProfileTemplateMutation
} from '@acx-ui/rc/services'
import {
  AgeTimeUnit,
  CommonErrorsResult,
  CommonResult,
  executeWithCallback,
  MtuRequestTimeoutUnit,
  MtuTypeEnum,
  TunnelProfileFormType,
  TunnelTypeEnum
} from '@acx-ui/rc/utils'
import { CatchErrorDetails } from '@acx-ui/utils'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'

export const nonTunnelProfileConfigKeys = [
  'edgeClusterId', 'venueId',
  'tunnelEncryptionEnabled', 'ipsecProfileId'
]

export const useTunnelProfileActions = () => {
  const isEdgeL2greReady = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)
  const isEdgeIpsecVxLanReady = useIsEdgeFeatureReady(Features.EDGE_IPSEC_VXLAN_TOGGLE)

  // eslint-disable-next-line max-len
  const [createTunnelProfile, { isLoading: isTunnelProfileCreating }] = useCreateTunnelProfileMutation()
  // eslint-disable-next-line max-len
  const [updateTunnelProfile, { isLoading: isTunnelProfileUpdating }] = useUpdateTunnelProfileMutation()
  // eslint-disable-next-line max-len
  const [createTunnelProfileTemplate, { isLoading: isTunnelProfileTemplateCreating }] = useCreateTunnelProfileTemplateMutation()
  // eslint-disable-next-line max-len
  const [updateTunnelProfileTemplate, { isLoading: isTunnelProfileTemplateUpdating }] = useUpdateTunnelProfileTemplateMutation()
  const [activateByEdgeCluster] = useActivateTunnelProfileByEdgeClusterMutation()
  const [deactivateByEdgeCluster] = useDeactivateTunnelProfileByEdgeClusterMutation()
  const [activateByIpsecProfile] = useActivateTunnelProfileByIpsecProfileMutation()
  const [deactivateByIpsecProfile] = useDeactivateTunnelProfileByIpsecProfileMutation()

  const requestPreProcess = (data: TunnelProfileFormType) => {
    const result = cloneDeep(data)
    if (data.ageTimeUnit === AgeTimeUnit.WEEK) {
      result.ageTimeMinutes = data.ageTimeMinutes * 7 * 24 * 60
    } else if (data.ageTimeUnit === AgeTimeUnit.DAYS) {
      result.ageTimeMinutes = data.ageTimeMinutes * 24 * 60
    }

    if (data.mtuRequestTimeoutUnit === MtuRequestTimeoutUnit.SECONDS
          && !!data.mtuRequestTimeout) {
      result.mtuRequestTimeout = data.mtuRequestTimeout * 1000
    }

    if (data.mtuType === MtuTypeEnum.MANUAL) {
      delete result.mtuRequestRetry
      delete result.mtuRequestTimeout
    }

    if (data.mtuType === MtuTypeEnum.AUTO) {
      delete result.mtuSize
    }

    if (isEdgeL2greReady) {
      if(data.tunnelType === TunnelTypeEnum.L2GRE) {
        result.mtuType = MtuTypeEnum.MANUAL
        result.natTraversalEnabled = false
        delete result.mtuRequestRetry
        delete result.mtuRequestTimeout
        delete result.mtuRequestTimeoutUnit
        delete result.keepAliveInterval
        delete result.keepAliveRetry
      } else {
        delete result.destinationIpAddress
      }
    }

    if (isEdgeIpsecVxLanReady) {
      delete result.ipsecProfileId
      delete result.tunnelEncryptionEnabled
    }

    delete result.mtuRequestTimeoutUnit
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
      await executeWithCallback(async (callback) => {
        await handleCreateTunnelProfile({ data, callback })
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
          if(isEdgeIpsecVxLanReady && data.tunnelEncryptionEnabled && data.ipsecProfileId) {
            await associationWithIpsecProfile(tunnelProfileId, data.ipsecProfileId)
          }

          callback?.(reqResult)
        } catch(error) {
          callback?.(error as CommonErrorsResult<CatchErrorDetails>)
        }
      }
    }).unwrap()
  }

  const updateTunnelProfileOperation = async (id:string,
    data: TunnelProfileFormType,
    initData: TunnelProfileFormType) => {
    try {
      const compareResult = compareConfigChanges(data, initData)
      if (compareResult.hasChanges) {
        await handleUpdateTunnelProfile({ id, data })
      }

      handleTunnelProfileEdgeClusterAssociation(id, data, initData)
      handleTunnelProfileIpsecAssociation(id, data, initData)
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  const handleUpdateTunnelProfile = async (req: {
    id: string
    data: TunnelProfileFormType
  }) => {
    const { id, data } = req
    const pathParams = { id }
    const payload = requestPreProcess(data)
    return await updateTunnelProfile({
      params: pathParams,
      payload
    }).unwrap()
  }

  const handleTunnelProfileEdgeClusterAssociation = async (
    id: string,
    data: TunnelProfileFormType,
    initData: TunnelProfileFormType
  ): Promise<void> => {
    const venueId = data.venueId
    const clusterId = data.edgeClusterId
    const tunnelProfileId = id

    if (!isEdgeL2greReady) {
      return
    }

    if (clusterId && venueId && data?.tunnelType === TunnelTypeEnum.L2GRE) {
      try {
        await disassociationWithEdgeCluster(venueId, clusterId, tunnelProfileId)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      }
      return
    }
    if(data.edgeClusterId === initData.edgeClusterId) {
      return
    }
    try {
      await associationWithEdgeCluster(venueId, clusterId, tunnelProfileId)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
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

  const disassociationWithEdgeCluster = async (
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

  const handleTunnelProfileIpsecAssociation = async (
    id: string,
    data: TunnelProfileFormType,
    initData: TunnelProfileFormType
  ) => {
    if(!isEdgeIpsecVxLanReady) {
      return
    }

    const tunnelProfileId = id
    const isIpsecChangedDisable = !data.tunnelEncryptionEnabled && initData.ipsecProfileId

    // tunnel type is change into not VXLAN_GPE, or ipsec is changed to disabled
    if (data?.tunnelType !== TunnelTypeEnum.VXLAN_GPE || isIpsecChangedDisable) {
      await disassociationWithIpsecProfile(tunnelProfileId, initData.ipsecProfileId!)
      return
    }

    const ipsecProfileId = data.ipsecProfileId
    const isIpsecProfileChanged = data.tunnelEncryptionEnabled
     && ipsecProfileId !== initData.ipsecProfileId

    if(!isIpsecProfileChanged) {
      return
    }

    await associationWithIpsecProfile(tunnelProfileId, ipsecProfileId!)
  }

  const associationWithIpsecProfile = async (
    tunnelProfileId: string,
    ipsecProfileId: string
  ): Promise<CommonResult | CommonErrorsResult<CatchErrorDetails>> => {
    try {
      const response = await activateByIpsecProfile({
        params: {
          tunnelServiceProfileId: tunnelProfileId,
          ipsecProfileId: ipsecProfileId
        }
      }).unwrap()
      return response
    } catch (error) {
      return error as CommonErrorsResult<CatchErrorDetails>
    }
  }

  const disassociationWithIpsecProfile = async (
    tunnelProfileId: string,
    ipsecProfileId: string
  ): Promise<CommonResult | CommonErrorsResult<CatchErrorDetails>> => {
    try {
      const response = await deactivateByIpsecProfile({
        params: {
          tunnelServiceProfileId: tunnelProfileId,
          ipsecProfileId: ipsecProfileId
        }
      }).unwrap()
      return response
    } catch (error) {
      return error as CommonErrorsResult<CatchErrorDetails>
    }
  }

  const createTunnelProfileTemplateOperation = async (data: TunnelProfileFormType) => {
    try {
      await executeWithCallback(async (callback) => {
        await handleCreateTunnelProfileTemplate(data, callback)
      })
    } catch(error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  const handleCreateTunnelProfileTemplate = async (
    data: TunnelProfileFormType,
    callback?: (res: (CommonResult | CommonErrorsResult<CatchErrorDetails> | void)) => void
  ) => {
    const venueId = data.venueId
    const clusterId = data.edgeClusterId
    const payload = requestPreProcess(data)

    return await createTunnelProfileTemplate({
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

  const updateTunnelProfileTemplateOperation = async (id:string,
    data: TunnelProfileFormType,
    initData: TunnelProfileFormType) => {
    try {
      const compareResult = compareConfigChanges(data, initData)

      if (compareResult.hasChanges) {
        const pathParams = { id }
        const payload = requestPreProcess(data)
        await updateTunnelProfileTemplate({
          params: pathParams,
          payload
        }).unwrap()
      }

      handleTunnelProfileEdgeClusterAssociation(id, data, initData)
      handleTunnelProfileIpsecAssociation(id, data, initData)
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  const compareConfigChanges = (
    data: TunnelProfileFormType,
    initData: TunnelProfileFormType
  ): { hasChanges: boolean } => {
    const preUpdateData = omit(data, nonTunnelProfileConfigKeys)
    const initDataCopy = omit(initData, nonTunnelProfileConfigKeys)

    const hasChanges = !isEqual(preUpdateData, initDataCopy)
    return { hasChanges }
  }

  return {
    createTunnelProfileOperation,
    updateTunnelProfileOperation,
    createTunnelProfileTemplateOperation,
    updateTunnelProfileTemplateOperation,
    isTunnelProfileCreating,
    isTunnelProfileUpdating,
    isTunnelProfileTemplateCreating,
    isTunnelProfileTemplateUpdating
  }
}