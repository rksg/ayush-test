import { useIsTierAllowed } from '@acx-ui/feature-toggle'
import { renderHook }       from '@acx-ui/test-utils'

import { ServiceOperation, ServiceType } from '../../constants'

import { getServiceListRoutePath, getServiceRoutePath, useServiceListBreadcrumb, useServicePageHeaderTitle } from '.'

const mockedUseConfigTemplate = jest.fn()
jest.mock('../../configTemplate', () => ({
  ...jest.requireActual('../../configTemplate'),
  generateConfigTemplateBreadcrumb: () => [],
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

const mockedLocationFrom = { pathname: '/test' }
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useLocation: () => ({ state: { from: mockedLocationFrom } })
}))

const mockedGenerateUnifiedServicesBreadcrumb = jest.fn().mockReturnValue([])
const mockedUseIsNewServicesCatalogEnabled = jest.fn(() => false)
jest.mock('../unifiedServices', () => ({
  ...jest.requireActual('../unifiedServices'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generateUnifiedServicesBreadcrumb: (from: any) => mockedGenerateUnifiedServicesBreadcrumb(from),
  useIsNewServicesCatalogEnabled: () => mockedUseIsNewServicesCatalogEnabled()
}))

describe('servicePageUtils', () => {
  beforeEach(() => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    jest.mocked(useIsTierAllowed).mockReturnValue(false)
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
    mockedGenerateUnifiedServicesBreadcrumb.mockClear()
    mockedUseIsNewServicesCatalogEnabled.mockRestore()
  })

  it('should generate Service PageHeader Title correctly', () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const { result } = renderHook(() => useServicePageHeaderTitle(false, ServiceType.DPSK))
    expect(result.current).toBe('Add DPSK Template')

    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    // eslint-disable-next-line max-len
    const { result: nonTemplateResult } = renderHook(() => useServicePageHeaderTitle(false, ServiceType.DPSK))
    expect(nonTemplateResult.current).toBe('Add DPSK ')
  })

  it('useServiceListBreadcrumb when isTemplate is true', () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const { result } = renderHook(() => useServiceListBreadcrumb(ServiceType.DPSK))

    expect(result.current).toEqual([])
  })

  it('useServiceListBreadcrumb when isTemplate is false', () => {
    const targetServiceType = ServiceType.DPSK
    const { result } = renderHook(() => useServiceListBreadcrumb(targetServiceType))

    expect(result.current).toEqual([
      { text: 'Network Control' },
      {
        text: 'My Services',
        link: getServiceListRoutePath(true)
      },
      { text: 'DPSK',
        link: getServiceRoutePath({ type: targetServiceType, oper: ServiceOperation.LIST })
      }
    ])
  })

  it('useServiceListBreadcrumb when isNewServiceCatalogEnabled is true', () => {
    mockedUseIsNewServicesCatalogEnabled.mockReturnValue(true)

    renderHook(() => useServiceListBreadcrumb(ServiceType.DPSK))

    // eslint-disable-next-line max-len
    expect(mockedGenerateUnifiedServicesBreadcrumb).toHaveBeenCalledWith(mockedLocationFrom)
  })
})
