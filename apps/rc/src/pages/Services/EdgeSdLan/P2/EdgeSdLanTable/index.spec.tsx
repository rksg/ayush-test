import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { edgeSdLanApi }                                                                                                                              from '@acx-ui/rc/services'
import { EdgeUrlsInfo, ServiceOperation, ServiceType, getServiceDetailsLink, CommonUrlsInfo, EdgeSdLanUrls, EdgeGeneralFixtures, EdgeSdLanFixtures } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                                           from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within }                                                                    from '@acx-ui/test-utils'

import EdgeSdLanTable from '.'

const { mockedSdLanDataListP2 } = EdgeSdLanFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures

const mockedUsedNavigate = jest.fn()
const mockedGetClusterList = jest.fn()
const mockedDeleteReq = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const { click, hover } = userEvent

describe('SD-LAN Table P2', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    store.dispatch(edgeSdLanApi.util.resetApiState())

    mockedUsedNavigate.mockReset()
    mockedGetClusterList.mockReset()
    mockedDeleteReq.mockReset()
    store.dispatch(edgeSdLanApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataListP2 }))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => {
          mockedGetClusterList()
          return res(ctx.json(mockEdgeClusterList))
        }
      ),
      rest.delete(
        EdgeSdLanUrls.deleteEdgeSdLan.url,
        (_, res, ctx) => {
          mockedDeleteReq()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should create table successfully', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/list' }
      }
    )

    await waitFor(() => expect(mockedGetClusterList).toBeCalled())
    const rows = await screen.findAllByRole('row', { name: /Mocked_SDLAN_/i })
    expect(rows.length).toBe(3)
    screen.getByRole('row', { name: /SE_Cluster 3/i })
    // eslint-disable-next-line max-len
    expect(rows[0]).toHaveTextContent(/Mocked_SDLAN_1\s*Mocked-Venue-1\s*SE_Cluster 0\s*SE_Cluster 3\s*2\s*Mocked_tunnel-1\s*Mocked_tunnel-3\s*Poor/)
    // eslint-disable-next-line max-len
    expect(rows[1]).toHaveTextContent(/Mocked_SDLAN_2\s*Mocked-Venue-2\s*SE_Cluster 1\s*1\s*Mocked_tunnel-2\s*Good/)
  })

  it('should display network names when hover', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/list' }
      }
    )

    await screen.findByRole('row', { name: /Mocked_SDLAN_1/i })
    const networkNumStr = await screen.findByTestId('network-names-mocked-sd-lan-1')
    await hover(networkNumStr)
    await screen.findByText('Mocked_network')
  })

  it('should go edit page', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/list' }
      }
    )

    const row = await screen.findByRole('row', { name: /Mocked_SDLAN_1/i })
    await click(within(row).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Edit' }))

    const editPath = getServiceDetailsLink({
      type: ServiceType.EDGE_SD_LAN,
      oper: ServiceOperation.EDIT,
      serviceId: 'mocked-sd-lan-1'
    })

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/${editPath}`,
      hash: '',
      search: ''
    })
  })

  it('should delete selected row', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/list' }
      }
    )

    const row = await screen.findByRole('row', { name: /Mocked_SDLAN_2/i })
    await click(within(row).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText('Delete "Mocked_SDLAN_2"?')
    await click(screen.getByRole('button', { name: 'Delete SD-LAN' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(mockedDeleteReq).toBeCalledTimes(1)
  })

  it('should delete multiple selected rows', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/list' }
      }
    )

    const rows = await screen.findAllByRole('row', { name: /Mocked_SDLAN_/i })
    expect(within(rows[0]).getByRole('cell', { name: /Mocked_SDLAN_1/i })).toBeVisible()
    await click(within(rows[0]).getByRole('checkbox'))
    expect(within(rows[1]).getByRole('cell', { name: /Mocked_SDLAN_2/i })).toBeVisible()
    await click(within(rows[1]).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText('Delete "2 SD-LAN"?')
    await click(screen.getByRole('button', { name: 'Delete SD-LAN' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(mockedDeleteReq).toBeCalledTimes(2)
  })

  it('should display empty network name when networkInfos is not found', async () => {
    const cfList = _.cloneDeep(mockedSdLanDataListP2)
    cfList[0].networkInfos = []

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: cfList }))
      ))

    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/list' }
      }
    )

    const row = await screen.findByRole('row', { name: /Mocked_SDLAN_1/i })
    // eslint-disable-next-line max-len
    expect(row).toHaveTextContent(/Mocked_SDLAN_1\s*Mocked-Venue-1\s*SE_Cluster 0\s*SE_Cluster 3\s*2\s*Mocked_tunnel-1\s*Mocked_tunnel-3\s*Poor/)

    const networkNumStr = await screen.findByTestId('network-names-mocked-sd-lan-1')
    await hover(networkNumStr)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('')
  })
  it('should display service health Good if alarm summary is undefined', async () => {
    const cfListNoAlarm = _.cloneDeep(mockedSdLanDataListP2)
    delete cfListNoAlarm[0].edgeAlarmSummary
    cfListNoAlarm[0].name = 'sdLan_good_health'
    const mockedSdLanDataListReq = jest.fn()

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => {
          mockedSdLanDataListReq()
          return res(ctx.json({ data: cfListNoAlarm }))
        }
      ))

    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/list' }
      }
    )

    await screen.findByRole('row', { name: /sdLan_good_health/i })
    // eslint-disable-next-line max-len
    screen.getByRole('row', { name: 'sdLan_good_health Mocked-Venue-1 SE_Cluster 0 SE_Cluster 3 2 Mocked_tunnel-1 Mocked_tunnel-3 Good' })
  })
})
