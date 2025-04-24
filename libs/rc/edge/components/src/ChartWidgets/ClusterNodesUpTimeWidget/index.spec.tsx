import React from 'react'

import { IntlProvider } from 'react-intl'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { useClusterNodesUpTimeData } from '../../hooks/useClusterNodesUpTimeData'

import { EdgeClusterNodesUpTimeWidget } from './index'

// Mock dependencies
const mockedUsedNavigate = jest.fn()
const mockFilters = {
  startDate: '2023-01-01',
  endDate: '2023-01-31'
}
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('react-virtualized-auto-sizer', () => ({
  __esModule: true,
  default: ({ children }) => children({ width: 800, height: 600 })
}))
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useDateFilter: jest.fn(() => mockFilters)
}))
jest.mock('../../hooks/useClusterNodesUpTimeData', () => ({
  useClusterNodesUpTimeData: jest.fn().mockReturnValue({
    isLoading: false,
    queryResults: []
  })
}))
jest.mock('../NodeStatusTimeSeriesChart', () => ({
  NodeStatusTimeSeriesChart: () => <div data-testid='NodeStatusTimeSeriesChart' />
}))


const params = { clusterId: 'test-cluster-id' }
const renderWithProviders = (ui) => {
  return render(
    <Provider>
      <IntlProvider locale='en'>
        {ui}
      </IntlProvider>
    </Provider>, { route: { params } }
  )
}

