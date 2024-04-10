export const useCasesToRefreshNetworkTemplateList = [
  'AddNetworkTemplateRecord',
  'UpdateNetworkTemplateRecord',
  'DeleteNetworkTemplateRecord'
]

export const useCasesToRefreshVenueTemplateList = [
  'AddVenueTemplateRecord',
  'UpdateVenueTemplateRecord',
  'DeleteVenueTemplateRecord'
]

export const useCasesToRefreshDhcpTemplateList = [
  'AddDhcpConfigServiceProfileTemplate',
  'UpdateDhcpConfigServiceProfileTemplate',
  'DeleteDhcpConfigServiceProfileTemplate'
]

export const useCasesToRefreshDpskTemplateList = [
  'CREATE_POOL_TEMPLATE_RECORD',
  'UPDATE_POOL_TEMPLATE_RECORD',
  'DELETE_POOL_TEMPLATE_RECORD'
]

export const useCasesToRefreshPortalTemplateList = [
  'Add Portal Service Profile by Template	',
  'Update Portal Service Profile by Template	',
  'Delete Portal Service Profile by Template'
]

export const L2AclTemplateUseCases = [
  'AddL2AclPolicyTemplate',
  'UpdateL2AclPolicyTemplate',
  'DeleteL2AclPolicyTemplate'
]

export const L3AclTemplateUseCases = [
  'AddL3AclPolicyTemplate',
  'UpdateL3AclPolicyTemplate',
  'DeleteL3AclPolicyTemplate'
]

export const DeviceTemplateUseCases = [
  'AddDevicePolicyTemplate',
  'UpdateDevicePolicyTemplate',
  'DeleteDevicePolicyTemplate'
]

export const ApplicationTemplateUseCases = [
  'AddApplicationPolicyTemplate',
  'UpdateApplicationPolicyTemplate',
  'DeleteApplicationPolicyTemplate'
]

export const AccessControlTemplateUseCases = [
  'AddAccessControlProfileTemplate',
  'UpdateAccessControlProfileTemplate',
  'DeleteAccessControlProfileTemplate'
]

export const useCasesToRefreshAccessControlTemplateList = [
  'AddAccessControlProfileTemplateRecord',
  'UpdateAccessControlProfileTemplateRecord',
  'DeleteAccessControlProfileTemplateRecord',
  ...L2AclTemplateUseCases,
  ...L3AclTemplateUseCases,
  ...DeviceTemplateUseCases,
  ...ApplicationTemplateUseCases
]

export const useCasesToRefreshVlanPoolTemplateList = [
  'AddVlanPoolTemplate',
  'UpdateVlanPoolTemplate',
  'DeleteVlanPoolTemplate',
  'PatchVlanPoolTemplate'
]

export const useCasesToRefreshRadiusServerTemplateList = [
  'AddRadiusServerProfileTemplateRecord',
  'UpdateRadiusServerProfileTemplateRecord',
  'DeleteRadiusServerProfileTemplateRecord'
]

export const useCasesToRefreshWifiCallingTemplateList = [
  'AddWifiCallingServiceProfileTemplate',
  'UpdateWifiCallingServiceProfileTemplate',
  'DeleteWifiCallingServiceProfileTemplate'
]

export const useCasesToRefreshTemplateList = [
  'ApplyTemplate',
  ...useCasesToRefreshNetworkTemplateList,
  ...useCasesToRefreshVenueTemplateList,
  ...useCasesToRefreshDpskTemplateList,
  ...useCasesToRefreshDhcpTemplateList,
  ...useCasesToRefreshAccessControlTemplateList,
  ...useCasesToRefreshPortalTemplateList,
  ...useCasesToRefreshVlanPoolTemplateList,
  ...useCasesToRefreshRadiusServerTemplateList,
  ...useCasesToRefreshWifiCallingTemplateList
]
