export interface ApplicationPolicyMgmt {
  currentVersion: string,
  currentUpdatedDate: string,
  latestVersion: string,
  latestReleasedDate: string,
  changedApplication?: ApplicationInfo[]
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
export enum ApplicationConfirmType {
  NEW_APP_ONLY = 'New APP only',
  REMOVED_APP_ONLY = 'Removed APP only',
  UPDATED_APP_ONLY = 'Updated APP',
  UPDATED_APPS = 'Updated APPS',
  UPDATED_REMOVED_APPS = 'Updated and removed APPS'
}
export enum ApplicationUpdateType {
  APPLICATION_ADDED = 'APPLICATION_ADDED',
  APPLICATION_REMOVED = 'APPLICATION_REMOVED',
  APPLICATION_UPDATED = 'APPLICATION_UPDATED',
  APPLICATION_RENAMED = 'APPLICATION_RENAMED',
  APPLICATION_MERGED = 'APPLICATION_MERGED'
}
