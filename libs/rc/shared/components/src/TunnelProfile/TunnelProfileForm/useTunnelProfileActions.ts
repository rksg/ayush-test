import { cloneDeep } from 'lodash'

import { Features }                                                               from '@acx-ui/feature-toggle'
import { useCreateTunnelProfileMutation, useUpdateTunnelProfileMutation }         from '@acx-ui/rc/services'
import { AgeTimeUnit, MtuRequestTimeoutUnit, MtuTypeEnum, TunnelProfileFormType } from '@acx-ui/rc/utils'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'

export const useTunnelProfileActions = () => {
  const isEdgeVxLanKaReady = useIsEdgeFeatureReady(Features.EDGE_VXLAN_TUNNEL_KA_TOGGLE)
  const [create, { isLoading: isTunnelProfileCreating }] = useCreateTunnelProfileMutation()
  const [update, { isLoading: isTunnelProfileUpdating }] = useUpdateTunnelProfileMutation()

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

    delete result.ageTimeUnit

    // remove UI used data
    delete result.disabledFields
    return result
  }

  const createTunnelProfile = async (data: TunnelProfileFormType) => {
    try {
      const payload = requestPreProcess(data)
      return await create({ payload }).unwrap()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const updateTunnelProfile = async (id: string, data: TunnelProfileFormType) => {
    try {
      const payload = requestPreProcess(data)
      let pathParams = { id }
      return await update({ params: pathParams, payload }).unwrap()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  return {
    createTunnelProfile,
    updateTunnelProfile,
    isTunnelProfileCreating,
    isTunnelProfileUpdating
  }
}