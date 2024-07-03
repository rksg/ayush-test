export const useCasesToRefreshNetworkTemplateList = [
  'AddNetworkTemplate',
  'UpdateNetworkTemplate',
  'DeleteNetworkTemplate'
]

export const useCasesToRefreshVenueTemplateList = [
  'AddVenueTemplate',
  'UpdateVenueTemplate',
  'DeleteVenueTemplate'
]

export const useCasesToRefreshDhcpTemplateList = [
  'AddDhcpConfigServiceProfileTemplate',
  'UpdateDhcpConfigServiceProfileTemplate',
  'DeleteDhcpConfigServiceProfileTemplate'
]

export const useCasesToRefreshDpskTemplateList = [
  'CREATE_POOL_TEMPLATE',
  'UPDATE_POOL_TEMPLATE',
  'DELETE_POOL_TEMPLATE'
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
  'AddAccessControlProfileTemplate',
  'UpdateAccessControlProfileTemplate',
  'DeleteAccessControlProfileTemplate',
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
  'AddRadiusServerProfileTemplate',
  'UpdateRadiusServerProfileTemplate',
  'DeleteRadiusServerProfileTemplate'
]

export const useCasesToRefreshWifiCallingTemplateList = [
  'AddWifiCallingServiceProfileTemplate',
  'UpdateWifiCallingServiceProfileTemplate',
  'DeleteWifiCallingServiceProfileTemplate'
]

export const useCasesToRefreshSyslogTemplateList = [
  'AddSyslogServerProfileTemplate',
  'UpdateSyslogServerProfileTemplate',
  'DeleteSyslogServerProfileTemplate'
]

export const useCasesToRefreshRogueAPTemplateList = [
  'AddRogueApPolicyProfileTemplate',
  'UpdateRogueApPolicyProfileTemplate',
  'DeleteRogueApPolicyProfileTemplate',
  'DeleteRoguePolicyTemplate',
  'AddRoguePolicyTemplate',
  'UpdateRoguePolicyTemplate'
]

export const useCasesToRefreshSwitchConfigProfileTemplateList = [
  'AddSwitchConfigProfileTemplate',
  'UpdateSwitchConfigProfileTemplate',
  'DeleteSwitchConfigProfileTemplate'
]

export const useCasesToRefreshApGroupTemplateList = [
  'AddApGroupTemplate',
  'UpdateApGroupTemplate',
  'DeleteApGroupTemplate'
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
  ...useCasesToRefreshWifiCallingTemplateList,
  ...useCasesToRefreshSyslogTemplateList,
  ...useCasesToRefreshRogueAPTemplateList,
  ...useCasesToRefreshSwitchConfigProfileTemplateList,
  ...useCasesToRefreshApGroupTemplateList
]
