export interface ApplicationPolicyMgmt {
  currentVersion: string,
  currentUpdatedDate: string,
  currentReleasedDate: string,
  latestVersion: string,
  latestReleasedDate: string,
  changedApplications?: ApplicationInfo[]
}
export interface ApplicationInfo {
  // eslint-disable-next-line max-len
  type: ApplicationUpdateType,
  applicationId: number,
  applicationName: string,
  categoryId: number,
  categoryName: string,
  toApplicationId: number,
  toApplicationName: string,
  toCategoryId: number,
  toCategoryName: string,
  impactedItems:ImpactedItems[]
}
export interface ImpactedItems {
  applicationPolicyId: string,
  applicationPolicyName: string,
  applicationPolicyRuleId: string,
  applicationPolicyRuleName: string
}
// Refer to wireframe: https://5geg07.axshare.com/?id=cygmtm&p=confirmation_modals&g=1&code=9ba7babe4ec577148de9354ed5485144
export enum ApplicationConfirmType {
  NEW_APP_ONLY = 'New APP only', // E
  REMOVED_APP_ONLY = 'Removed APP only', // D
  UPDATED_APP_ONLY = 'Updated APP', // C
  UPDATED_APPS = 'Updated APPS', // A
  UPDATED_REMOVED_APPS = 'Updated and removed APPS' // B
}
export enum ApplicationUpdateType {
  APPLICATION_ADDED = 'APPLICATION_ADDED',
  APPLICATION_REMOVED = 'APPLICATION_REMOVED',
  CATEGORY_UPDATED = 'CATEGORY_UPDATED',
  APPLICATION_RENAMED = 'APPLICATION_RENAMED',
  APPLICATION_MERGED = 'APPLICATION_MERGED'
}
