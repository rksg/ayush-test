


import { useVenuesListQuery, venueApi }      from '@acx-ui/rc/services'
import { CommonUrlsInfo, useTableQuery }     from '@acx-ui/rc/utils'
import { Provider, store }                   from '@acx-ui/store'
import { act, mockRestApiQuery, renderHook } from '@acx-ui/test-utils'

describe('useTableQuery', () => {
  beforeEach(() => store.dispatch(venueApi.util.resetApiState()))

  const params = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

  const mockedVenuesList = [
    {
      id: 'e0788dea6307472d98795300fcda1119',
      name: 'bdcPerformanceVenue2',
      city: 'Sunnyvale, California',
      country: 'United States',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      networks: {
        count: 3,
        names: [
          '!!!AAA_dpsk_performance_test!!!',
          '!!bdc_tenant_test!!',
          '!!.1xPerformance!!'
        ],
        vlans: [
          1
        ]
      },
      aggregatedApStatus: {
        '3_04_DisconnectedFromCloud': 78,
        '3_02_FirmwareUpdateFailed': 329,
        '1_01_NeverContactedCloud': 91,
        '1_07_Initializing': 2
      },
      status: '3_RequiresAttention'
    }
  ]

  const defaultPayload = {
    fields: [
      'check-all',
      'name',
      'description',
      'city',
      'country',
      'networks',
      'aggregatedApStatus',
      'switches',
      'switchClients',
      'clients',
      'cog',
      'latitude',
      'longitude',
      'status',
      'id'
    ],
    filters: {},
    sortField: 'name',
    sortOrder: 'ASC'
  }

  it('should hook data correctly, testing with venues list', async () => {

    const { result, rerender } = renderHook(
      () => useTableQuery({
        useQuery: useVenuesListQuery,
        defaultPayload: {
          ...defaultPayload
        },
        pagination: {
          pageSize: 5
        }
      }), {
        wrapper: ({ children }) => <Provider>{children}</Provider>,
        route: {
          params
        }
      }
    )

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toStrictEqual(true)
    expect(result.current.isFetching).toStrictEqual(true)

    mockRestApiQuery(CommonUrlsInfo.getVenuesList.url, 'post', {
      data: mockedVenuesList
    })

    expect(result.current.pagination).toStrictEqual({
      page: 1,
      current: 1,
      pageSize: 5,
      defaultPageSize: 5,
      total: 0
    })

    await act(async () => {
      const { status, data, error } = await store.dispatch(
        venueApi.endpoints.venuesList.initiate({
          ...defaultPayload,
          pagination: { pageSize: 5 },
          params
        })
      )

      expect(status).toBeDefined()
      expect(error).toBeUndefined()
      expect(data).toStrictEqual({ data: mockedVenuesList })
    })

    rerender()
    expect(result.current.data).toStrictEqual({ data: mockedVenuesList })

    act(() => {
      const handleTableChange = result.current.handleTableChange as CallableFunction
      expect(handleTableChange).toBeDefined()
      handleTableChange(
        { pageSize: 5 },
        {},
        { sortField: 'name', sortOrder: 'ASC' },
        {}
      )

      expect(result.current.pagination.pageSize).toEqual(5)
    })
  })
})
