import { find } from 'lodash'

import { getUserProfile, Tenant }                                from '@acx-ui/analytics/utils'
import { LayoutProps }                                           from '@acx-ui/components'
import { get }                                                   from '@acx-ui/config'
import { Features, useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { useSearchParams }                                       from '@acx-ui/react-router-dom'
import { renderHook }                                            from '@acx-ui/test-utils'
import { RaiPermissions, raiPermissionsList, setRaiPermissions } from '@acx-ui/user'

import { useMenuConfig } from './menuConfig'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn()
}))
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useSearchParams: jest.fn(() => [{ get: jest.fn() }])
}))
jest.mock('@acx-ui/config', () => ({
  ...jest.requireActual('@acx-ui/config'),
  get: jest.fn()
}))

const mockSearchGet = jest.fn()

jest.mock('react-intl', () => {
  const mockDefineMessage = jest.fn((options) => options.defaultMessage)

  return {
    useIntl: jest.fn(() => ({
      $t: mockDefineMessage
    })),
    defineMessage: mockDefineMessage
  }
})
const permissions = Object.keys(raiPermissionsList)
  .filter(v => isNaN(Number(v)))
  .reduce((permissions, name) => ({ ...permissions, [name]: true }), {}) as RaiPermissions

const flattenConfig = (configs: LayoutProps['menuConfig'] | undefined) => {
  if (!configs) return []
  return configs.reduce((acc, config) => {
    if (config) {
      if ('children' in config) {
        acc.push(...flattenConfig(config?.children))
      }
      acc.push(config)
    }
    return acc
  }, [] as typeof configs)
}

const profile: ReturnType<typeof getUserProfile> = {
  accountId: 'accountId',
  firstName: 'firstName',
  lastName: 'lastName',
  email: '',
  userId: '',
  isSupport: false,
  invitations: [],
  selectedTenant: { id: 'accountId', permissions } as Tenant,
  tenants: [{ id: 'accountId', permissions }] as Tenant[]
}

