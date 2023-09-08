import { Params } from 'react-router-dom'

import { useAddEdgeDhcpServiceMutation, useUpdateEdgeDhcpServiceMutation } from '@acx-ui/rc/services'
import { EdgeDhcpSettingFormData, convertEdgeDHCPFormDataToApiPayload }    from '@acx-ui/rc/utils'

export const useEdgeDhcpActions = (
  params: Readonly<Params<string>>
) => {

  const [create, { isLoading: isEdgeDhcpProfileCreating }] = useAddEdgeDhcpServiceMutation()
  const [update, { isLoading: isEdgeDhcpProfileUpdating }] = useUpdateEdgeDhcpServiceMutation()

  const createEdgeDhcpProfile = async (data: EdgeDhcpSettingFormData) => {
    try {
      const payload = convertEdgeDHCPFormDataToApiPayload(data)
      await create({ payload }).unwrap()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const updateEdgeDhcpProfile = async (data: EdgeDhcpSettingFormData) => {
    try {
      const pathVar = { id: params.serviceId }
      const payload = convertEdgeDHCPFormDataToApiPayload(data)
      await update({ payload, params: pathVar }).unwrap()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  return {
    createEdgeDhcpProfile,
    updateEdgeDhcpProfile,
    isEdgeDhcpProfileCreating,
    isEdgeDhcpProfileUpdating
  }
}