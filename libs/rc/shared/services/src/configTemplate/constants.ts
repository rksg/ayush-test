export const useCasesToRefreshNetworkTemplateList = [
  'AddNetworkTemplate',
  'UpdateNetworkTemplate',
  'DeleteNetworkTemplate',
  'AddWifiNetworkTemplate',
  'UpdateWifiNetworkTemplate',
  'DeleteWifiNetworkTemplate'
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
  'Add Portal Service Profile by Template',
  'Update Portal Service Profile by Template',
  'Update Portal Service Profile by Template V1_1',
  'Delete Portal Service Profile by Template',
  'Add Portal Service Profile by Template in CfgTemplate',
  'Update Portal Service Profile by Template in CfgTemplate',
  'Delete Portal Service Profile by Template in CfgTemplate'
]

export const L2AclTemplateUseCases = [
  'AddL2AclPolicyTemplate',
  'UpdateL2AclPolicyTemplate',
  'DeleteL2AclPolicyTemplate',
  'AddL2AclPolicyTemplateInCfgTemplate',
  'UpdateL2AclPolicyTemplateInCfgTemplate',
  'DeleteL2AclPolicyTemplateInCfgTemplate'
]

export const L3AclTemplateUseCases = [
  'AddL3AclPolicyTemplate',
  'UpdateL3AclPolicyTemplate',
  'DeleteL3AclPolicyTemplate',
  'AddL3AclPolicyTemplateInCfgTemplate',
  'UpdateL3AclPolicyTemplateInCfgTemplate',
  'DeleteL3AclPolicyTemplateInCfgTemplate'
]

export const DeviceTemplateUseCases = [
  'AddDevicePolicyTemplate',
  'UpdateDevicePolicyTemplate',
  'DeleteDevicePolicyTemplate',
  'AddDevicePolicyTemplateInCfgTemplate',
  'UpdateDevicePolicyTemplateInCfgTemplate',
  'DeleteDevicePolicyTemplateInCfgTemplate'
]

export const ApplicationTemplateUseCases = [
  'AddApplicationPolicyTemplate',
  'UpdateApplicationPolicyTemplate',
  'DeleteApplicationPolicyTemplate',
  'AddApplicationPolicyTemplateInCfgTemplate',
  'UpdateApplicationPolicyTemplateInCfgTemplate',
  'DeleteApplicationPolicyTemplateInCfgTemplate'
]

export const AccessControlTemplateUseCases = [
  'AddAccessControlProfileTemplate',
  'UpdateAccessControlProfileTemplate',
  'DeleteAccessControlProfileTemplate',
  'AddAccessControlProfileTemplateInCfgTemplate',
  'UpdateAccessControlProfileTemplateInCfgTemplate',
  'DeleteAccessControlProfileTemplateInCfgTemplate'
]

export const useCasesToRefreshAccessControlTemplateList = [
  ...AccessControlTemplateUseCases,
  ...L2AclTemplateUseCases,
  ...L3AclTemplateUseCases,
  ...DeviceTemplateUseCases,
  ...ApplicationTemplateUseCases
]

export const useCasesToRefreshVlanPoolTemplateList = [
  'AddVlanPoolTemplate',
  'AddVlanPoolProfileTemplate',
  'UpdateVlanPoolTemplate',
  'UpdateVlanPoolProfileTemplate',
  'DeleteVlanPoolTemplate',
  'DeleteVlanPoolProfileTemplate',
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
  'DeleteWifiCallingServiceProfileTemplate',
  'ActivateWifiCallingServiceProfileTemplateOnWifiNetworkTemplate',
  'DeactivateWifiCallingServiceProfileTemplateOnWifiNetworkTemplate'
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

export const useCasesToRefreshEthernetPortTemplateList = [
  'AddEthernetPortProfileTemplate',
  'UpdateEthernetPortProfileTemplate',
  'DeleteEthernetPortProfileTemplate'
]

export const useCasesToRefreshTemplateList = [
  'ApplyTemplate',
  'SyncTemplate',
  'EnforceTemplate',
  'CloneWifiNetworkTemplate',
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
  ...useCasesToRefreshApGroupTemplateList,
  ...useCasesToRefreshEthernetPortTemplateList
]
