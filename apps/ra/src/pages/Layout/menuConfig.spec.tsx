import { find } from 'lodash'

import { getUserProfile, permissions } from '@acx-ui/analytics/utils'
import { LayoutProps }                 from '@acx-ui/components'
import { useIsSplitOn }                from '@acx-ui/feature-toggle'
import { useSearchParams }             from '@acx-ui/react-router-dom'
import { renderHook }                  from '@acx-ui/test-utils'


import { useMenuConfig } from './menuConfig'

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useSearchParams: jest.fn(() => [{ get: jest.fn() }])
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
jest.mock('@acx-ui/analytics/utils', () => (
  {
    ...jest.requireActual('@acx-ui/analytics/utils'),
    getUserProfile: jest.fn()
  }))
const defaultMockPermissions = Object.keys(permissions)
  .reduce((permissions, name) => ({ ...permissions, [name]: true }), {})
const defaultMockUserProfile = {
  accountId: 'accountId',
  selectedTenant: {
    permissions: defaultMockPermissions,
    id: 'accountId'
  },
  tenants: [
    {
      id: 'accountId',
      permissions: defaultMockPermissions
    },
    {
      id: 'accountId2',
      permissions: defaultMockPermissions
    }
  ]
}

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


const manageMlisaRoutes = [
  { uri: '/analytics/admin/onboarded', openNewTab: true },
  { uri: '/analytics/admin/users', openNewTab: true },
  { uri: '/analytics/admin/resourceGroups', openNewTab: true },
  { uri: '/analytics/admin/support', openNewTab: true },
  { uri: '/analytics/admin/license', openNewTab: true },
  { uri: '/analytics/admin/webhooks', openNewTab: true }
]

describe('useMenuConfig', () => {
  it('should return an array of menu items based on user permissions', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    mockUseUserProfileContext.mockReturnValue(defaultMockUserProfile)
    const mockSearchHook = useSearchParams as jest.Mock
    mockSearchGet.mockReturnValueOnce('WyIwMDE1MDAwMDAwR2xJN1NBQVYiXQ%3D%3D')
    mockSearchHook.mockReturnValue([{
      get: mockSearchGet
    }])
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    expect(result.current).toMatchSnapshot()
  })
  it('should return nothing for empty/no user permission', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    mockUseUserProfileContext.mockReturnValue(defaultMockUserProfile)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    expect(result.current).toMatchSnapshot()
  })
  it('should not return Analytics-related menu items', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    const mockPermissions = {
      ...defaultMockPermissions,
      READ_DASHBOARD: false,
      READ_ACCESS_POINTS_LIST: false,
      READ_SWITCH_LIST: false,
      READ_INCIDENTS: false,
      READ_OCCUPANCY: false
    }
    const mockUserProfile = {
      accountId: 'accountId',
      selectedTenant: { permissions: mockPermissions },
      tenants: [
        {
          id: 'accountId',
          permissions: mockPermissions
        }
      ]
    }

    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    expect(result.current).toMatchSnapshot()
  })
  it('should not return Data Studio', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    const mockPermissions = {
      ...defaultMockPermissions,
      READ_DATA_STUDIO: false
    }
    const mockUserProfile = {
      accountId: 'accountId',
      selectedTenant: { permissions: mockPermissions },
      tenants: [
        {
          id: 'accountId',
          permissions: mockPermissions
        }
      ]
    }

    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    const routes = [
      { uri: '/dataStudio' },
      { uri: '/reports' },
      { uri: '/analytics/occupancy' }
    ]
    const configs = flattenConfig(result.current)
    routes.forEach(route => expect(find(configs, route)).toBeUndefined())
  })
  it('should not return Service Validation & Video Call QoE', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    const mockPermissions = {
      ...defaultMockPermissions,
      READ_SERVICE_VALIDATION: false,
      READ_VIDEO_CALL_QOE: false,
      READ_AI_DRIVEN_RRM: false,
      READ_AI_OPERATIONS: false
    }
    const mockUserProfile = {
      accountId: 'accountId',
      selectedTenant: { permissions: mockPermissions },
      tenants: [
        {
          id: 'accountId',
          permissions: mockPermissions
        }
      ]
    }

    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    const routes = [
      { uri: '/serviceValidation' },
      { uri: '/videoCallQoe' }
    ]
    const configs = flattenConfig(result.current)
    routes.forEach(route => expect(find(configs, route)).toBeUndefined())
  })
  it('should not return Administration menu item', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    const mockPermissions = {
      ...defaultMockPermissions,
      READ_ONBOARDED_SYSTEMS: false,
      READ_LABELS: false,
      READ_RESOURCE_GROUPS: false,
      READ_WEBHOOKS: false
    }
    const mockUserProfile = {
      accountId: 'accountId',
      selectedTenant: { permissions: mockPermissions },
      tenants: [
        {
          id: 'accountId',
          permissions: mockPermissions
        }
      ]
    }

    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    const configs = flattenConfig(result.current)
    const adminRoutes = [
      ...manageMlisaRoutes,
      { uri: '/analytics/admin/labels', openNewTab: true }
    ]
    adminRoutes.forEach(route => expect(find(configs, route)).toBeUndefined())
  })
  it('should not return Administration-related menu items', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    const mockPermissions = {
      ...defaultMockPermissions,
      READ_ONBOARDED_SYSTEMS: false,
      READ_LABELS: false,
      READ_RESOURCE_GROUPS: false,
      READ_WEBHOOKS: false
    }
    const mockUserProfile = {
      accountId: 'accountId',
      selectedTenant: { permissions: mockPermissions },
      tenants: [
        {
          id: 'accountId',
          permissions: mockPermissions
        }
      ]
    }
    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    const configs = flattenConfig(result.current)
    manageMlisaRoutes.forEach(route => expect(find(configs, route)).toBeUndefined())
  })
  it('should not return label related menu items', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    const mockPermissions = {
      ...defaultMockPermissions,
      READ_LABELS: false
    }
    const mockUserProfile = {
      accountId: 'accountId',
      selectedTenant: { permissions: mockPermissions },
      tenants: [
        {
          id: 'accountId',
          permissions: mockPermissions
        }
      ]
    }

    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    expect(result.current).toMatchSnapshot()
    const target = { uri: '/analytics/admin/labels', openNewTab: true }
    const match = find(flattenConfig(result.current), target)
    expect(match).toBeUndefined()
  })
  it('should not return zones menu items if ruckus-ai-zones-toggle is not enabled', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const mockUserProfile = {
      accountId: 'accountId',
      selectedTenant: { permissions: defaultMockPermissions },
      tenants: [
        {
          id: 'accountId',
          permissions: defaultMockPermissions
        }
      ]
    }
    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    const target = {
      uri: '/zones'
    }
    const match = find(flattenConfig(result.current), target)
    expect(match).toBeUndefined()
  })
  it('should return zones menu items if ruckus-ai-zones-toggle is enabled', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const mockUserProfile = {
      accountId: 'accountId',
      selectedTenant: { permissions: defaultMockPermissions },
      tenants: [
        {
          id: 'accountId',
          permissions: defaultMockPermissions
        }
      ]
    }
    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    const target = {
      uri: '/zones'
    }
    const match = find(flattenConfig(result.current), target)
    expect(match).toMatchObject(target)
  })
})
