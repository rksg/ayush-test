import {
  useActivateEdgeDhcpServiceMutation,
  useAddEdgeDhcpServiceMutation,
  useDeactivateEdgeDhcpServiceMutation,
  usePatchEdgeDhcpServiceMutation,
  useRestartEdgeDhcpServiceMutation,
  useUpdateEdgeDhcpServiceMutation
} from '@acx-ui/rc/services'
import { EdgeDhcpSettingFormData, convertEdgeDHCPFormDataToApiPayload } from '@acx-ui/rc/utils'

export const useEdgeDhcpActions = () => {

  const [create, { isLoading: isEdgeDhcpProfileCreating }] = useAddEdgeDhcpServiceMutation()
  const [update, { isLoading: isEdgeDhcpProfileUpdating }] = useUpdateEdgeDhcpServiceMutation()
  const [patch, { isLoading: isEdgeDhcpUpgrading }] = usePatchEdgeDhcpServiceMutation()
  const [activate, { isLoading: isEdgeDhcpActivating }] = useActivateEdgeDhcpServiceMutation()
  const [deactivate, { isLoading: isEdgeDhcpDeactivating }] = useDeactivateEdgeDhcpServiceMutation()
  const [restart, { isLoading: isEdgeDhcpRestarting }] = useRestartEdgeDhcpServiceMutation()

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

  const activateEdgeDhcp = async (id: string, venueId: string, edgeId: string) => {
    try {
      return await activate({ params: { id, venueId, edgeId } }).unwrap()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const deactivateEdgeDhcp = async (id: string, venueId: string, edgeId: string) => {
    try {
      return await deactivate({ params: { id, venueId, edgeId } }).unwrap()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const upgradeEdgeDhcp = async (id: string) => {
    try {
      return await patch({ params: { id }, payload: { action: 'UPDATE_NOW' } }).unwrap()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const restartEdgeDhcp = async (id: string, venueId: string, edgeId: string) => {
    try {
      return await restart({ params: { id, venueId, edgeId } }).unwrap()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  return {
    createEdgeDhcpProfile,
    updateEdgeDhcpProfile,
    activateEdgeDhcp,
    deactivateEdgeDhcp,
    upgradeEdgeDhcp,
    restartEdgeDhcp,
    isEdgeDhcpProfileCreating,
    isEdgeDhcpProfileUpdating,
    isEdgeDhcpActivating,
    isEdgeDhcpDeactivating,
    isEdgeDhcpUpgrading,
    isEdgeDhcpRestarting
  }
}