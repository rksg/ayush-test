
import { get }                     from '@acx-ui/config'
import { BrowserRouter as Router } from '@acx-ui/react-router-dom'
import { render, screen }          from '@acx-ui/test-utils'
import {
  ScopeKeys,
  RolesEnum,
  SwitchScopes,
  WifiScopes }               from '@acx-ui/types'
import { AccountTier } from '@acx-ui/utils'

import { CustomRoleType, type RaiPermissions } from './types'
import {
  AuthRoute,
  filterByAccess,
  filterByOperations,
  getShowWithoutRbacCheckKey,
  getUserProfile,
  hasAccess,
  hasRoles,
  hasPermission,
  setRaiPermissions,
  setUserProfile,
  WrapIfAccessible,
  hasRaiPermission,
  isCustomAdmin,
  hasCrossVenuesPermission,
  getUserName,
  hasAllowedOperations
} from './userProfile'


function setRole (props: {
  role: RolesEnum,
  abacEnabled?: boolean,
  isCustomRole?: boolean,
  scopes?: ScopeKeys,
  hasAllVenues?: boolean,
  rbacOpsApiEnabled?: boolean
}) {
  const profile = getUserProfile()
  setUserProfile({
    ...profile,
    profile: {
      ...profile.profile,
      roles: [props.role]
    },
    allowedOperations: ['GET:/networks', 'GET:/switches'],
    accountTier: '',
    betaEnabled: false,
    abacEnabled: props.abacEnabled ?? false,
    isCustomRole: props.isCustomRole,
    rbacOpsApiEnabled: props.rbacOpsApiEnabled,
    scopes: props.scopes,
    hasAllVenues: props.hasAllVenues ?? true
  })
}

jest.mock('@acx-ui/config', () => ({ get: jest.fn().mockReturnValue('') }))
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  TenantNavigate: () => <div data-testid='no-permissions' />
}))

beforeEach(() => jest.mocked(get).mockReset())

describe('hasAccess', () => {
  describe('without id', () => {
    it('allow admins', () => {
      setRole({ role: RolesEnum.PRIME_ADMIN })
      expect(hasAccess()).toBe(true)
      setRole({ role: RolesEnum.ADMINISTRATOR })
      expect(hasAccess()).toBe(true)
      setRole({ role: RolesEnum.DPSK_ADMIN })
      expect(hasAccess()).toBe(true)
    })
    it('block guest manager & read-only', () => {
      setRole({ role: RolesEnum.GUEST_MANAGER })
      expect(hasAccess()).toBe(false)
      setRole({ role: RolesEnum.READ_ONLY })
      expect(hasAccess()).toBe(false)
    })
    it('returns true for IS_MLISA_SA', () => {
      jest.mocked(get).mockReturnValue('true')
      expect(hasAccess()).toBe(true)
    })
  })

  describe('when id in allowedOperations', () => {
    it('allow when operation in allowedOperations', () => {
      setRole({ role: RolesEnum.READ_ONLY, rbacOpsApiEnabled: true })
      expect(hasAccess({ rbacOpsIds: ['GET:/networks'] })).toBe(true)
      expect(hasAllowedOperations(['GET:/networks'])).toBe(true)
    })

    it('allow when the given operations is empty', () => {
      setRole({ role: RolesEnum.READ_ONLY, rbacOpsApiEnabled: true })
      expect(hasAccess({ rbacOpsIds: [] })).toBe(true)
      expect(hasAllowedOperations([])).toBe(true)
    })

    it('block when operation NOT in allowedOperations', () => {
      setRole({ role: RolesEnum.READ_ONLY, rbacOpsApiEnabled: true })
      expect(hasAccess({ rbacOpsIds: ['GET:/venues'] })).toBe(false)
      expect(hasAllowedOperations(['GET:/venues'])).toBe(false)
    })
  })
})

