import { useUserProfileContext } from '@acx-ui/analytics/utils'
import { renderHook }            from '@acx-ui/test-utils'


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
    useUserProfileContext: jest.fn()
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
  'manage-config-recommendation': true
}
const mockSettings = { franchisor: true }
describe('useMenuConfig', () => {
  it('should return an array of menu items based on user permissions', () => {
    const mockUseUserProfileContext = useUserProfileContext as jest.Mock
    const mockUserProfile = {
      data: {
        accountId: 'accountId',
        tenants: [
          {
            id: 'accountId',
            permissions: defaultMockPermissions,
            settings: mockSettings
          },
          {
            id: 'accountId2',
            permissions: defaultMockPermissions,
            settings: mockSettings
          }
        ]
      }
    }
    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    const { result } = renderHook(() => useMenuConfig())
    expect(result.current).toMatchSnapshot()
  })
  it('should return nothing for empty/no user permission', () => {
    const mockUseUserProfileContext = useUserProfileContext as jest.Mock
    const mockUserProfile = {
      data: {
        accountId: 'accountId',
        tenants: [
          {
            id: 'accountId',
            permissions: [],
            settings: []
          },
          {
            id: 'accountId2',
            permissions: [],
            settings: []
          }
        ]
      }
    }
    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    const { result } = renderHook(() => useMenuConfig())
    expect(result.current).toMatchSnapshot()
  })
  it('should not return Analytics-related menu items', () => {
    const mockUseUserProfileContext = useUserProfileContext as jest.Mock
    const mockPermissions = {
      ...defaultMockPermissions,
      'view-analytics': false
    }
    const mockUserProfile = {
      data: {
        accountId: 'accountId',
        tenants: [
          {
            id: 'accountId',
            permissions: mockPermissions,
            settings: mockSettings
          },
          {
            id: 'accountId2',
            permissions: [],
            settings: []
          }
        ]
      }
    }
    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    const { result } = renderHook(() => useMenuConfig())
    expect(result.current).toMatchSnapshot()
  })
  it('should not return Config Change, Service Validation & Video Call QoE', () => {
    const mockUseUserProfileContext = useUserProfileContext as jest.Mock
    const mockPermissions = {
      ...defaultMockPermissions,
      'manage-service-guard': false,
      'manage-call-manager': false,
      'manage-config-recommendation': false
    }
    const mockUserProfile = {
      data: {
        accountId: 'accountId',
        tenants: [
          {
            id: 'accountId',
            permissions: mockPermissions,
            settings: mockSettings
          },
          {
            id: 'accountId2',
            permissions: [],
            settings: []
          }
        ]
      }
    }
    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    const { result } = renderHook(() => useMenuConfig())
    expect(result.current).toMatchSnapshot()
  })
  it('should not return Administration-related menu items', () => {
    const mockUseUserProfileContext = useUserProfileContext as jest.Mock
    const mockPermissions = {
      ...defaultMockPermissions,
      'manage-mlisa': false,
      'manage-label': false
    }
    const mockUserProfile = {
      data: {
        accountId: 'accountId',
        tenants: [
          {
            id: 'accountId',
            permissions: mockPermissions,
            settings: { franchisor: false }
          },
          {
            id: 'accountId2',
            permissions: [],
            settings: []
          }
        ]
      }
    }
    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    const { result } = renderHook(() => useMenuConfig())
    expect(result.current).toMatchSnapshot()
  })
})
