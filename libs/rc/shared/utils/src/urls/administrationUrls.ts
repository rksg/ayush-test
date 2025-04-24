import { ApiInfo } from '@acx-ui/utils'

export const AdministrationUrlsInfo: { [key: string]: ApiInfo } = {
  getTenantDetails: {
    method: 'get',
    url: '/tenants/self',
    oldUrl: '/api/tenant/:tenantId',
    opsApi: 'GET:/tenants/self',
    newApi: true
  },
  updateTenantSelf: {
    method: 'PUT',
    url: '/tenants/self',
    opsApi: 'PUT:/tenants/self',
    newApi: true
  },
  getRegisteredUsersList: {
    method: 'get',
    url: '/admins/registered',
    oldUrl: '/api/tenant/:tenantId/admins/registered',
    newApi: true
  },
  getAdministrators: {
    method: 'get',
    url: '/admins',
    oldUrl: '/api/tenant/:tenantId/admin',
    opsApi: 'GET:/admins',
    newApi: true
  },
  updateAdmin: {
    method: 'put',
    url: '/admins',
    oldUrl: '/api/tenant/:tenantId/admin',
    opsApi: 'PUT:/admins',
    newApi: true
  },
  deleteAdmin: {
    method: 'delete',
    url: '/admins/:adminId',
    oldUrl: '/api/tenant/:tenantId/admin/:adminId',
    opsApi: 'DELETE:/admins/{id}',
    newApi: true
  },
  deleteAdmins: {
    method: 'delete',
    url: '/admins',
    oldUrl: '/api/tenant/:tenantId/admin',
    newApi: true
  },
  addAdmin: {
    method: 'post',
    url: '/admins',
    oldUrl: '/api/tenant/:tenantId/admin',
    opsApi: 'POST:/admins',
    newApi: true
  },
  getAccountDetails: {
    method: 'get',
    url: '/tenants/accounts',
    oldUrl: '/api/tenant/:tenantId/account',
    newApi: true
  },
  getRecoveryPassphrase: {
    method: 'get',
    url: '/wifiNetworks/recoveryPassphraseSettings',
    oldUrl: '/recoveryPskSettings',
    newApi: true
  },
  updateRecoveryPassphrase: {
    method: 'put',
    url: '/wifiNetworks/recoveryPassphraseSettings',
    oldUrl: '/recoveryPskSettings',
    opsApi: 'PUT:/wifiNetworks/recoveryPassphraseSettings',
    newApi: true
  },
  getDelegations: {
    method: 'get',
    url: '/tenants/delegations?type=VAR',
    oldUrl: '/api/tenant/:tenantId/delegation?type=VAR',
    opsApi: 'GET:/tenants/delegations',
    newApi: true
  },
  getTenantDelegation: {
    method: 'get',
    url: '/tenants/delegations?type=SUPPORT',
    oldUrl: '/api/tenant/:tenantId/delegation?type=SUPPORT',
    newApi: true
  },
  getEcTenantDelegation: {
    method: 'get',
    url: '/tenants/delegations?type=SUPPORT_EC',
    oldUrl: '/api/tenant/:tenantId/delegation?type=SUPPORT_EC',
    newApi: true
  },
  getMspEcDelegations: {
    method: 'get',
    url: '/tenants/delegations?type=MSP',
    oldUrl: '/api/tenant/:tenantId/delegation?type=MSP',
    newApi: true
  },
  enableAccessSupport: {
    method: 'post',
    url: '/tenants/supportDelegations',
    oldUrl: '/api/tenant/:tenantId/delegation/support',
    opsApi: 'POST:/tenants/supportDelegations',
    newApi: true
  },
  disableAccessSupport: {
    method: 'delete',
    url: '/tenants/supportDelegations',
    oldUrl: '/api/tenant/:tenantId/delegation/support',
    newApi: true
  },
  getPreferences: {
    method: 'get',
    url: '/tenants/preferences',
    oldUrl: '/api/tenant/:tenantId/preferences',
    newApi: true
  },
  updatePreferences: {
    method: 'put',
    url: '/tenants/preferences',
    oldUrl: '/api/tenant/:tenantId/preferences',
    opsApi: 'PUT:/tenants/preferences',
    newApi: true
  },
  revokeInvitation: {
    method: 'delete',
    url: '/tenants/delegations/:delegationId',
    oldUrl: '/api/tenant/:tenantId/delegation/:delegationId',
    opsApi: 'DELETE:/tenants/delegations/{id}',
    newApi: true
  },
  inviteVAR: {
    method: 'post',
    url: '/tenants/delegations',
    oldUrl: '/api/tenant/:tenantId/delegation',
    opsApi: 'POST:/tenants/delegations',
    newApi: true
  },
  findVAR: {
    method: 'get',
    url: '/tenants/find-var',
    oldUrl: '/api/tenant/:tenantId/find-var',
    newApi: true
  },
  getNotificationRecipients: {
    method: 'get',
    url: '/tenants/notificationRecipients',
    oldUrl: '/api/tenant/:tenantId/notification-recipient',
    opsApi: 'GET:/tenants/notificationRecipients',
    newApi: true
  },
  addRecipient: {
    method: 'post',
    url: '/tenants/notificationRecipients',
    oldUrl: '/api/tenant/:tenantId/notification-recipient',
    opsApi: 'POST:/tenants/notificationRecipients',
    newApi: true
  },
  updateRecipient: {
    method: 'put',
    url: '/tenants/notificationRecipients/:recipientId',
    oldUrl: '/api/tenant/:tenantId/notification-recipient/:recipientId',
    opsApi: 'PUT:/tenants/notificationRecipients/{id}',
    newApi: true
  },
  deleteNotificationRecipients: {
    method: 'delete',
    url: '/tenants/notificationRecipients',
    oldUrl: '/api/tenant/:tenantId/notification-recipient',
    opsApi: 'DELETE:/tenants/notificationRecipients',
    newApi: true
  },
  deleteNotificationRecipient: {
    method: 'delete',
    url: '/tenants/notificationRecipients/:recipientId',
    oldUrl: '/api/tenant/:tenantId/notification-recipient/:recipientId',
    newApi: true
  },
  getEntitlementSummary: {
    method: 'get',
    url: '/entitlements/summaries',
    oldUrl: '/api/tenant/:tenantId/entitlement/summary',
    newApi: true
  },
  getEntitlementsList: {
    method: 'get',
    url: '/entitlements',
    oldUrl: '/api/tenant/:tenantId/entitlement',
    newApi: true
  },
  getEntitlementsActivations: {
    method: 'post',
    url: '/entitlements/orders/query',
    opsApi: 'POST:/entitlements/orders/query',
    newApi: true
  },
  patchEntitlementsActivations: {
    method: 'PATCH',
    url: '/entitlements/orders/:orderId',
    opsApi: 'PATCH:/entitlements/orders/{id}',
    newApi: true
  },
  refreshLicensesData: {
    method: 'get',
    url: '/entitlements/summaries?refresh=true',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/entitlement/internal-refresh',
    newApi: true
  },
  internalRefreshLicensesData: {
    method: 'get',
    url: '/entitlements/summaries?refresh=true',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/entitlement/internal-refresh',
    newApi: false
  },
  convertNonVARToMSP: {
    method: 'post',
    url: '/api/mspservice/mspNonVAR/:tenantId',
    newApi: true
  },
  getTenantAuthentications: {
    method: 'get',
    url: '/tenants/authentications',
    newApi: true
  },
  addTenantAuthentications: {
    method: 'post',
    url: '/tenants/authentications',
    opsApi: 'POST:/tenants/authentications',
    newApi: true
  },
  patchTenantAuthentications: {
    method: 'PATCH',
    url: '/tenants/authentications/:authenticationId',
    newApi: true
  },
  updateTenantAuthentications: {
    method: 'put',
    url: '/tenants/authentications/:authenticationId',
    opsApi: 'PUT:/tenants/authentications/{id}',
    newApi: true
  },
  deleteTenantAuthentications: {
    method: 'delete',
    url: '/tenants/authentications/:authenticationId',
    newApi: true
  },
  // acceptRejectInvitation: {
  //   method: 'put',
  //   url: '/api/tenant/:tenantId/delegation/:delegationId'
  // }
  getAdminGroups: {
    method: 'get',
    url: '/groups',
    newApi: true
  },
  addAdminGroups: {
    method: 'post',
    url: '/groups',
    opsApi: 'POST:/groups',
    newApi: true
  },
  updateAdminGroups: {
    method: 'PATCH',
    url: '/groups/:groupId',
    opsApi: 'PATCH:/groups/{id}',
    newApi: true
  },
  deleteAdminGroups: {
    method: 'delete',
    url: '/groups',
    opsApi: 'DELETE:/groups',
    newApi: true
  },
  getAdminGroupLastLogins: {
    method: 'get',
    url: '/events/adminGroups/:adminGroupId/latestLogins',
    newApi: true
  },
  getCustomRoles: {
    method: 'get',
    url: '/roleAuthentications/customRoles',
    opsApi: 'GET:/roleAuthentications/customRoles',
    newApi: true
  },
  addCustomRole: {
    method: 'post',
    url: '/roleAuthentications/customRoles',
    opsApi: 'POST:/roleAuthentications/customRoles',
    newApi: true
  },
  updateCustomRole: {
    method: 'put',
    url: '/roleAuthentications/customRoles/:customRoleId',
    opsApi: 'PUT:/roleAuthentications/customRoles/{id}',
    newApi: true
  },
  deleteCustomRole: {
    method: 'delete',
    url: '/roleAuthentications/customRoles/:customRoleId',
    opsApi: 'DELETE:/roleAuthentications/customRoles/{id}',
    newApi: true
  },
  getCustomRoleFeatures: {
    method: 'get',
    url: '/roleAuthentications/features?showScopes=false',
    newApi: true
  },
  getOnePrivilegeGroup: {
    method: 'get',
    url: '/roleAuthentications/privilegeGroups/:privilegeGroupId',
    newApi: true
  },
  getPrivilegeGroups: {
    method: 'get',
    url: '/roleAuthentications/privilegeGroups',
    newApi: true
  },
  getPrivilegeGroupsWithAdmins: {
    method: 'get',
    url: '/roleAuthentications/privilegeGroups?withAdmins=true',
    newApi: true
  },
  addPrivilegeGroup: {
    method: 'post',
    url: '/roleAuthentications/privilegeGroups',
    opsApi: 'POST:/roleAuthentications/privilegeGroups',
    newApi: true
  },
  updatePrivilegeGroup: {
    method: 'put',
    url: '/roleAuthentications/privilegeGroups/:privilegeGroupId',
    opsApi: 'PUT:/roleAuthentications/privilegeGroups/{id}',
    newApi: true
  },
  deletePrivilegeGroup: {
    method: 'delete',
    url: '/roleAuthentications/privilegeGroups/:privilegeGroupId',
    opsApi: 'DELETE:/roleAuthentications/privilegeGroups/{id}',
    newApi: true
  },
  getNotificationSms: {
    method: 'get',
    url: '/notifications/sms',
    newApi: true
  },
  updateNotificationSms: {
    method: 'post',
    url: '/notifications/sms',
    opsApi: 'POST:/notifications/sms',
    newApi: true
  },
  getNotificationSmsProvider: {
    method: 'get',
    url: '/notifications/sms/providers/:provider',
    newApi: true
  },
  updateNotificationSmsProvider: {
    method: 'post',
    url: '/notifications/sms/providers/:provider',
    newApi: true
  },
  deleteNotificationSmsProvider: {
    method: 'delete',
    url: '/notifications/sms/providers/:provider',
    newApi: true
  },
  getTwiliosIncomingPhoneNumbers: {
    method: 'post',
    url: '/notifications/sms/providers/twilios/incomingPhoneNumbers',
    newApi: true
  },
  getTwiliosMessagingServices: {
    method: 'post',
    url: '/notifications/sms/providers/twilios/messagingServices',
    newApi: true
  },
  getTwiliosWhatsappServices: {
    method: 'post',
    url: '/notifications/sms/providers/twilios/templateApprovalStatus',
    newApi: true
  },
  getWebhooks: {
    method: 'post',
    url: '/webhooks/query',
    opsApi: 'POST:/webhooks/query',
    newApi: true
  },
  getWebhookEntry: {
    method: 'get',
    url: '/webhooks/:webhookId',
    newApi: true
  },
  addWebhook: {
    method: 'post',
    url: '/webhooks',
    opsApi: 'POST:/webhooks',
    newApi: true
  },
  updateWebhook: {
    method: 'put',
    url: '/webhooks/:webhookId',
    opsApi: 'PUT:/webhooks/{id}',
    newApi: true
  },
  deleteWebhook: {
    method: 'delete',
    url: '/webhooks/:webhookId',
    opsApi: 'DELETE:/webhooks/{id}',
    newApi: true
  },
  webhookSendSampleEvent: {
    method: 'post',
    url: '/webhooks/sendSampleEvents',
    newApi: true
  },
  getPrivacySettings: {
    method: 'get',
    url: '/tenants/privacySettings',
    opsApi: 'GET:/tenants/privacySettings',
    newApi: true
  },
  updatePrivacySettings: {
    method: 'PATCH',
    url: '/tenants/privacySettings',
    newApi: true
  },
  deleteTenant: {
    method: 'delete',
    url: '/api/nuketenant/tenants/:tenantId',
    newApi: true
  }
}
