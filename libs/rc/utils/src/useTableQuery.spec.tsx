

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { useVenuesListQuery } from '@acx-ui/rc/services'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Provider }                     from '@acx-ui/store'
import { mockRestApiQuery, renderHook } from '@acx-ui/test-utils'

import { CommonUrlsInfo } from './urls'
import { useTableQuery }  from './useTableQuery'


describe('useTableQuery', () => {
  const data = [
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

    const { result } = renderHook(
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
          params: { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
        }
      }
    )

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toStrictEqual(true)
    expect(result.current.isFetching).toStrictEqual(true)

    mockRestApiQuery(CommonUrlsInfo.getVenuesList.url, 'post', {
      status: 200,
      data
    })

    expect(result.current.pagination).toMatchObject({
      current: 1,
      pageSize: 5,
      total: 0
    })

  })
})