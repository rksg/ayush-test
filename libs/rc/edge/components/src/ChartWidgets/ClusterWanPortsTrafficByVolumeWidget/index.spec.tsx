import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { IntlProvider }            from 'react-intl'

import { useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { useLazyGetEdgePortTrafficQuery }     from '@acx-ui/rc/services'
import { EdgeAllPortTrafficData, EdgeStatus } from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { useDateFilter }                      from '@acx-ui/utils'

import { EdgeClusterWanPortsTrafficByVolumeWidget, transformTimeSeriesChartData } from './index'

// Mock dependencies
jest.mock('@acx-ui/utils', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })

  return {
    ...jest.requireActual('@acx-ui/utils'),
    getIntl: () => intl,
    useDateFilter: jest.fn()
  }
})

jest.mock('@acx-ui/rc/services', () => ({
  useLazyGetEdgePortTrafficQuery: jest.fn()
}))

jest.mock('react-virtualized-auto-sizer', () => ({ children }) =>
  children({ width: 500, height: 400 })
)

jest.mock('@acx-ui/analytics/utils', () => ({
  calculateGranularity: jest.fn().mockReturnValue('1h')
}))

jest.mock('@acx-ui/components', () => {
  const originalModule = jest.requireActual('@acx-ui/components')
  return {
    ...originalModule,
    // eslint-disable-next-line max-len
    HistoricalCard: ({ children, title }) => <div data-testid='historical-card' title={title}>{children}</div>,
    // eslint-disable-next-line max-len
    MultiLineTimeSeriesChart: ({ data }) => <div data-testid='multi-line-chart' data-series={JSON.stringify(data)}>Chart</div>,
    getDefaultEarliestStart: jest.fn().mockReturnValue(new Date().toISOString()),
    tooltipOptions: jest.fn().mockReturnValue({})
  }
})

