export interface RoleMapping {
  action: string;
}

export const RolesMappingDic: { [id: string]: RoleMapping[] } = {
  // Venue service
  DeleteVenueButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/venue/{venueId}'
  }],

  AddVenueButton: [{
    action: 'POST:/api/tenant/{tenantId}/venue'
  }],

  EditVenueButton: [{
    action: 'PUT:/api/tenant/{tenantId}/venue/{venueId}'
  }],

  AddFloorPlan: [{
    action: 'POST:/api/tenant/{tenantId}/venue/{venueId}/floor-plan'
  }],

  DeleteFloorplan: [{
    action: 'DELETE:/api/tenant/{tenantId}/venue/{venueId}/floor-plan/{floorPlanId}'
  }],

  EditFloorPlan: [{
    action: 'PUT:/api/tenant/{tenantId}/venue/{venueId}/floor-plan/{floorPlanId}'
  }],

  AddVspotButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/vspot'
  }],

  UpdateVspotButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/vspot/{vspotId}'
  }],

  DeleteVspotButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/vspot/{vspotId}'
  }],

  UnbindVenueVspot: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/venue/{venueId}/vspot'
  }],

  UpdateNetworkVenue: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/network-venue/{networkVenueId}'
  }],

  // Tenant service
  AddAdminButton: [{
    action: 'POST:/api/tenant/{tenantId}/admin'
  }],

  DeleteAdminButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/admin/{adminId}'
  }],

  EditAdminButton: [{
    action: 'PUT:/api/tenant/{tenantId}/admin'
  }],

  Invite3rdPartyButton: [{
    action: 'POST:/api/tenant/{tenantId}/delegation'
  }],

  EditRecipientButton: [{
    action: 'PUT:/api/tenant/{tenantId}/notification-recipient/{notificationRecipientId}'
  }],

  DeleteRecipientButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/notification-recipient/{notificationRecipientId}'
  }],

  AddRecipientButton: [{
    action: 'POST:/api/tenant/{tenantId}/notification-recipient'
  }],

  LicenseManagement: [{
    action: 'LicenseManagement'
  }],

  RejectDelegationButton: [{
    action: 'PUT:/api/tenant/{tenantId}/delegation/{delegationId}'
  }],

  AcceptDelegationButton: [{
    action: 'PUT:/api/tenant/{tenantId}/delegation/{delegationId}'
  }],

  InviteSupportButton: [{
    action: 'POST:/api/tenant/{tenantId}/delegation/support'
  }],

  RevokeInvitationButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/delegation/{delegationId}'
  }],

  // Guest service
  AddGuestButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/guest-user'
  }],

  ImportGuestButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/guest-user/import'
  }],

  DeleteGuestButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/guest-user'
  }],

  EditGuestButton: [{
    action: 'PATCH:/api/tenant/{tenantId}/wifi/guest-user'
  }],

  RegeneratePasswordButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/guest-user/{guestUserId}/regenerate'
  }],

  EnableGuestButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/guest-user/{guestUserId}/enable'
  }],

  DisableGuestButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/guest-user/{guestUserId}/disable'
  }],

  // upgrade service
  ChangeScheduleButton: [{
    action: 'PUT:/api/upgrade/tenant/{tenantId}'
  }],

  ViewConfigButton: [{
    action: 'GET:/api/switch/tenant/{tenantId}/configBackup/content/{id}'
  }],

  CompareConfigButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/configBackup/compare'
  }],

  RestoreConfigButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/configBackup/retore/{id}'
  }],

  RestoreConfigButtonForAcx: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/configBackup/restore/{id}'
  }],

  DownloadConfigButton: [{
    action: 'GET:/api/switch/tenant/{tenantId}/configBackup/download/{id}'
  }],

  DeleteConfigButton: [{
    action: 'DELETE:/api/switch/tenant/{tenantId}/configBackup'
  }],

  BackupButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/configBackup/switch/{switchId}'
  }],

  // msp services - MspMappingDic
  EditMspEcButton: [{
    action: 'PUT:/api/mspservice/tenant/{tenantId}/{mspEcTenantId}'
  }],

  DeleteMspEcButton: [{
    action: 'DELETE:/api/mspservice/tenant/{tenantId}/{mspEcTenantId}'
  }],

  ManageMspEcAdminButton: [{
    action: 'POST:/api/mspservice/tenant/{tenantId}/admin'
  }],

  DeactivateMspEcButton: [{
    action: 'POST:/api/mspservice/tenant/{tenantId}/deactivation'
  }],

  ReactivateMspEcButton: [{
    action: 'POST:/api/mspservice/tenant/{tenantId}/reactivation'
  }],

  AddMspEcButton: [{
    action: 'POST:/api/mspservice/tenant/{tenantId}/mspecaccounts'
  }],

  CustomizeCustomerPortalButton: [{
    action: 'put:/api/mspservice/tenant/{tenantId}/msplabel'
  }],

  ExportMspEcToCsvButton: [{
    action: 'ExportEcToCsv'
  }],

  RefreshMspEcButton: [{
    action: 'GET:/api/mspservice/tenant/{tenantId}/mspecaccounts'
  }],

  // WifiActionsMappingDic
  DisconnectClientButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/disconnect-client'
  }],

  AddApButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/ap'
  }],

  EditApButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/ap/{serialNumber}'
  }],

  DeleteApButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/ap/{serialNumber}'
  }],

  AddOsPolicyButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/device-policy'
  }],

  EditOsPolicyButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/device-policy/{devicePolicyId}'
  }],

  DeleteOsPolicyButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/device-policy/{devicePolicyId}'
  }],

  ImportButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/ap'
  }],

  AddNetworkButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/network/deep'
  }],

  EditNetworkButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/network/{networkId}/deep'
  }],

  DeleteNetworkButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/network/{networkId}'
  }],

  AddWifiCallingButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/wifi-calling-profile'
  }],

  EditWifiCallingButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/wifi-calling-profile/{wifiCallingProfileId}'
  }],

  DeleteWifiCallingButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/wifi-calling-profile/{wifiCallingProfileId}'
  }],

  AddVlanPoolButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/vlan-pool'
  }],

  EditVlanPoolButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/vlan-pool/{vlanPoolId}'
  }],

  DeleteVlanPoolButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/vlan-pool/{vlanPoolId}'
  }],

  EditApGroupButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/ap-group/{apGroupId}'
  }],

  DeleteApGroupButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/ap-group/{apGroupId}'
  }],

  AddApGroupButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/ap-group'
  }],

  DeleteDpskPassphraseButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/dpsk'
  }],

  AddDpskPassphraseButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/dpsk'
  }],

  ResetApButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/factory-reset'
  }],

  RebootApButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/reboot'
  }],

  ApPingButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/ping'
  }],

  ApTraceRouteButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/trace-route'
  }],

  DownloadApLogButton: [{
    action: 'GET:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/download-log'
  }],

  BlinkLedButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/blink-led'
  }],

  UpdateVenueLanPorts: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/venue/{venueId}/lan-port'
  }],

  UpdateExternalAntennas: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/venue/{venueId}/externalAntenna'
  }],

  UpdateWifiApSetting: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/customization'
  }],

  ResetWifiApSetting: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/customization'
  }],

  ResetVenueRadioCustomizationButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/venue/{venueId}/radio'
  }],

  updateVenueRadioCustomization: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/venue/{venueId}/radio'
  }],

  UpdateVenueCellularRadioButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/venue/{venueId}/cellular'
  }],

  UpdateApPosition: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/position'
  }],

  UpdateSysLogButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/venue/{venueId}/syslog'
  }],

  UpdateMeshButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/venue/{venueId}/mesh'
  }],

  ResetApRadioButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/radio'
  }],

  UpdateApRadioButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/radio'
  }],

  ResetApLanPorts: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/lan-port'
  }],

  UpdateApLanPorts: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/lan-port'
  }],

  UpdateVenueLedOn: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/venue/{venueId}/led'
  }],

  UpdateDenialOfServiceProtection: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/venue/{venueId}/dos-protection'
  }],

  ResetApBonjourButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/bonjour-gateway'
  }],

  UpdateApBonjourButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/bonjour-gateway'
  }],

  UpdateVenueRogueAp: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/venue/{venueId}/rogue/ap'
  }],

  AddDhcpProfileButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/dhcp-service-profile'
  }],

  UpdateDhcpProfileButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/dhcp-service-profile/{dhcpServiceProfileId}'
  }],

  DeleteDhcpProfileButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/dhcp-service-profile'
  }],

  AddRoguePolicyButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/rogue-policy'
  }],

  UpdateRoguePolicyButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/rogue-policy/{roguePolicyId}'
  }],

  DeleteRoguePolicyButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/rogue-policy'
  }],

  AddPhotoButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/ap/{serialNumber}/picture/deep'
  }],

  ChangeRecoveryPasspharseButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/recovery'
  }],

  AddApplicationPolicyButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/application-policy'
  }],

  EditApplicationPolicyButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/application-policy/{applicationPolicyId}'
  }],

  DeleteApplicationPolicyButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/application-policy/{applicationPolicyId}'
  }],

  AddAccessControlProfileButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/access-control-profile'
  }],
  EditAccessControlProfileButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/access-control-profile/{accessControlProfileId}'
  }],
  DeleteAccessControlProfileButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/access-control-profile'
  }],

  AddClientIsolationWhitelistButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/isolation-allowlist'
  }],
  UpdateClientIsolationAllowlistButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/isolation-allowlist/{clientIsolationAllowlistId}'
  }],
  DeleteClientIsolationAllowlistsButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/isolation-allowlist'
  }],

  // Cloudpath integration
  AddCloudpathServerButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/cloudpath'
  }],

  EditCloudpathServerButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/cloudpath/{cloudpathServerId}'
  }],
  DeleteCloudpathServerButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/cloudpath/{cloudpathServerId}'
  }],

  TestCloudpathServerConnectionButton: [{
    action: 'GET:/api/tenant/{tenantId}/wifi/cloudpath/{cloudpathServerId}/connection'
  }],

  // dpsk service
  AddDpskButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/guest-user'
  }],

  DeleteDpskButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/guest-user'
  }],

  ExportDpskButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/dpsk-passphrase/export'
  }],

  ImportDpskButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/dpsk-passphrase/import'
  }],

  // URL filtering
  AddUrlFilteringButton: [{
    action: 'POST:/api/tenant/{tenantId}/wifi/url-filtering-policy'
  }],

  EditUrlFilteringButton: [{
    action: 'PUT:/api/tenant/{tenantId}/wifi/url-filtering-policy/{urlFilteringPolicyId}'
  }],

  DeleteUrlFilteringButton: [{
    action: 'DELETE:/api/tenant/{tenantId}/wifi/url-filtering-policy/{urlFilteringPolicyId}'
  }],

  // Switch service - SwitchActionsMappingDic
  AddSwitchButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/switch'
  }],

  AddStackButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/switch'
  }],

  ImportSwitchButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/import'
  }],

  SyncDataButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/switch'
  }],

  UpdateOrderOfMembers: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/switch/stackmembers/order'
  }],

  ViewSwitchButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/switch'
  }],

  EditSwitchButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/switch'
  }],

  StackSwitchButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/switch/ConvertToStack'
  }],

  DeleteSwitchButton: [{
    action: 'DELETE:/api/switch/tenant/{tenantId}/switches'
  }],

  EditStackButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/switch'
  }],

  DeleteStackButton: [{
    action: 'DELETE:/api/switch/tenant/{tenantId}/switches'
  }],

  AddStaticRouteButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/staticRoutes/switch/{serialNumber}'
  }],

  AddStaticRouteButtonForAcx: [{
    action: 'POST:/api/switch/tenant/{tenantId}/staticRoutes/switch/{switchId}'
  }],

  EditStaticRouteButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/staticRoute'
  }],

  DeleteStaticRouteButton: [{
    action: 'DELETE:/api/switch/tenant/{tenantId}/staticRoutes'
  }],

  EditProfileVenueButton: [{
    action: 'POST:/api/tenant/{tenantId}/venue'
  }],

  // Switch profile service
  AddSwitchProfileButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/profile'
  }],

  EditSwitchProfileButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/profile'
  }],

  DeleteSwitchProfileButton: [{
    action: 'DELETE:/api/switch/tenant/{tenantId}/profiles'
  }],

  AddSwitchProfileVlanButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/profile/{profileId}/vlan'
  }],

  AddVlanModelButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/profile/{profileId}/vlan'
  }],

  EditVlanModelButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/profile/{profileId}/vlan'
  }],

  DeleteVlanModelButton: [{
    action: 'DELETE:/api/switch/tenant/{tenantId}/profile/{profileId}/vlans'
  }],

  AddSwitchProfileAclButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/profile/{profileId}/acl'
  }],

  AddAclExtendedRuleButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/profile/{profileId}/acl'
  }],

  AddAclStandardRuleButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/profile/{profileId}/acl'
  }],

  ManageLAGButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/lag/switch/{serialNumber}'
  }],

  ManageLAGButtonForAcx: [{
    action: 'POST:/api/switch/tenant/{tenantId}/lag/switch/{switchId}'
  }],

  EditPortSettingButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/port/switch/{serialNumber}'
  }],

  EditPortSettingButtonForAcx: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/port/switch/{switchId}'
  }],

  DeleteLagButton: [{
    action: 'DELETE:/api/switch/tenant/{tenantId}/lag/{lagId}'
  }],

  AddVEPortButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/vePort/switch/{serialNumber}'
  }],

  AddVEPortButtonForAcx: [{
    action: 'POST:/api/switch/tenant/{tenantId}/vePort/switch/{switchId}'
  }],

  ViewVEPortButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/vePort/switch/{serialNumber}'
  }],

  EditVEPortButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/vePort/switch/{serialNumber}'
  }],

  EditVEPortButtonForAcx: [{
    action: 'POST:/api/switch/tenant/{tenantId}/vePort/switch/{switchId}'
  }],

  DeleteVEPortButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/vePort/switch/{serialNumber}'
  }],

  DeleteVEPortButtonForAcx: [{
    action: 'POST:/api/switch/tenant/{tenantId}/vePort/switch/{switchId}'
  }],

  AddIPPortButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/ipPort/switch/{serialNumber}'
  }],

  ViewDhcpPoolButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/switch/{serialNumber}/dhcpServer'
  }],

  EditDhcpPoolButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/switch/{serialNumber}/dhcpServer'
  }],

  EditDhcpPoolButtonForAcx: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/switch/{switchId}/dhcpServer'
  }],

  DeleteDhcpPoolButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/switch/{serialNumber}/dhcpServer'
  }],

  DeleteDhcpPoolButtonForAcx: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/switch/{switchId}/dhcpServer'
  }],

  AddDhcpPoolButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/switch/{serialNumber}/dhcpServer'
  }],

  AddDhcpPoolButtonForAcx: [{
    action: 'POST:/api/switch/tenant/{tenantId}/switch/{switchId}/dhcpServer'
  }],

  EnableCliSessionButton: [{
    action: 'EnableCliSessionButton'
  }],

  AddSwitchLevelVlanButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/vlan/switch/{serialNumber}'
  }],

  DeleteSwitchLevelVlanButton: [{
    action: 'DELETE:/api/switch/tenant/{tenantId}/vlans'
  }],

  EditSwitchLevelVlanButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/vlan'
  }],

  AddSwitchAclButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/acl/switch/{serialNumber}'
  }],

  EditSwitchAclButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/acl'
  }],

  DeleteSwitchAclButton: [{
    action: 'DELETE:/api/switch/tenant/{tenantId}/acls'
  }],

  ViewSwitchAclButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/acl'
  }],

  ViewSwitchAclButtonForAcx: [{
    action: 'GET:/api/switch/tenant/{tenantId}/acl/{id}'
  }],

  ViewSwitchLevelVlanButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/acl'
  }],

  ViewSwitchLevelVlanButtonForAcx: [{
    action: 'GET:/api/switch/tenant/{tenantId}/vlan/{id}'
  }],

  EditAaaServerButton: [{
    action: 'PUT:/api/switch/tenant/{tenantId}/venue/{venueId}/aaaServer'
  }],

  DeleteAaaServerButton: [{
    action: 'DELETE:/api/switch/tenant/{tenantId}/aaaServer/{aaaServerId}'
  }],

  AddAaaServerButton: [{
    action: 'POST:/api/switch/tenant/{tenantId}/venue/{venueId}/aaaServer'
  }]

}
