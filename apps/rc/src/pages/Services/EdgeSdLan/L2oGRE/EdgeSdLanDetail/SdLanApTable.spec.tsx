import { rest } from 'msw'

import { edgeApi }                                                          from '@acx-ui/rc/services'
import { ClusterHighAvailabilityModeEnum, EdgeSdLanFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                  from '@acx-ui/store'
import { mockServer, render, screen }                                       from '@acx-ui/test-utils'

import { SdLanApTable } from './SdLanApTable'

import { useSdlanApListTableQuery } from '.'


const {
  mockedMvSdLanDataList,
  mockClusterForApTableTest,
  mockApGroupListForApTableTest,
  mockApListForApTableTest
} = EdgeSdLanFixtures
const mockedSdLanData = mockedMvSdLanDataList[0]

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => jest.fn(),
  useTenantLink: () => jest.fn()
}))
jest.mock('./index', () => ({
  ...jest.requireActual('./index'),
  useSdlanApListTableQuery: () => ({
    data: mockApListForApTableTest,
    isLoading: false
  })
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useApGroupsFilterOpts: () => (mockApGroupListForApTableTest),
  useIsSplitOn: jest.fn().mockReturnValue(false)
}))

describe('Edge SD-LAN Detail - ApTable', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = { tenantId: 'tenant-id', serviceId: 'service-id' }

    store.dispatch(edgeApi.util.resetApiState())
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_, res, ctx) => res(ctx.json(mockClusterForApTableTest))
      )
    )
  })

  it('should render correctly for AA cluster', async () => {
    render(
      <Provider>
        <SdLanApTable
          tableQuery={useSdlanApListTableQuery()}
          venueList={[
            { venueId: 'a307d7077410456f8f1a4fc41d861567', venueName: 'Venue1' },
            { venueId: 'a307d7077410456f8f1a4fc41d861568', venueName: 'Venue2' }
          ]}
          clusterId={mockedSdLanData.edgeClusterId!!}
        />
      </Provider>,
      { route: { params, path: '/:tenantId/services/edgeSdLan/:serviceId/detail' } }
    )

    await screen.findAllByRole(
      'row',
      { name: /AP-R610 Venue1 APGroup1 Edge1 Connected 1500/i })

    await screen.findAllByRole(
      'row',
      { name: /AP-R510 Venue2 APGroup2 Edge2 Disconnected 1300/i })
  })

  it('should render correctly for AB cluster', async () => {
    const abCluster = {
      ...mockClusterForApTableTest,
      data: [
        {
          ...mockClusterForApTableTest.data[0],
          highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY
        }
      ]
    }
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_, res, ctx) => res(ctx.json(abCluster))
      )
    )

    render(
      <Provider>
        <SdLanApTable
          tableQuery={useSdlanApListTableQuery()}
          venueList={[
            { venueId: 'a307d7077410456f8f1a4fc41d861567', venueName: 'Venue1' },
            { venueId: 'a307d7077410456f8f1a4fc41d861568', venueName: 'Venue2' }
          ]}
          clusterId={mockedSdLanData.edgeClusterId!!}
        />
      </Provider>,
      { route: { params, path: '/:tenantId/services/edgeSdLan/:serviceId/detail' } }
    )

    await screen.findAllByRole(
      'row',
      { name: /AP-R610 Venue1 APGroup1 Edge1 Connected 1500/i })

    await screen.findAllByRole(
      'row',
      { name: /AP-R510 Venue2 APGroup2 Edge1 Disconnected 1300/i })
  })
})