describe('hasRoles', () => {
  beforeEach(() => setRole({ role: RolesEnum.ADMINISTRATOR }))

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

  it('check roles with enable abac', () => {
    const profile = getUserProfile()
    setUserProfile({
      ...profile,
      profile: {
        ...profile.profile,
        roles: ['NEW_USER'],
        customRoleType: CustomRoleType.SYSTEM,
        customRoleName: 'PRIME_ADMIN'
      },
      allowedOperations: ['GET:/networks', 'GET:/switches'],
      accountTier: '',
      betaEnabled: false,
      abacEnabled: true,
      rbacOpsApiEnabled: false,
      isCustomRole: false,
      scopes: []
    })


    expect(hasRoles([
      RolesEnum.PRIME_ADMIN,
      RolesEnum.ADMINISTRATOR,
      RolesEnum.DPSK_ADMIN
    ])).toBe(true)

    expect(hasRoles([
      RolesEnum.READ_ONLY
    ])).toBe(false)


  })
})

describe('isCustomAdmin', () => {
  beforeEach(() => setRole({ role: RolesEnum.ADMINISTRATOR }))
  it('check system admin', () => {
    expect(isCustomAdmin()).toBe(false)
  })
  it('check custom admin', () => {
    const profile = getUserProfile()
    setUserProfile({
      ...profile,
      profile: {
        ...profile.profile,
        roles: ['NEW_USER'],
        customRoleType: CustomRoleType.SYSTEM,
        customRoleName: RolesEnum.ADMINISTRATOR
      },
      allowedOperations: ['GET:/networks', 'GET:/switches'],
      accountTier: '',
      betaEnabled: false,
      abacEnabled: true,
      isCustomRole: false,
      scopes: []
    })
    expect(isCustomAdmin()).toBe(true)
  })
})

describe('hasCrossVenuesPermission', () => {
  beforeEach(() => setRole({ role: RolesEnum.ADMINISTRATOR }))
  it('check permissions for All Venues', () => {
    const profile = getUserProfile()
    setUserProfile({
      ...profile,
      abacEnabled: true,
      hasAllVenues: true
    })
    expect(hasCrossVenuesPermission()).toBe(true)
  })
  it('check permissions for Specific Venues', () => {
    const profile = getUserProfile()
    setUserProfile({
      ...profile,
      abacEnabled: true,
      hasAllVenues: false
    })
    expect(hasCrossVenuesPermission()).toBe(false)
  })

  it('check permissions for ABAC disabled', () => {
    const profile = getUserProfile()
    setUserProfile({
      ...profile,
      abacEnabled: false
    })
    expect(hasCrossVenuesPermission()).toBe(true)
  })

  it('check permissions for RA standalone', () => {
    jest.mocked(get).mockReturnValue('true') // get('IS_MLISA_SA')
    expect(hasCrossVenuesPermission()).toBe(true)
  })

  it('check permissions for needGlobalPermission', () => {
    const profile = getUserProfile()
    setUserProfile({
      ...profile,
      abacEnabled: true,
      hasAllVenues: true,
      isCustomRole: false
    })
    expect(hasCrossVenuesPermission({ needGlobalPermission: true })).toBe(true)
  })
})

describe('filterByAccess', () => {
  it('filter based on logic of hasAccess', () => {
    const items = [
      { key: 'random-key' },
      {}
    ]

    setRole({ role: RolesEnum.PRIME_ADMIN })
    expect(filterByAccess(items)).toHaveLength(2)

    setRole({ role: RolesEnum.ADMINISTRATOR })
    expect(filterByAccess(items)).toHaveLength(2)

    setRole({ role: RolesEnum.GUEST_MANAGER })
    expect(filterByAccess(items)).toHaveLength(0)

    setRole({ role: RolesEnum.READ_ONLY })
    expect(filterByAccess(items)).toHaveLength(0)
  })

  it('allow when id is generated by getShowWithoutRbacCheckKey function', () => {
    expect(filterByAccess([
      {
        key: getShowWithoutRbacCheckKey('test')
      }
    ])).toHaveLength(1)
  })

  it('returns true when IS_MLISA_SA for any role', () => {
    const items = [
      { key: 'random-key' },
      {}
    ]

    jest.mocked(get).mockReturnValue('true')

    setRole({ role: RolesEnum.PRIME_ADMIN })
    expect(filterByAccess(items)).toHaveLength(2)

    setRole({ role: RolesEnum.ADMINISTRATOR })
    expect(filterByAccess(items)).toHaveLength(2)

    setRole({ role: RolesEnum.GUEST_MANAGER })
    expect(filterByAccess(items)).toHaveLength(2)

    setRole({ role: RolesEnum.READ_ONLY })
    expect(filterByAccess(items)).toHaveLength(2)
  })
})


