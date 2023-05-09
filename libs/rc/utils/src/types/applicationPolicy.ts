export interface ApplicationPolicyMgmt {
  currentVersion: string,
  currentUpdateDate: string,
  latestVersion: string,
  latestReleaseDate: string,
  changedApplication: ApplicationInfo[]
}
export interface ApplicationInfo {
  // eslint-disable-next-line max-len
  type: 'APPLICATION_ADDED' | 'APPLICATION_REMOVED' | 'APPLICATION_UPDATED' | 'APPLICATION_RENAMED' | 'APPLICATION_MERGED',
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