describe('useMenuConfig', () => {
  beforeEach(() => {
    jest.mocked(get).mockReturnValue('true')
    setRaiPermissions(permissions)
    jest.mocked(getUserProfile).mockReturnValue(profile)
  })
  it('should return an array of menu items based on user permissions', () => {
    const mockSearchHook = useSearchParams as jest.Mock
    mockSearchGet.mockReturnValueOnce('WyIwMDE1MDAwMDAwR2xJN1NBQVYiXQ%3D%3D')
    mockSearchHook.mockReturnValue([{
      get: mockSearchGet
    }])
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    expect(result.current).toMatchSnapshot()
  })
  it('should return nothing for empty/no user permission', () => {
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    expect(result.current).toMatchSnapshot()
  })
  it('should not return analytics related menu items', () => {
    setRaiPermissions({
      ...permissions,
      READ_DASHBOARD: false,
      READ_INCIDENTS: false,
      READ_HEALTH: false,
      READ_AI_DRIVEN_RRM: false,
      READ_AI_OPERATIONS: false,
      READ_SERVICE_VALIDATION: false,
      READ_CONFIG_CHANGE: false,
      READ_ACCESS_POINTS_LIST: false,
      READ_SWITCH_LIST: false,
      READ_OCCUPANCY: false,
      READ_INTENT_AI: false
    })
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    expect(result.current).toMatchSnapshot()
  })

  it('should not return app experience', () => {
    setRaiPermissions({
      ...permissions,
      READ_APP_INSIGHTS: false,
      READ_VIDEO_CALL_QOE: false
    })
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    expect(result.current).toMatchSnapshot()
  })
  it('should not return menues under the Business Insights', () => {
    setRaiPermissions({
      ...permissions,
      READ_REPORTS: false,
      READ_OCCUPANCY: false,
      READ_DATA_STUDIO: false,
      READ_DATA_CONNECTOR: false
    })
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    const routes = [
      { uri: '/dataStudio' },
      { uri: '/dataConnector' },
      { uri: '/reports' },
      { uri: '/analytics/occupancy' }
    ]
    const configs = flattenConfig(result.current)
    routes.forEach(route => expect(find(configs, route)).toBeUndefined())
  })
  it('should not return Service Validation & Video Call QoE', () => {
    setRaiPermissions({
      ...permissions,
      READ_SERVICE_VALIDATION: false,
      READ_VIDEO_CALL_QOE: false,
      READ_AI_DRIVEN_RRM: false,
      READ_AI_OPERATIONS: false
    })
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    const routes = [
      { uri: '/serviceValidation' },
      { uri: '/videoCallQoe' }
    ]
    const configs = flattenConfig(result.current)
    routes.forEach(route => expect(find(configs, route)).toBeUndefined())
  })
  it('should return zones menu items', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    const target = {
      uri: '/zones'
    }
    const match = find(flattenConfig(result.current), target)
    expect(match).toMatchObject(target)
  })

  describe('Administration', () => {
    const getPermissions = (enabled: boolean) => ({
      ...permissions,
      READ_ONBOARDED_SYSTEMS: enabled,
      READ_USERS: enabled,
      READ_LABELS: enabled,
      READ_RESOURCE_GROUPS: enabled,
      READ_SUPPORT: enabled,
      READ_LICENSES: enabled,
      READ_REPORT_SCHEDULES: enabled,
      READ_WEBHOOKS: enabled
    })
    const adminRoutes = [
      { uri: '/admin/onboarded' },
      { uri: '/admin/users' },
      { uri: '/analytics/admin/labels', openNewTab: true },
      { uri: '/analytics/admin/resourceGroups', openNewTab: true },
      { uri: '/admin/support' },
      { uri: '/analytics/admin/license', openNewTab: true },
      { uri: '/analytics/admin/schedules', openNewTab: true },
      { uri: '/admin/webhooks' }
    ]
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
    })
    it('should return menu items with permissions to view', () => {
      const permissions = getPermissions(true)
      jest.mocked(getUserProfile).mockReturnValue({
        ...profile,
        selectedTenant: { ...profile.selectedTenant, permissions },
        tenants: [{ ...profile.tenants[0], permissions }]
      })
      setRaiPermissions(permissions)
      const { result } = renderHook(() => useMenuConfig(), { route: true })
      const configs = flattenConfig(result.current)
      adminRoutes.forEach(route => expect(find(configs, route)).toBeDefined())
    })
    it('should not return menu items without permissions to view', () => {
      const permissions = getPermissions(false)
      jest.mocked(getUserProfile).mockReturnValue({
        ...profile,
        selectedTenant: { ...profile.selectedTenant, permissions },
        tenants: [{ ...profile.tenants[0], permissions }]
      })
      setRaiPermissions(permissions)
      const { result } = renderHook(() => useMenuConfig(), { route: true })
      const configs = flattenConfig(result.current)
      adminRoutes.forEach(route => expect(find(configs, route)).toBeUndefined())
    })
    it('shows Developers menu if JWT is enabled', () => {
      jest.mocked(useIsSplitOn).mockImplementation((split) => {
        if (split === Features.RUCKUS_AI_JWT_TOGGLE) return true
        return false
      })
      const permissions = getPermissions(true)
      jest.mocked(getUserProfile).mockReturnValue({
        ...profile,
        selectedTenant: { ...profile.selectedTenant, permissions },
        tenants: [{ ...profile.tenants[0], permissions }]
      })
      setRaiPermissions(permissions)
      const { result } = renderHook(() => useMenuConfig(), { route: true })
      const configs = flattenConfig(result.current)
      const routes = [
        ...adminRoutes.filter(r => r.uri !== '/admin/webhooks'),
        { uri: '/admin/developers/applicationTokens' }
      ]
      routes.forEach(route => expect(find(configs, route)).toBeDefined())
    })
  })
})