describe('filterByOperations', () => {
  it('filter based on logic of filterByOperations', () => {
    const items = [
      { key: 'random-key', rbacOpsIds: ['GET:/switches'] },
      { rbacOpsIds: ['GET:/edges'] }
    ]

    setRole({ role: RolesEnum.PRIME_ADMIN })
    expect(filterByOperations(items)).toHaveLength(2)

    setRole({ role: RolesEnum.READ_ONLY })
    expect(filterByOperations(items)).toHaveLength(2)

    setRole({ role: RolesEnum.READ_ONLY, rbacOpsApiEnabled: true })
    expect(filterByOperations(items)).toHaveLength(1)
  })

  it('filter based on logic of filterByOperations and rbacOpsApiEnabled', () => {
    const MockComponent = (props: { rbacOpsIds: string[] }) => <div children={props.rbacOpsIds}/>

    const items = [
      <MockComponent rbacOpsIds={['GET:/switches']}/>,
      <MockComponent rbacOpsIds={['GET:/edges']}/>
    ]

    setRole({ role: RolesEnum.READ_ONLY, rbacOpsApiEnabled: true })
    expect(filterByOperations(items)).toHaveLength(1)
  })

  it('allow when id is generated by getShowWithoutRbacCheckKey function', () => {
    expect(filterByAccess([
      {
        key: getShowWithoutRbacCheckKey('test')
      }
    ])).toHaveLength(1)

    setRole({ role: RolesEnum.PRIME_ADMIN, rbacOpsApiEnabled: true })
    expect(filterByAccess([
      {
        key: getShowWithoutRbacCheckKey('test')
      }
    ])).toHaveLength(1)
  })

  it('returns true when IS_MLISA_SA for any role', () => {
    const items = [
      { key: 'random-key', rbacOpsIds: ['GET:/switches'] },
      { rbacOpsIds: ['GET:/edges'] }
    ]

    jest.mocked(get).mockReturnValue('true')

    setRole({ role: RolesEnum.PRIME_ADMIN, rbacOpsApiEnabled: true })
    expect(filterByOperations(items)).toHaveLength(2)

    setRole({ role: RolesEnum.READ_ONLY, rbacOpsApiEnabled: true })
    expect(filterByOperations(items)).toHaveLength(2)

  })
})

describe('hasRaiPermission', () => {
  it('returns true in R1', () => {
    jest.mocked(get).mockReturnValue('')
    setRaiPermissions({ READ_INCIDENTS: false } as RaiPermissions)
    expect(hasRaiPermission('READ_INCIDENTS')).toBe(true)
  })
  it('checks if permission is present', () => {
    jest.mocked(get).mockReturnValue('true')
    setRaiPermissions({ READ_INCIDENTS: true, READ_HEALTH: false } as RaiPermissions)
    expect(hasRaiPermission('READ_INCIDENTS')).toBe(true)
    expect(hasRaiPermission('READ_HEALTH')).toBe(false)
  })
})

