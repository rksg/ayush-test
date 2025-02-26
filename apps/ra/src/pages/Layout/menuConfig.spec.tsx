import { find } from 'lodash'

import { LayoutProps }                                           from '@acx-ui/components'
import { get }                                                   from '@acx-ui/config'
import { useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { useSearchParams }                                       from '@acx-ui/react-router-dom'
import { renderHook }                                            from '@acx-ui/test-utils'
import { RaiPermissions, raiPermissionsList, setRaiPermissions } from '@acx-ui/user'



import { useMenuConfig } from './menuConfig'

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
const defaultMockPermissions = Object.keys(raiPermissionsList)
  .reduce((permissions, name) => ({ ...permissions, [name]: true }), {})

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
  beforeEach(() => {
    jest.mocked(get).mockReturnValue('true')
    setRaiPermissions(defaultMockPermissions as RaiPermissions)
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
      ...defaultMockPermissions,
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
    } as RaiPermissions)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    expect(result.current).toMatchSnapshot()
  })

  it('should not return app experience', () => {
    setRaiPermissions({
      ...defaultMockPermissions,
      READ_APP_INSIGHTS: false,
      READ_VIDEO_CALL_QOE: false
    } as RaiPermissions)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    expect(result.current).toMatchSnapshot()
  })
  it('should not return menues under the Business Insights', () => {
    setRaiPermissions({
      ...defaultMockPermissions,
      READ_REPORTS: false,
      READ_OCCUPANCY: false,
      READ_DATA_STUDIO: false,
      READ_DATA_CONNECTOR: false
    } as RaiPermissions)
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
      ...defaultMockPermissions,
      READ_SERVICE_VALIDATION: false,
      READ_VIDEO_CALL_QOE: false,
      READ_AI_DRIVEN_RRM: false,
      READ_AI_OPERATIONS: false
    } as RaiPermissions)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    const routes = [
      { uri: '/serviceValidation' },
      { uri: '/videoCallQoe' }
    ]
    const configs = flattenConfig(result.current)
    routes.forEach(route => expect(find(configs, route)).toBeUndefined())
  })
  it('should not return Administration menu item', () => {
    setRaiPermissions({
      ...defaultMockPermissions,
      READ_ONBOARDED_SYSTEMS: false,
      READ_LABELS: false,
      READ_LICENSES: false,
      READ_RESOURCE_GROUPS: false,
      READ_WEBHOOKS: false
    } as RaiPermissions)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    const configs = flattenConfig(result.current)
    const adminRoutes = [
      ...manageMlisaRoutes,
      { uri: '/analytics/admin/labels', openNewTab: true }
    ]
    adminRoutes.forEach(route => expect(find(configs, route)).toBeUndefined())
  })
  it('should not return Administration-related menu items', () => {
    setRaiPermissions({
      ...defaultMockPermissions,
      READ_ONBOARDED_SYSTEMS: false,
      READ_LABELS: false,
      READ_LICENSES: false,
      READ_RESOURCE_GROUPS: false,
      READ_WEBHOOKS: false
    } as RaiPermissions)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    const configs = flattenConfig(result.current)
    manageMlisaRoutes.forEach(route => expect(find(configs, route)).toBeUndefined())
  })
  it('should not return label related menu items', () => {
    setRaiPermissions({
      ...defaultMockPermissions,
      READ_LABELS: false
    } as RaiPermissions)
    const { result } = renderHook(() => useMenuConfig(), { route: true })
    expect(result.current).toMatchSnapshot()
    const target = { uri: '/analytics/admin/labels', openNewTab: true }
    const match = find(flattenConfig(result.current), target)
    expect(match).toBeUndefined()
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
})
