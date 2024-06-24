import { cloneDeep } from 'lodash'

import { useCreateTunnelProfileMutation, useUpdateTunnelProfileMutation }         from '@acx-ui/rc/services'
import { AgeTimeUnit, MtuRequestTimeoutUnit, MtuTypeEnum, TunnelProfileFormType } from '@acx-ui/rc/utils'

export const useTunnelProfileActions = () => {
  const [create, { isLoading: isTunnelProfileCreating }] = useCreateTunnelProfileMutation()
  const [update, { isLoading: isTunnelProfileUpdating }] = useUpdateTunnelProfileMutation()

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

    delete result.ageTimeUnit
    delete result.mtuRequestTimeoutUnit

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