describe('EdgeClusterNodesUpTimeWidget', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(true)

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state correctly', () => {
    jest.mocked(useClusterNodesUpTimeData).mockReturnValue({
      isLoading: true,
      queryResults: []
    })

    renderWithProviders(
      <EdgeClusterNodesUpTimeWidget edges={[]} />
    )

    expect(screen.getByRole('img', { name: 'loader' })).toBeInTheDocument()
  })

  it('should render with data correctly', () => {
    const mockEdges = [
      { serialNumber: 'SN001', name: 'Edge 1' },
      { serialNumber: 'SN002', name: 'Edge 2' }
    ]

    const mockQueryResults = [
      {
        serialNumber: 'SN001',
        totalUptime: 3600,
        totalDowntime: 300,
        timeSeries: [[1672531200000, 'up', 1672534800000, 3600, 'Up']]
      },
      {
        serialNumber: 'SN002',
        totalUptime: 7200,
        totalDowntime: 600,
        timeSeries: [[1672531200000, 'up', 1672534800000, 7200, 'Up']]
      }
    ]

    jest.mocked(useClusterNodesUpTimeData).mockReturnValue({
      isLoading: false,
      queryResults: mockQueryResults
    })

    renderWithProviders(
      <EdgeClusterNodesUpTimeWidget edges={mockEdges} />
    )

    // Check title
    expect(screen.getByText(/Nodes Status/)).toBeInTheDocument()

    // Check total uptime/downtime
    expect(screen.getByText(/Total Uptime/)).toBeInTheDocument()
    expect(screen.getByText(/Total Downtime/)).toBeInTheDocument()

    // Check node names are displayed
    expect(screen.getByText('Edge 1')).toBeInTheDocument()
    expect(screen.getByText('Edge 2')).toBeInTheDocument()

    // Verify hook was called with correct parameters
    expect(useClusterNodesUpTimeData).toHaveBeenCalledWith({
      serialNumbers: ['SN001', 'SN002'],
      filters: mockFilters
    })
  })

  it('should handle empty edges array', () => {
    jest.mocked(useClusterNodesUpTimeData).mockReturnValue({
      isLoading: false,
      queryResults: []
    })

    renderWithProviders(
      <EdgeClusterNodesUpTimeWidget edges={[]} />
    )

    expect(screen.getByText(/Nodes Status/)).toBeInTheDocument()
    expect(screen.getAllByText('0 ms')).toHaveLength(2) // Total uptime & downtime
  })

  it('should handle undefined edges', () => {
    (useClusterNodesUpTimeData as jest.Mock).mockReturnValue({
      isLoading: false,
      queryResults: []
    })

    renderWithProviders(
      <EdgeClusterNodesUpTimeWidget edges={undefined} />
    )

    expect(screen.getByText(/Nodes Status/)).toBeInTheDocument()
  })

  it('should calculate total uptime and downtime correctly', () => {
    const mockEdges = [
      { serialNumber: 'SN001', name: 'Edge 1' },
      { serialNumber: 'SN002', name: 'Edge 2' }
    ]

    const mockQueryResults = [
      {
        serialNumber: 'SN001',
        totalUptime: 3600,
        totalDowntime: 300,
        timeSeries: [[1672531200000, 'up', 1672534800000, 3600, 'Up']]
      },
      {
        serialNumber: 'SN002',
        totalUptime: 7200,
        totalDowntime: 600,
        timeSeries: [[1672531200000, 'up', 1672534800000, 7200, 'Up']]
      }
    ]

    jest.mocked(useClusterNodesUpTimeData).mockReturnValue({
      isLoading: false,
      queryResults: mockQueryResults
    })

    renderWithProviders(
      <EdgeClusterNodesUpTimeWidget edges={mockEdges} />
    )

    // Total uptime should be 10800 seconds (3600 + 7200)
    // Total downtime should be 900 seconds (300 + 600)
    expect(screen.getAllByText('3 h')).toHaveLength(1)
    expect(screen.getAllByText('15 m')).toHaveLength(1)
  })

  it('should handle nodes with zero uptime and downtime', () => {
    const mockEdges = [
      { serialNumber: 'SN001', name: 'Edge 1' }
    ]

    const mockQueryResults = [
      {
        serialNumber: 'SN001',
        totalUptime: 0,
        totalDowntime: 0,
        timeSeries: []
      }
    ]

    jest.mocked(useClusterNodesUpTimeData).mockReturnValue({
      isLoading: false,
      queryResults: mockQueryResults
    })

    renderWithProviders(
      <EdgeClusterNodesUpTimeWidget edges={mockEdges} />
    )

    // Should still show chart component
    expect(screen.getByTestId('NodeStatusTimeSeriesChart')).toBeInTheDocument()
  })

  it('should render singular form of title when there is only one node', () => {
    const mockEdges = [
      { serialNumber: 'SN001', name: 'Edge 1' }
    ]

    const mockQueryResults = [
      {
        serialNumber: 'SN001',
        totalUptime: 3600,
        totalDowntime: 300,
        timeSeries: [[1672531200000, 'up', 1672534800000, 3600, 'Up']]
      }
    ]

    jest.mocked(useClusterNodesUpTimeData).mockReturnValue({
      isLoading: false,
      queryResults: mockQueryResults
    })

    renderWithProviders(
      <EdgeClusterNodesUpTimeWidget edges={mockEdges} />
    )

    expect(screen.getByText(/Node Status/)).toBeInTheDocument()
    expect(screen.queryByText(/Nodes Status/)).not.toBeInTheDocument()
  })

  it('should render plural form of title when there are multiple nodes', () => {
    const mockEdges = [
      { serialNumber: 'SN001', name: 'Edge 1' },
      { serialNumber: 'SN002', name: 'Edge 2' }
    ]

    const mockQueryResults = [
      {
        serialNumber: 'SN001',
        totalUptime: 3600,
        totalDowntime: 300,
        timeSeries: [[1672531200000, 'up', 1672534800000, 3600, 'Up']]
      },
      {
        serialNumber: 'SN002',
        totalUptime: 7200,
        totalDowntime: 600,
        timeSeries: [[1672531200000, 'up', 1672534800000, 7200, 'Up']]
      }
    ]

    jest.mocked(useClusterNodesUpTimeData).mockReturnValue({
      isLoading: false,
      queryResults: mockQueryResults
    })

    renderWithProviders(
      <EdgeClusterNodesUpTimeWidget edges={mockEdges} />
    )

    expect(screen.getByText(/Nodes Status/)).toBeInTheDocument()
  })
})