describe('EdgeClusterWanPortsTrafficByVolumeWidget', () => {
  const mockGetEdgePortTraffic = jest.fn()
  const unwrapMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    jest.mocked(useIsSplitOn).mockReturnValue(false)
    jest.mocked(useDateFilter).mockReturnValue({
      startDate: '2023-01-01T00:00:00Z',
      endDate: '2023-01-07T00:00:00Z'
    })

    jest.mocked(useLazyGetEdgePortTrafficQuery).mockReturnValue([
      mockGetEdgePortTraffic.mockReturnValue({ unwrap: unwrapMock })
    ])
  })

  it('should render no data when no WAN ports are provided', async () => {
    render(<Provider>
      <IntlProvider locale='en'>
        <EdgeClusterWanPortsTrafficByVolumeWidget edges={[]} wanPortIfNames={[]} />
      </IntlProvider>
    </Provider>)
    await waitFor(() => {
      expect(screen.getByText('No WAN port exist')).toBeInTheDocument()
    })
  })

  it('should show loading state when fetching data', () => {
    // const edges = [{ serialNumber: 'SN123', deviceStatusSeverity: 'OPERATIONAL' }] as EdgeStatus[]
    const wanPorts = [{ edgeId: 'SN123', ifName: 'eth0' }]

    render(<IntlProvider locale='en'>
      <EdgeClusterWanPortsTrafficByVolumeWidget edges={[]} wanPortIfNames={wanPorts} />
    </IntlProvider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeInTheDocument()
  })

  it('should fetch and display data successfully', async () => {
    const edges = [{ serialNumber: 'SN123', deviceStatusSeverity: 'OPERATIONAL' }] as EdgeStatus[]
    const wanPorts = [{ edgeId: 'SN123', ifName: 'eth0' }]

    const mockTrafficData: EdgeAllPortTrafficData = {
      timeSeries: {
        time: [1672531200000, 1672534800000], // 01/01/2023 00:00, 01:00
        ports: [{
          portName: 'eth0',
          total: [100, 200],
          rx: [50, 100],
          tx: [50, 100]
        }]
      },
      portCount: 1
    }

    unwrapMock.mockResolvedValue(mockTrafficData)

    render(<IntlProvider locale='en'>
      <EdgeClusterWanPortsTrafficByVolumeWidget edges={edges} wanPortIfNames={wanPorts} />
    </IntlProvider>)

    await waitFor(() => {
      expect(mockGetEdgePortTraffic).toHaveBeenCalledWith({
        params: { serialNumber: 'SN123' },
        payload: {
          start: '2023-01-01T00:00:00Z',
          end: '2023-01-07T00:00:00Z',
          granularity: '1h'
        }
      })
    })
  })

  it('should handle empty time series data', async () => {
    const edges = [{ serialNumber: 'SN123', deviceStatusSeverity: 'OPERATIONAL' }] as EdgeStatus[]
    const wanPorts = [{ edgeId: 'SN123', ifName: 'eth0' }]

    const mockTrafficData: EdgeAllPortTrafficData = {
      timeSeries: {
        time: [],
        ports: [{
          portName: wanPorts[0].ifName,
          total: [],
          rx: [],
          tx: []
        }]
      },
      portCount: 1
    }

    unwrapMock.mockResolvedValue(mockTrafficData)

    render(<IntlProvider locale='en'>
      <EdgeClusterWanPortsTrafficByVolumeWidget edges={edges} wanPortIfNames={wanPorts} />
    </IntlProvider>)

    // Wait for the</IntlProvider> data to load
    await waitFor(() => {
      expect(mockGetEdgePortTraffic).toHaveBeenCalled()
    })

    expect(await screen.findByText('No data to display')).toBeInTheDocument()
  })

  it('should filter ports correctly based on wanPortIfNames', async () => {
    const edges = [{ serialNumber: 'SN123', deviceStatusSeverity: 'OPERATIONAL' }] as EdgeStatus[]
    const wanPorts = [{ edgeId: 'SN123', ifName: 'eth0' }]

    const mockTrafficData: EdgeAllPortTrafficData = {
      timeSeries: {
        time: [1672531200000, 1672534800000],
        ports: [
          {
            portName: 'eth0', // This should be included
            total: [100, 200],
            rx: [50, 100],
            tx: [50, 100]
          },
          {
            portName: 'eth1', // This should be filtered out
            total: [300, 400],
            rx: [150, 200],
            tx: [150, 200]
          }
        ]
      },
      portCount: 2
    }

    unwrapMock.mockResolvedValue(mockTrafficData)

    render(<IntlProvider locale='en'>
      <EdgeClusterWanPortsTrafficByVolumeWidget edges={edges} wanPortIfNames={wanPorts} />
    </IntlProvider>)

    await waitFor(() => {
      expect(mockGetEdgePortTraffic).toHaveBeenCalled()
    })
  })
})

describe('transformTimeSeriesChartData', () => {
  it('should transform time series data correctly', () => {
    const mockData: EdgeAllPortTrafficData = {
      timeSeries: {
        time: [1672531200000, 1672534800000],
        ports: [{
          portName: 'eth0',
          total: [100, 200],
          rx: [50, 100],
          tx: [50, 100]
        }]
      },
      portCount: 1
    }

    const result = transformTimeSeriesChartData(mockData)

    expect(result).toHaveLength(3) // total, rx, tx
    expect(result[0].key).toBe('total')
    expect(result[0].data).toEqual([[1672531200000, 100], [1672534800000, 200]])
    expect(result[1].key).toBe('rx')
    expect(result[1].data).toEqual([[1672531200000, 50], [1672534800000, 100]])
    expect(result[2].key).toBe('tx')
    expect(result[2].data).toEqual([[1672531200000, 50], [1672534800000, 100]])
  })

  it('should handle multiple ports by summing their values', () => {
    const mockData: EdgeAllPortTrafficData = {
      timeSeries: {
        time: [1672531200000, 1672534800000],
        ports: [
          {
            portName: 'eth0',
            total: [100, 200],
            rx: [50, 100],
            tx: [50, 100]
          },
          {
            portName: 'eth1',
            total: [300, 400],
            rx: [150, 200],
            tx: [150, 200]
          }
        ]
      },
      portCount: 2
    }

    const result = transformTimeSeriesChartData(mockData)

    expect(result[0].data).toEqual([[1672531200000, 400], [1672534800000, 600]]) // 100+300, 200+400
    expect(result[1].data).toEqual([[1672531200000, 200], [1672534800000, 300]]) // 50+150, 100+200
    expect(result[2].data).toEqual([[1672531200000, 200], [1672534800000, 300]]) // 50+150, 100+200
  })
})
