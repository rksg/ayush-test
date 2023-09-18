import { useAddEdgeDhcpServiceMutation, useUpdateEdgeDhcpServiceMutation } from '@acx-ui/rc/services'
import { EdgeDhcpSettingFormData, convertEdgeDHCPFormDataToApiPayload }    from '@acx-ui/rc/utils'

export const useEdgeDhcpActions = () => {

  const [create, { isLoading: isEdgeDhcpProfileCreating }] = useAddEdgeDhcpServiceMutation()
  const [update, { isLoading: isEdgeDhcpProfileUpdating }] = useUpdateEdgeDhcpServiceMutation()

  const createEdgeDhcpProfile = async (data: EdgeDhcpSettingFormData) => {
    try {
      const payload = convertEdgeDHCPFormDataToApiPayload(data)
      return await create({ payload }).unwrap()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const updateEdgeDhcpProfile = async (id: string, data: EdgeDhcpSettingFormData) => {
    try {
      const pathVar = { id }
      const payload = convertEdgeDHCPFormDataToApiPayload(data)
      return await update({ payload, params: pathVar }).unwrap()
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