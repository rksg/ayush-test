import { rest } from 'msw'

import * as utils                          from '@acx-ui/analytics/utils'
import { edgeApi }                         from '@acx-ui/rc/services'
import { EdgeUrlsInfo }                    from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import { renderHook, mockServer, waitFor } from '@acx-ui/test-utils'

import { useClusterNodesUpTimeData, getStartAndEndTimes } from './useClusterNodesUpTimeData'

// Mock dependencies
jest.mock('@acx-ui/analytics/utils', () => ({
  calculateGranularity: jest.fn(),
  getSeriesData: jest.fn()
}))

const mockEdgeUpTimeData = {
  timeSeries: [
    {
      time: '2023-01-01T00:00:00Z',
      isEdgeUp: 1
    },
    {
      time: '2023-01-01T01:00:00Z',
      isEdgeUp: 0
    }
  ],
  totalUptime: 3600,
  totalDowntime: 3600
}

const mockGetEdgeUptime = jest.fn()

describe('useClusterNodesUpTimeData', () => {
  const mockFilters = {
    startDate: '2023-01-01T00:00:00Z',
    endDate: '2023-01-02T00:00:00Z'
  }

  const mockSerialNumbers = ['SN1', 'SN2']

  const mockTimeSeriesData = [
    {
      data: [
        ['2023-01-01T00:00:00Z', 1],
        ['2023-01-01T01:00:00Z', 1],
        ['2023-01-01T02:00:00Z', 0],
        ['2023-01-01T03:00:00Z', 0],
        ['2023-01-01T04:00:00Z', 1]
      ]
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    store.dispatch(edgeApi.util.resetApiState())
    mockServer.use(
      rest.post(EdgeUrlsInfo.getEdgeUpDownTime.url,
        (req, res, ctx) => {
          // console.log(mockGetEdgeUptime)
          mockGetEdgeUptime({ payload: req.body, params: req.params })
          return res(ctx.json(mockEdgeUpTimeData))
        })
    )

    jest.spyOn(utils, 'calculateGranularity').mockReturnValue('1h')
    jest.spyOn(utils, 'getSeriesData').mockReturnValue(mockTimeSeriesData)
  })

  it('should return empty results with empty serialNumbers', async () => {
    const mockEmptySerialNumbers = []
    const { result } = renderHook(() =>
      useClusterNodesUpTimeData({
        serialNumbers: mockEmptySerialNumbers,
        ...mockFilters
      }), { wrapper: Provider })

    expect(result.current.queryResults).toEqual([])
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockGetEdgeUptime).not.toHaveBeenCalled()
  })

  it('should return empty results with undefined serialNumbers', async () => {
    const { result } = renderHook(() =>
      useClusterNodesUpTimeData({
        serialNumbers: undefined,
        ...mockFilters
      }), { wrapper: Provider })

    expect(result.current.queryResults).toEqual([])
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockGetEdgeUptime).not.toHaveBeenCalled()
  })

  it('should fetch and process data successfully', async () => {
    const { result } = renderHook(() => {
      return useClusterNodesUpTimeData({
        serialNumbers: mockSerialNumbers,
        ...mockFilters
      })
    }, { wrapper: Provider })

    await waitFor(() => expect(result.current.isLoading).toBe(true))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Check if API was called with correct params
    expect(mockGetEdgeUptime).toHaveBeenCalledTimes(2)
    expect(mockGetEdgeUptime).toHaveBeenCalledWith({
      params: { serialNumber: 'SN1' },
      payload: {
        start: mockFilters.startDate,
        end: mockFilters.endDate,
        granularity: '1h'
      }
    })

    // Check if results were processed correctly
    expect(result.current.queryResults.length).toBe(2)
    expect(result.current.queryResults[0].serialNumber).toBe('SN1')
    expect(result.current.queryResults[1].serialNumber).toBe('SN2')

  })

  it('should handle API error', async () => {
    // mockUnwrap.mockRejectedValue(new Error('API Error'))
    mockServer.use(
      rest.post(EdgeUrlsInfo.getEdgeUpDownTime.url,
        (req, res, ctx) => {
          mockGetEdgeUptime({ payload: req.body, params: req.params })
          return res(ctx.status(422))
        })
    )

    const { result } = renderHook(() =>
      useClusterNodesUpTimeData({
        serialNumbers: mockSerialNumbers,
        ...mockFilters
      }), { wrapper: Provider } )

    expect(result.current.queryResults).toEqual([])
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('should handle rejected promises', async () => {
    const mockQueryFn = jest.fn()
    const mockData = {
      timeSeries: [],
      totalUptime: 0,
      totalDowntime: 0
    }

    mockServer.use(
      rest.post(EdgeUrlsInfo.getEdgeUpDownTime.url,
        (req, res, ctx) => {
          if (req.params.serialNumber === mockSerialNumbers[0]) {
            return res(ctx.status(422))
          }
          mockQueryFn({ payload: req.body, params: req.params })
          return res(ctx.json(mockData))
        })
    )

    const { result } = renderHook(() =>
      useClusterNodesUpTimeData({
        serialNumbers: mockSerialNumbers,
        ...mockFilters
      }), { wrapper: Provider })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.queryResults.length).toBe(1)
  })

  it('getStartAndEndTimes transforms time series data correctly', () => {
    const result = getStartAndEndTimes(mockTimeSeriesData)

    expect(result).toHaveLength(3)

    // Check first data point (start of period 1)
    expect(result[0][0]).toBe('2023-01-01T00:00:00Z') // start time
    expect(result[0][1]).toBe('edgeStatus')
    expect(result[0][2]).toBe('2023-01-01T01:00:00Z') // end time
    expect(result[0][3]).toBe(1) // value

    // Check status change to 0
    expect(result[1][0]).toBe('2023-01-01T02:00:00Z')
    expect(result[1][3]).toBe(0)

    // Check status change back to 1
    expect(result[2][0]).toBe('2023-01-01T04:00:00Z')
    expect(result[2][3]).toBe(1)
  })
})
