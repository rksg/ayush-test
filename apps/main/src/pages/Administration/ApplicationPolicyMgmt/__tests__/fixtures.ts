export const successResponse = {
  requestId: 'request-id'
}

export const sigPackData = {
  currentVersion: '6.2.1.103.1580',
  currentUpdatedDate: '2022-12-16T06:22:23.337+0000',
  changedApplications: [
    {
      type: 'APPLICATION_ADDED',
      applicationId: null,
      applicationName: null,
      categoryId: null,
      categoryName: null,
      toApplicationId: 12,
      toApplicationName: 'ADDED_APP',
      toCategoryId: 1,
      toCategoryName: '12',
      impactedItems: [{
        applicationPolicyId: 'p1',
        applicationPolicyName: 'p11',
        applicationPolicyRuleId: 'p2',
        applicationPolicyRuleName: 'p22'
      }] },
    {
      type: 'APPLICATION_REMOVED',
      applicationId: null,
      applicationName: 'REMOVED_APP',
      categoryId: null,
      categoryName: null,
      toApplicationId: 12,
      toApplicationName: null,
      toCategoryId: 1,
      toCategoryName: '12'
    },
    {
      type: 'CATEGORY_UPDATED',
      applicationId: null,
      applicationName: null,
      categoryId: null,
      categoryName: null,
      toApplicationId: 12,
      toApplicationName: 'UPDATED_APP',
      toCategoryId: 1,
      toCategoryName: 'UPDATED_APP',
      impactedItems: [{
        applicationPolicyId: 'p1',
        applicationPolicyName: 'p11',
        applicationPolicyRuleId: 'p2',
        applicationPolicyRuleName: 'p22'
      }] },
    {
      type: 'APPLICATION_RENAMED',
      applicationId: null,
      applicationName: 'RENAMED_APP',
      categoryId: null,
      categoryName: null,
      toApplicationId: 12,
      toApplicationName: '_APP',
      toCategoryId: 1,
      toCategoryName: '12',
      impactedItems: [{
        applicationPolicyId: 'p1',
        applicationPolicyName: 'p11',
        applicationPolicyRuleId: 'p2',
        applicationPolicyRuleName: 'p22'
      }] },
    {
      type: 'APPLICATION_MERGED',
      applicationId: null,
      applicationName: null,
      categoryId: null,
      categoryName: null,
      toApplicationId: 12,
      toApplicationName: 'MERGED_APP',
      toCategoryId: 1,
      toCategoryName: '12',
      impactedItems: [{
        applicationPolicyId: 'p1',
        applicationPolicyName: 'p11',
        applicationPolicyRuleId: 'p2',
        applicationPolicyRuleName: 'p22'
      }]
    }
  ],
  latestVersion: '6.2.1.103.1580',
  latestReleasedDate: '2023-02-02T06:36:09.359+0000'
}

export const exportMockData={
  data: [
    {
      name: 'test1'
    },
    {
      name: 'test2'
    }
  ]
}
