import { cloneDeep } from 'lodash'
import { Params }    from 'react-router-dom'

import { useCreateTunnelProfileMutation, useUpdateTunnelProfileMutation } from '@acx-ui/rc/services'

import { TunnelProfileFormType } from '.'

export const useTunnelProfileActions = (
  params: Readonly<Params<string>>
) => {
  const [createTunnelProfile] = useCreateTunnelProfileMutation()
  const [updateTunnelProfile] = useUpdateTunnelProfileMutation()

  const requestPreProcess = (data: TunnelProfileFormType) => {
    const result = cloneDeep(data)
    if (data.ageTimeUnit === 'week') {
      result.ageTimeMinutes = data.ageTimeMinutes* 7 * 24 * 60
    } else if (data.ageTimeUnit === 'days') {
      result.ageTimeMinutes = data.ageTimeMinutes * 24 * 60
    }
    return result
  }

  const create = async (data: TunnelProfileFormType) => {
    try {
      const payload = requestPreProcess(data)
      await createTunnelProfile({ payload }).unwrap()
    } catch (error) {
      // TODO Error message TBD
    }
  }

  const update = async (data: TunnelProfileFormType) => {
    try {
      const payload = requestPreProcess(data)
      let pathParams = { id: params.policyId }
      await updateTunnelProfile({ params: pathParams, payload }).unwrap()
    } catch (error) {
      // TODO Error message TBD
    }
  }

  return {
    create,
    update
  }
}