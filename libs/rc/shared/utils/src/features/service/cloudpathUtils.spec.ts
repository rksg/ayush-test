import { RolesEnum, ScopeKeys }           from '@acx-ui/types'
import { getUserProfile, setUserProfile } from '@acx-ui/user'

import { hasCloudpathAccess } from './cloudpathUtils'

function setRole (roles: RolesEnum[] | RolesEnum, abacEnabled?: boolean, isCustomRole?:boolean,
  scopes?:ScopeKeys) {
  const profile = getUserProfile()
  setUserProfile({
    ...profile,
    profile: {
      ...profile.profile,
      roles: Array.isArray(roles) ? roles : [roles]
    },
    allowedOperations: [],
    accountTier: '',
    betaEnabled: false,
    abacEnabled: abacEnabled ?? false,
    isCustomRole,
    scopes
  })
}
describe('cloudpathUtils', () => {

  describe('execute hasCloudpathAccess correctly with different Roles', () => {
    // eslint-disable-next-line max-len
    it('should disallow the user without RolesEnum.ADMINISTRATOR or RolesEnum.PRIME_ADMIN roles', () => {
      setRole(RolesEnum.READ_ONLY)
      expect(hasCloudpathAccess()).toBeFalsy()
      setRole(RolesEnum.DPSK_ADMIN)
      expect(hasCloudpathAccess()).toBeFalsy()
      setRole(RolesEnum.GUEST_MANAGER)
      expect(hasCloudpathAccess()).toBeFalsy()
      setRole([])
      expect(hasCloudpathAccess()).toBeFalsy()
    })

    it('should allow the user with RolesEnum.ADMINISTRATOR or RolesEnum.PRIME_ADMIN', () => {
      setRole(RolesEnum.ADMINISTRATOR)
      expect(hasCloudpathAccess()).toBeTruthy()
      setRole(RolesEnum.PRIME_ADMIN)
      expect(hasCloudpathAccess()).toBeTruthy()
      setRole([RolesEnum.ADMINISTRATOR, RolesEnum.PRIME_ADMIN])
      expect(hasCloudpathAccess()).toBeTruthy()
    })
  })
})
