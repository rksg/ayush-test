import { cloneDeep } from 'lodash'

import { useCreateTunnelProfileMutation, useUpdateTunnelProfileMutation } from '@acx-ui/rc/services'
import { AgeTimeUnit, TunnelProfileFormType }                             from '@acx-ui/rc/utils'

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