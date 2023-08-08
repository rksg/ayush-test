import { UserProfile } from '@acx-ui/user'

import { hasAdministratorTab } from './administration'

describe('hasAdministratorTab', () => {
  const emptyProfile = {} as UserProfile
  const mockedProfile = {
    region: '[NA]',
    allowedRegions: [
      {
        name: 'US',
        description: 'United States of America',
        link: 'https://dev.ruckus.cloud',
        current: true
      }
    ],
    externalId: 'mocked-external-id',
    pver: 'ruckus-one',
    companyName: 'Dog Company mocked',
    firstName: 'FisrtName mocked',
    lastName: 'LastName mocked',
    username: 'mocked-tenant@email.com',
    role: 'PRIME_ADMIN',
    roles: ['PRIME_ADMIN'],
    detailLevel: 'debug',
    dateFormat: 'mm/dd/yyyy',
    email: 'mocked-tenant@email.com',
    var: false,
    tenantId: 'mocked-tenant-id',
    varTenantId: 'mocked-tenant-id',
    adminId: 'mocked-admin-id',
    support: false,
    dogfood: false
  } as UserProfile

  it('should be able to access by default', () => {
    const allUndefined = hasAdministratorTab(undefined, undefined)
    expect(allUndefined).toBe(true)

    const undefinedProfile = hasAdministratorTab(undefined, 'mocked-tenant-id')
    expect(undefinedProfile).toBe(true)

    const undefinedTenantID = hasAdministratorTab(mockedProfile, undefined)
    expect(undefinedTenantID).toBe(true)

    const invalidProfile = hasAdministratorTab(emptyProfile, undefined)
    expect(invalidProfile).toBe(true)

    const invalidProfile2 = hasAdministratorTab(emptyProfile, 'mocked-tenant-id')
    expect(invalidProfile2).toBe(true)
  })

  it('should correctly determine accessibility', () => {
    const result = hasAdministratorTab(mockedProfile, 'mocked-tenant-id')
    expect(result).toBe(true)

    const mockedProfile2 = { ...mockedProfile, varTenantId: 'other-id' }
    const result2 = hasAdministratorTab(mockedProfile2, 'mocked-tenant-id')
    expect(result2).toBe(true)
  })

  it('dogfood account is not allowed to access administrator', () => {
    const mockedDogFoodProfile = { ...mockedProfile, dogfood: true }
    const result = hasAdministratorTab(mockedDogFoodProfile, 'mocked-tenant-id')
    expect(result).toBe(false)
  })

  it('support delegate to dogfood is not allowed to access administrator', () => {
    const mockedDogFoodProfile = { ...mockedProfile, delegatedDogfood: true }
    const result = hasAdministratorTab(mockedDogFoodProfile, 'mocked-tenant-id')
    expect(result).toBe(false)
  })

  it('REC account is allowed to access administrator', () => {
    const result = hasAdministratorTab(mockedProfile, 'mocked-tenant-id')
    expect(result).toBe(true)
  })

  it('MSP delegate to EC is allowed to access administrator', () => {
    const mockedDelegatedProfile = { ...mockedProfile, varTenantId: 'msp-tenant-id' }
    const result = hasAdministratorTab(mockedDelegatedProfile, 'mocked-tenant-id')
    expect(result).toBe(true)
  })
})