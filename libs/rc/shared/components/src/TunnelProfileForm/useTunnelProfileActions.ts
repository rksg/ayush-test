import { cloneDeep } from 'lodash'

import { useCreateTunnelProfileMutation, useUpdateTunnelProfileMutation } from '@acx-ui/rc/services'

import { TunnelProfileFormType } from '.'

export const useTunnelProfileActions = () => {
  const [create, { isLoading: isTunnelProfileCreating }] = useCreateTunnelProfileMutation()
  const [update, { isLoading: isTunnelProfileUpdating }] = useUpdateTunnelProfileMutation()

  const requestPreProcess = (data: TunnelProfileFormType) => {
    const result = cloneDeep(data)
    if (data.ageTimeUnit === 'week') {
      result.ageTimeMinutes = data.ageTimeMinutes* 7 * 24 * 60
    } else if (data.ageTimeUnit === 'days') {
      result.ageTimeMinutes = data.ageTimeMinutes * 24 * 60
    }
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