import { render, screen } from '@acx-ui/test-utils'
import { RolesEnum }      from '@acx-ui/types'

import { filterByAccess, getUserProfile, hasAccess, hasRoles, setUserProfile, WrapIfAccessible } from './userProfile'

function setRole (role: RolesEnum) {
  const profile = getUserProfile()
  setUserProfile({ ...profile, profile: { ...profile.profile, roles: [role] } })
}

describe('hasAccess', () => {
  describe('without id', () => {
    it('allow admins', () => {
      setRole(RolesEnum.PRIME_ADMIN)
      expect(hasAccess()).toBe(true)
      setRole(RolesEnum.ADMINISTRATOR)
      expect(hasAccess()).toBe(true)
      setRole(RolesEnum.DPSK_ADMIN)
      expect(hasAccess()).toBe(true)
    })
    it('block guest manager & read-only', () => {
      setRole(RolesEnum.GUEST_MANAGER)
      expect(hasAccess()).toBe(false)
      setRole(RolesEnum.READ_ONLY)
      expect(hasAccess()).toBe(false)
    })
  })

  it('deny when id not defined in allowedOperations', () => {
    expect(hasAccess('random-key')).toBe(false)
  })

  describe('when id defined in map', () => {
    it.todo('allow when operation in allowedOperations')

    it.todo('block when operation NOT in allowedOperations')
  })
})

describe('hasRoles', () => {
  beforeEach(() => setRole(RolesEnum.ADMINISTRATOR))

  it('check role', () => {
    expect(hasRoles(RolesEnum.PRIME_ADMIN)).toBe(false)
    expect(hasRoles(RolesEnum.ADMINISTRATOR)).toBe(true)
    expect(hasRoles(RolesEnum.GUEST_MANAGER)).toBe(false)
    expect(hasRoles(RolesEnum.READ_ONLY)).toBe(false)
  })
  it('check roles', () => {
    expect(hasRoles([RolesEnum.PRIME_ADMIN])).toBe(false)
    expect(hasRoles([RolesEnum.ADMINISTRATOR])).toBe(true)
    expect(hasRoles([RolesEnum.GUEST_MANAGER])).toBe(false)
    expect(hasRoles([RolesEnum.READ_ONLY])).toBe(false)

    expect(hasRoles([
      RolesEnum.PRIME_ADMIN,
      RolesEnum.ADMINISTRATOR,
      RolesEnum.DPSK_ADMIN
    ])).toBe(true)
    expect(hasRoles([
      RolesEnum.ADMINISTRATOR,
      RolesEnum.GUEST_MANAGER
    ])).toBe(true)
    expect(hasRoles([
      RolesEnum.GUEST_MANAGER,
      RolesEnum.READ_ONLY
    ])).toBe(false)
  })
})

describe('filterByAccess', () => {
  it('filter based on logic of hasAccess', () => {
    const items = [
      { key: 'random-key' },
      {}
    ]

    setRole(RolesEnum.PRIME_ADMIN)
    expect(filterByAccess(items)).toHaveLength(2)

    setRole(RolesEnum.ADMINISTRATOR)
    expect(filterByAccess(items)).toHaveLength(2)

    setRole(RolesEnum.GUEST_MANAGER)
    expect(filterByAccess(items)).toHaveLength(1)

    setRole(RolesEnum.READ_ONLY)
    expect(filterByAccess(items)).toHaveLength(1)
  })
})

describe('WrapIfAccessible', () => {
  it('should wrap if user has access', () => {
    render(
      <WrapIfAccessible wrapper={children =>
        <div data-testid='wrapper'>{children}</div>
      }>
        <div>Test</div>
      </WrapIfAccessible>
    )
    expect(screen.getByTestId('wrapper')).toBeVisible()
  })

  it('should not wrap if user does not have access', () => {
    setRole(RolesEnum.READ_ONLY)
    render(
      <WrapIfAccessible wrapper={children =>
        <div data-testid='wrapper'>{children}</div>
      }>
        <div>Test</div>
      </WrapIfAccessible>
    )
    expect(screen.queryByTestId('wrapper')).toBeNull()
  })
})
