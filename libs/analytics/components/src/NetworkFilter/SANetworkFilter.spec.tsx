import { IntlProvider } from 'react-intl'
import { Provider }     from 'react-redux'

import { defaultNetworkPath }               from '@acx-ui/analytics/utils'
import { dataApiURL, store }                from '@acx-ui/store'
import { render, screen, mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange, NetworkNode }           from '@acx-ui/utils'

import * as fixtures                              from './__tests__/fixtures'
import { SANetworkFilter, filterSystemAndDomain } from './SANetworkFilter'
import { api }                                    from './services'

const mockSetNetworkPath = jest.fn()
const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {}
}
const pathFilters = {
  ...filters,
  path: defaultNetworkPath
}
const mockUseAnalyticsFilter = {
  filters,
  pathFilters,
  setNetworkPath: mockSetNetworkPath,
  raw: []
}

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  defaultNetworkPath: [{ type: 'network', name: 'Network' }],
  formattedPath: jest.fn(),
  useAnalyticsFilter: () => mockUseAnalyticsFilter
}))

describe('SANetworkFilter', () => {
  afterEach(() => {
    store.dispatch(api.util.resetApiState())
  })
  beforeEach(() => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: fixtures.hierarchyQueryResult
    })
  })

  it('should render without errors', async () => {
    render(<Provider store={store}>
      <IntlProvider locale='en'><SANetworkFilter /></IntlProvider>
    </Provider>)
    await screen.findByPlaceholderText('Entire Organization')
  })
  it('should render without zones or switch_groups', async () => {
    render(<Provider store={store}>
      <IntlProvider locale='en'><SANetworkFilter shouldShowOnlyDomains/></IntlProvider>
    </Provider>)
    await screen.findByPlaceholderText('Entire Organization')
  })
})

describe('filterSystemAndDomain', () => {
  it('should filter system and domain', () => {
    const result = filterSystemAndDomain(fixtures.fullHierarchyQueryOuput as NetworkNode)
    expect(result).toMatchSnapshot()
  })
  it('should handle null', () => {
    const result = filterSystemAndDomain(null as unknown as NetworkNode)
    expect(result).toBeNull()
  })
})
