import { render, screen } from '@acx-ui/test-utils'

import { mockedUnifiedServicesListWithTotalCount } from './__tests__/fixtures'
import { MyServices }                              from './MyServices'

const mockUseUnifiedServiceListWithTotalCount = jest.fn()
jest.mock('./useUnifiedServiceListWithTotalCount', () => ({
  useUnifiedServiceListWithTotalCount: () => mockUseUnifiedServiceListWithTotalCount()
}))

jest.mock('./useUnifiedServiceSearchFilter', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useUnifiedServiceSearchFilter: (list: any) => ({
    setSearchTerm: jest.fn(),
    setFilters: jest.fn(),
    setSortOrder: jest.fn(),
    filteredServices: list
  })
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  AddProfileButton: () => <div>AddProfileButton</div>,
  canCreateAnyUnifiedService: jest.fn(() => true),
  getServiceCatalogRoutePath: jest.fn(() => '/service-catalog')
}))

jest.mock('../UnifiedServiceCard', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  UnifiedServiceCard: ({ unifiedService }: any) => (
    <div>ServiceCard: {unifiedService.type}</div>
  )
}))
jest.mock('./ServicesToolBar', () => ({
  ServicesToolBar: () => <div>ServicesToolBar</div>,
  ServiceSortOrder: {
    ASC: 'asc',
    DESC: 'desc'
  }
}))

describe('<MyServices />', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }

  const path = '/:tenantId/t'

  beforeEach(() => {
    mockUseUnifiedServiceListWithTotalCount.mockReturnValue({
      unifiedServiceListWithTotalCount: mockedUnifiedServicesListWithTotalCount,
      isFetching: false
    })
  })
  it('renders the page header and services', () => {
    render(<MyServices />, { route: { params, path } })

    const targetService1 = mockedUnifiedServicesListWithTotalCount[0]
    const targetService2 = mockedUnifiedServicesListWithTotalCount[1]

    expect(screen.getByText('My Services')).toBeInTheDocument()
    expect(screen.getByText('AddProfileButton')).toBeInTheDocument()
    expect(screen.getByText('ServicesToolBar')).toBeInTheDocument()
    expect(screen.getByText(`ServiceCard: ${targetService1.type}`)).toBeInTheDocument()
    expect(screen.getByText(`ServiceCard: ${targetService2.type}`)).toBeInTheDocument()
  })

  it('renders skeleton loading when isFetching', () => {
    mockUseUnifiedServiceListWithTotalCount.mockReturnValue({
      unifiedServiceListWithTotalCount: [],
      isFetching: true
    })

    render(<MyServices />, { route: { params, path } })

    const skeletonLoadingElements = screen.getAllByRole('list')
      .filter(el => el.classList.contains('ant-skeleton-paragraph'))


    expect(skeletonLoadingElements.length).toBe(4)
  })
})
