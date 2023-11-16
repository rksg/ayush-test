import { getUserProfile } from '@acx-ui/analytics/utils'
import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { renderHook }     from '@acx-ui/test-utils'


import { useMenuConfig } from './menuConfig'

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

describe('useMenuConfig', () => {
  it('should return an array of menu items based on user permissions', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    mockUseUserProfileContext.mockReturnValue(defaultMockUserProfile)
    const { result } = renderHook(() => useMenuConfig())
    expect(result.current).toMatchSnapshot()
  })
  it('should return nothing for empty/no user permission', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    mockUseUserProfileContext.mockReturnValue(defaultMockUserProfile)
    const { result } = renderHook(() => useMenuConfig())
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
    const { result } = renderHook(() => useMenuConfig())
    expect(result.current).toMatchSnapshot()
  })
  it('should not return Config Change, Service Validation & Video Call QoE', () => {
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
    const { result } = renderHook(() => useMenuConfig())
    expect(result.current).toMatchSnapshot()
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
    const { result } = renderHook(() => useMenuConfig())
    expect(result.current).toMatchSnapshot()
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
    const { result } = renderHook(() => useMenuConfig())
    expect(result.current).toMatchSnapshot()
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
    const { result } = renderHook(() => useMenuConfig())
    expect(result.current).toMatchSnapshot()
  })
  it('should not return Administration-related menu items for franchisor setting', () => {
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    const mockPermissions = {
      ...defaultMockPermissions,
      franchisor: false
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
    const { result } = renderHook(() => useMenuConfig())
    expect(result.current).toMatchSnapshot()
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
    const { result } = renderHook(() => useMenuConfig())
    expect(result.current).toMatchSnapshot()
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
    const { result } = renderHook(() => useMenuConfig())
    expect(result.current).toMatchSnapshot()
  })
})