describe('hasPermission', () => {
  beforeEach(() => setRole({ role: RolesEnum.ADMINISTRATOR }))

  describe('ABAC FF disabled', () => {
    it('check ADMIN user permission', () => {
      expect(hasPermission()).toBe(true)
      expect(hasPermission({ scopes: [], rbacOpsIds: ['GET:/networks'] })).toBe(true)
      expect(hasPermission({ scopes: [], rbacOpsIds: ['GET:/edges'] })).toBe(true)
    })
    it('check READ ONLY user permission', () => {
      setRole({ role: RolesEnum.READ_ONLY, rbacOpsApiEnabled: true })
      expect(hasPermission()).toBe(true)
      expect(hasPermission({ rbacOpsIds: ['GET:/networks'] })).toBe(true)
      expect(hasPermission({ rbacOpsIds: ['GET:/edges'] })).toBe(false)
      expect(
        hasPermission({ scopes: [SwitchScopes.DELETE], rbacOpsIds: ['GET:/networks'] })
      ).toBe(true)
    })
  })

  describe('ABAC FF enabled', () => {
    it('check ADMIN user permission', () => {
      setRole({ role: RolesEnum.ADMINISTRATOR, abacEnabled: true, rbacOpsApiEnabled: true })
      expect(hasPermission()).toBe(true)
      expect(hasPermission({ rbacOpsIds: ['GET:/switches'] })).toBe(true)
      expect(hasPermission({ rbacOpsIds: ['GET:/edges'] })).toBe(false)
      expect(hasPermission({ scopes: [], rbacOpsIds: ['GET:/networks'] })).toBe(true)
      expect(hasPermission({ scopes: [], rbacOpsIds: ['GET:/edges'] })).toBe(false)
    })

    it('check not CUSTOM user permission', () => {
      setRole({
        role: RolesEnum.ADMINISTRATOR,
        abacEnabled: true,
        isCustomRole: false,
        rbacOpsApiEnabled: false })

      expect(hasPermission()).toBe(true)
      expect(hasPermission({ rbacOpsIds: ['GET:/switches'] })).toBe(true)
      expect(hasPermission({ rbacOpsIds: ['GET:/edges'] })).toBe(true)
      expect(hasPermission({ scopes: [], rbacOpsIds: ['GET:/networks'] })).toBe(true)
      expect(hasPermission({ scopes: [], rbacOpsIds: ['GET:/edges'] })).toBe(true)
      expect(hasAllowedOperations(['GET:/edges'])).toBe(true)
    })

    it('check CUSTOM user permission', () => {
      setRole({
        role: 'CUSTOM USER' as RolesEnum,
        abacEnabled: true,
        isCustomRole: true,
        scopes: [SwitchScopes.READ, WifiScopes.READ],
        rbacOpsApiEnabled: false
      })
      expect(hasPermission()).toBe(true)
      expect(hasPermission({ scopes: [], rbacOpsIds: ['GET:/networks'] })).toBe(true)
      expect(
        hasPermission({ scopes: [SwitchScopes.READ] })
      ).toBe(true)
      expect(
        hasPermission({ scopes: [SwitchScopes.DELETE] })
      ).toBe(false)
      expect(
        hasPermission({ scopes: [[SwitchScopes.READ, WifiScopes.READ]] })
      ).toBe(true)
      expect(
        hasPermission({
          scopes: [[SwitchScopes.READ, WifiScopes.READ]],
          rbacOpsIds: ['GET:/edges']
        })
      ).toBe(true)
      expect(
        hasPermission({ scopes: [[SwitchScopes.READ, WifiScopes.READ], SwitchScopes.DELETE] })
      ).toBe(true)
      expect(
        hasPermission({ scopes: [[SwitchScopes.READ, WifiScopes.UPDATE]] })
      ).toBe(false)
    })

    it('check CUSTOM user permission with allowedOprations API', () => {
      setRole({
        role: 'CUSTOM USER' as RolesEnum,
        abacEnabled: true,
        isCustomRole: true,
        scopes: [SwitchScopes.READ, WifiScopes.READ],
        rbacOpsApiEnabled: true
      })
      expect(hasPermission()).toBe(true)
      expect(hasCrossVenuesPermission()).toBe(true)
      expect(hasPermission({ rbacOpsIds: ['GET:/switches'] })).toBe(true)
      expect(hasPermission({ rbacOpsIds: ['GET:/edges'] })).toBe(false)
      expect(hasPermission({ scopes: [SwitchScopes.READ] })).toBe(true)
      expect(hasPermission({ scopes: [], rbacOpsIds: ['GET:/networks'] })).toBe(true)
      expect(hasPermission({ scopes: [], rbacOpsIds: ['GET:/edges'] })).toBe(false)
      expect(
        hasPermission({ scopes: [SwitchScopes.READ], rbacOpsIds: ['GET:/switches'] })
      ).toBe(true)
      expect(
        hasPermission({ scopes: [SwitchScopes.DELETE], rbacOpsIds: ['GET:/switches'] })
      ).toBe(true)
    })
  })

  it('checks RAI permissions', () => {
    jest.mocked(get).mockReturnValue('true')
    setRaiPermissions({ READ_INCIDENTS: true } as RaiPermissions)
    expect(hasPermission()).toBe(false)
    expect(hasPermission({ permission: 'READ_INCIDENTS' })).toBe(true)
    expect(hasPermission({ permission: 'WRITE_INCIDENTS' })).toBe(false)
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
    setRole({ role: RolesEnum.READ_ONLY })
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

describe('AuthRoute', () => {
  it('should go to no permissions page for scope', async () => {
    setRole({
      role: RolesEnum.READ_ONLY,
      abacEnabled: true,
      isCustomRole: true,
      scopes: [SwitchScopes.READ]
    })
    render(
      <Router>
        <AuthRoute scopes={[SwitchScopes.UPDATE]}>
          <div>test page</div>
        </AuthRoute>
      </Router>

    )
    expect(await screen.findByTestId('no-permissions')).toBeVisible()
  })

  it('should go to no permissions page for cross venues', async () => {
    setRole({
      role: RolesEnum.ADMINISTRATOR,
      abacEnabled: true,
      isCustomRole: true,
      scopes: [],
      hasAllVenues: false
    })
    render(
      <Router>
        <AuthRoute requireCrossVenuesPermission scopes={[SwitchScopes.CREATE]}>
          <div>test page</div>
        </AuthRoute>
      </Router>

    )
    expect(await screen.findByTestId('no-permissions')).toBeVisible()
  })

  it('should go to correct page for cross venues', async () => {
    setRole({
      role: RolesEnum.ADMINISTRATOR,
      abacEnabled: true,
      isCustomRole: false,
      scopes: [],
      hasAllVenues: true
    })
    render(
      <Router>
        <AuthRoute requireCrossVenuesPermission>
          <div>test page</div>
        </AuthRoute>
      </Router>

    )
    expect(await screen.findByText('test page')).toBeVisible()
  })

  it('should go to no permissions page for global permission', async () => {
    setRole({
      role: RolesEnum.ADMINISTRATOR,
      abacEnabled: true,
      isCustomRole: false,
      scopes: [],
      hasAllVenues: false
    })
    render(
      <Router>
        <AuthRoute requireCrossVenuesPermission={{ needGlobalPermission: true }}>
          <div>test page</div>
        </AuthRoute>
      </Router>

    )
    expect(await screen.findByTestId('no-permissions')).toBeVisible()
  })

  it('should go to correct page for for global permission', async () => {
    setRole({
      role: RolesEnum.ADMINISTRATOR,
      abacEnabled: true,
      isCustomRole: false,
      scopes: [],
      hasAllVenues: true
    })
    render(<Router>
      <AuthRoute requireCrossVenuesPermission={{ needGlobalPermission: true }}>
        <div>test page</div>
      </AuthRoute>
    </Router>

    )
    expect(await screen.findByText('test page')).toBeVisible()
  })

  it('should go to correct page for for global permission with opsAPI', async () => {
    setRole({
      role: RolesEnum.ADMINISTRATOR,
      abacEnabled: true,
      isCustomRole: false,
      scopes: [],
      hasAllVenues: true,
      rbacOpsApiEnabled: true
    })
    render(<Router>
      <AuthRoute
        requireCrossVenuesPermission={{ needGlobalPermission: true }}
        rbacOpsIds={[['GET:/networks', 'GET:/switches' ]]}>
        <div>test page</div>
      </AuthRoute>
    </Router>

    )
    expect(await screen.findByText('test page')).toBeVisible()
  })

  it('should not go to correct page for for global permission with opsAPI', async () => {
    setRole({
      role: RolesEnum.ADMINISTRATOR,
      abacEnabled: true,
      isCustomRole: false,
      scopes: [],
      hasAllVenues: true,
      rbacOpsApiEnabled: true
    })
    render(<Router>
      <AuthRoute
        rbacOpsIds={['GET:/edges']}
        requireCrossVenuesPermission={{ needGlobalPermission: true }}>
        <div>test page</div>
      </AuthRoute>
    </Router>

    )
    expect(await screen.findByTestId('no-permissions')).toBeVisible()
  })

  it('should not go to correct page for Core tier', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: getUserProfile().profile,
      accountTier: AccountTier.CORE
    })
    render(<Router>
      <AuthRoute
        unsupportedTiers={[AccountTier.CORE]}>
        <div>test page</div>
      </AuthRoute>
    </Router>)

    expect(await screen.findByTestId('no-permissions')).toBeVisible()
  })

  it('should go to correct page for support tier', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: getUserProfile().profile,
      accountTier: AccountTier.GOLD
    })
    render(<Router>
      <AuthRoute
        unsupportedTiers={[AccountTier.CORE]}>
        <div>test page</div>
      </AuthRoute>
    </Router>)

    expect(await screen.findByText('test page')).toBeVisible()
  })

  it('should go to correct page for support tier but abacEnabled with custom role', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: getUserProfile().profile,
      abacEnabled: true,
      isCustomRole: true,
      accountTier: AccountTier.GOLD
    })
    render(<Router>
      <AuthRoute
        unsupportedTiers={[AccountTier.CORE]}>
        <div>test page</div>
      </AuthRoute>
    </Router>)

    expect(await screen.findByText('test page')).toBeVisible()
  })

  it('should go to correct page for for correct permission with opsAPI', async () => {
    setRole({
      role: RolesEnum.ADMINISTRATOR,
      abacEnabled: true,
      isCustomRole: false,
      scopes: [],
      hasAllVenues: true,
      rbacOpsApiEnabled: true
    })
    render(<Router>
      <AuthRoute
        rbacOpsIds={['GET:/networks']}
        requireCrossVenuesPermission={{ needGlobalPermission: true }}>
        <div>test page</div>
      </AuthRoute>
    </Router>
    )
    expect(await screen.findByText('test page')).toBeVisible()
  })

  it('should go to correct page for for global permission without rbacOpsIds', async () => {
    setRole({
      role: RolesEnum.ADMINISTRATOR,
      abacEnabled: true,
      isCustomRole: false,
      scopes: [],
      hasAllVenues: true,
      rbacOpsApiEnabled: true
    })
    render(<Router>
      <AuthRoute
        requireCrossVenuesPermission={{ needGlobalPermission: true }}>
        <div>test page</div>
      </AuthRoute>
    </Router>

    )
    expect(await screen.findByText('test page')).toBeVisible()
  })

  it('should go to correct page: custom role', async () => {
    setRole({
      role: RolesEnum.READ_ONLY,
      abacEnabled: true,
      isCustomRole: true,
      scopes: [SwitchScopes.UPDATE]
    })
    render(
      <Router>
        <AuthRoute scopes={[SwitchScopes.UPDATE]}>
          <div>test page</div>
        </AuthRoute>
      </Router>
    )
    expect(await screen.findByText('test page')).toBeVisible()
  })

  it('should go to correct page: system role', async () => {
    setRole({
      role: RolesEnum.PRIME_ADMIN,
      abacEnabled: true,
      isCustomRole: false
    })
    render(
      <Router>
        <AuthRoute scopes={[SwitchScopes.UPDATE]}>
          <div>test page</div>
        </AuthRoute>
      </Router>
    )
    expect(await screen.findByText('test page')).toBeVisible()
  })
})

describe('user name', () => {
  it('check full user name is correct', () => {
    const profile = getUserProfile()
    setUserProfile({
      ...profile,
      profile: {
        ...profile.profile,
        firstName: 'FirstName',
        lastName: 'LastName'
      }
    })

    expect(getUserName()).toBe('FirstName LastName')
  })
})
