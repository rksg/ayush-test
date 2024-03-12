import { find } from 'lodash'

import { getUserProfile }  from '@acx-ui/analytics/utils'
import { LayoutProps }     from '@acx-ui/components'
import { useIsSplitOn }    from '@acx-ui/feature-toggle'
import { useSearchParams } from '@acx-ui/react-router-dom'
import { renderHook }      from '@acx-ui/test-utils'


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
const defaultMockPermissions = {
  'view-analytics': true,
  'view-report-controller-inventory': true,
  'view-data-explorer': true,
  'manage-service-guard': true,
  'manage-call-manager': true,
  'manage-mlisa': true,
  'manage-occupancy': true,
  'manage-label': true,
  'manage-tenant-settings': true,
  'manage-config-recommendation': true,
  'franchisor': true
}
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
      'view-analytics': false
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
  it('should not return Data Explorerer', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    const mockPermissions = {
      ...defaultMockPermissions,
      'view-data-explorer': false
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
      'manage-service-guard': false,
      'manage-call-manager': false,
      'manage-config-recommendation': false
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
      'manage-mlisa': false,
      'manage-label': false,
      'franchisor': false
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
  it('should not return Administration-related menu items for manage-mlisa', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    const mockPermissions = {
      ...defaultMockPermissions,
      'manage-mlisa': false
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
  it('should not return Administration-related menu items for manage-label', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    const mockPermissions = {
      ...defaultMockPermissions,
      'manage-label': false
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
  it('should not open new tab for users page if ruckus-ai-users-toggle is enabled', () => {
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
      openNewTab: false,
      uri: '/analytics/admin/users'
    }
    const match = find(flattenConfig(result.current), target)
    expect(match).toMatchObject(target)
  })
  it('should open new tab for users page if ruckus-ai-users-new-roles-toggle is disabled', () => {
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
      openNewTab: true,
      uri: '/analytics/admin/users'
    }
    const match = find(flattenConfig(result.current), target)
    expect(match).toMatchObject(target)
  })
})
