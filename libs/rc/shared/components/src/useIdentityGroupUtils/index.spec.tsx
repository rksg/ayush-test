import { PersonaUrls }                    from '@acx-ui/rc/utils'
import { getUserProfile, setUserProfile } from '@acx-ui/user'
import { getOpsApi }                      from '@acx-ui/utils'

import { hasCreateIdentityGroupPermission, hasCreateIdentityPermission } from './index'


describe('useIdentityGroupUtils', () => {
  it('should allow the user to create Identity resource while rbacOpsApiEnabled=false', () => {
    const profile = getUserProfile()
    setUserProfile({
      ...profile,
      abacEnabled: true,
      rbacOpsApiEnabled: false,
      hasAllVenues: true
    })

    expect(hasCreateIdentityGroupPermission()).toBe(true)
    expect(hasCreateIdentityPermission()).toBe(true)
  })

  it('should disallow the user to create Identity resource while rbacOpsApiEnabled=true', () => {
    const profile = getUserProfile()
    setUserProfile({
      ...profile,
      abacEnabled: true,
      rbacOpsApiEnabled: true,
      hasAllVenues: true,
      allowedOperations: []
    })

    expect(hasCreateIdentityGroupPermission()).toBe(false)
    expect(hasCreateIdentityPermission()).toBe(false)
  })

  // eslint-disable-next-line max-len
  it('should allow the user to create Identity resource while rbacOpsApiEnabled=true and has allowedOperations', () => {
    const profile = getUserProfile()
    setUserProfile({
      ...profile,
      abacEnabled: true,
      rbacOpsApiEnabled: true,
      hasAllVenues: true,
      allowedOperations: [
        getOpsApi(PersonaUrls.addPersonaGroup),
        getOpsApi(PersonaUrls.addPersona)
      ]
    })

    expect(hasCreateIdentityGroupPermission()).toBe(true)
    expect(hasCreateIdentityPermission()).toBe(true)
  })
})
