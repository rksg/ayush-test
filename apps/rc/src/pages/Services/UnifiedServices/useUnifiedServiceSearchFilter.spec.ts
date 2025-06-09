import { RadioCardCategory }                                                         from '@acx-ui/components'
import { PolicyType, ServiceType, UnifiedServiceCategory, UnifiedServiceSourceType } from '@acx-ui/rc/utils'
import { act, renderHook }                                                           from '@acx-ui/test-utils'

import { mockedAvailableUnifiedServicesList } from './__tests__/fixtures'
import { ServiceSortOrder }                   from './ServicesToolBar'
import { useUnifiedServiceSearchFilter }      from './useUnifiedServiceSearchFilter'
describe('useUnifiedServiceSearchFilter', () => {
  it('returns all services by default', () => {
    const { result } = renderHook(() =>
      useUnifiedServiceSearchFilter(mockedAvailableUnifiedServicesList, ServiceSortOrder.ASC)
    )

    expect(result.current.filteredServices.length).toBe(mockedAvailableUnifiedServicesList.length)
  })

  it('filters by searchTerm (label)', () => {
    const { result } = renderHook(() =>
      useUnifiedServiceSearchFilter(mockedAvailableUnifiedServicesList, ServiceSortOrder.ASC)
    )

    act(() => result.current.setSearchTerm('dhcp'))

    expect(result.current.filteredServices).toHaveLength(1)
    expect(result.current.filteredServices[0].type).toBe(ServiceType.DHCP)
  })

  it('filters by searchTerm (keyword)', () => {
    const { result } = renderHook(() =>
      useUnifiedServiceSearchFilter(mockedAvailableUnifiedServicesList, ServiceSortOrder.ASC)
    )

    act(() => result.current.setSearchTerm('Layer 2'))

    expect(result.current.filteredServices).toHaveLength(1)
    expect(result.current.filteredServices[0].type).toBe(PolicyType.ACCESS_CONTROL)
  })

  it('filters by products', () => {
    // Filtered by Switch product
    const { result: resultForSwitch } = renderHook(() =>
      useUnifiedServiceSearchFilter(mockedAvailableUnifiedServicesList, ServiceSortOrder.ASC)
    )

    act(() => resultForSwitch.current.setFilters({ products: [RadioCardCategory.SWITCH] }))

    expect(resultForSwitch.current.filteredServices).toHaveLength(0)

    // Filtered by Edge product
    const { result: resultForEdge } = renderHook(() =>
      useUnifiedServiceSearchFilter([
        ...mockedAvailableUnifiedServicesList,
        {
          type: ServiceType.EDGE_SD_LAN,
          sourceType: UnifiedServiceSourceType.SERVICE,
          label: 'EDGE SD LAN',
          description: 'EDGE SD LAN Description',
          route: '/services/edge-sd-lan',
          products: [RadioCardCategory.EDGE],
          category: UnifiedServiceCategory.NETWORK_SERVICES
        }
      ], ServiceSortOrder.ASC)
    )

    act(() => resultForEdge.current.setFilters({ products: [RadioCardCategory.EDGE] }))

    expect(resultForEdge.current.filteredServices).toHaveLength(1)
  })

  it('filters by categories', () => {
    const { result } = renderHook(() =>
      useUnifiedServiceSearchFilter(mockedAvailableUnifiedServicesList, ServiceSortOrder.ASC)
    )

    // eslint-disable-next-line max-len
    act(() => result.current.setFilters({ categories: [UnifiedServiceCategory.AUTHENTICATION_IDENTITY] }))

    expect(result.current.filteredServices).toHaveLength(2)
    // eslint-disable-next-line max-len
    expect(result.current.filteredServices.map(s => s.type)).toEqual([PolicyType.AAA, ServiceType.DPSK])
  })

  it('sorts ascending by label', () => {
    const { result } = renderHook(() =>
      useUnifiedServiceSearchFilter(mockedAvailableUnifiedServicesList, ServiceSortOrder.ASC)
    )

    // eslint-disable-next-line max-len
    expect(result.current.filteredServices.map(s => s.label)).toEqual(['AAA', 'Access Control', 'DHCP', 'DPSK'])
  })

  it('sorts descending by label', () => {
    const { result } = renderHook(() =>
      useUnifiedServiceSearchFilter(mockedAvailableUnifiedServicesList, ServiceSortOrder.DESC)
    )

    // eslint-disable-next-line max-len
    expect(result.current.filteredServices.map(s => s.label)).toEqual(['DPSK', 'DHCP', 'Access Control', 'AAA'])
  })
})
