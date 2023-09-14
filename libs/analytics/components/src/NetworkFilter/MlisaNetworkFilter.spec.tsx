import { render, screen, fireEvent } from '@testing-library/react'
import { IntlProvider }              from 'react-intl'

import { DateRange } from '@acx-ui/utils'

import { MlisaNetworkFilter }       from './MlisaNetworkFilter'
import { useNetworkHierarchyQuery } from './services'

const mockSetNetworkPath = jest.fn()
const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours
}
const mockUseAnalyticsFilter = {
  filters,
  setNetworkPath: mockSetNetworkPath,
  raw: []
}

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  defaultNetworkPath: [{ type: 'network', name: 'Network' }],
  formattedPath: jest.fn(),
  useAnalyticsFilter: () => mockUseAnalyticsFilter
}))
jest.mock('./services', () => ({
  useNetworkHierarchyQuery: jest.fn()
}))

describe('MlisaNetworkFilter', () => {
  const mockNetworkHierarchyData = {
    name: 'Network',
    type: 'network',
    children: [{
      name: 'root',
      type: 'system',
      children: [{ id: '2', name: 'child1', type: 'child1' }]
    }]
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useNetworkHierarchyQuery).mockReturnValue({ data: mockNetworkHierarchyData })
  })

  it('should render without errors', async () => {
    render(<IntlProvider locale='en'><MlisaNetworkFilter /></IntlProvider>)
    await screen.findByPlaceholderText('Entire Organization')
  })
})
