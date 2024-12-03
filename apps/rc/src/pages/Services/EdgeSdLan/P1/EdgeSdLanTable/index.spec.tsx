import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { edgeSdLanApi }                                                                                                                              from '@acx-ui/rc/services'
import { EdgeUrlsInfo, ServiceOperation, ServiceType, getServiceDetailsLink, CommonUrlsInfo, EdgeSdLanUrls, EdgeGeneralFixtures, EdgeSdLanFixtures } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                                           from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within }                                                                             from '@acx-ui/test-utils'

import EdgeSdLanTable from '.'

const { mockedSdLanDataList } = EdgeSdLanFixtures
const { mockEdgeList } = EdgeGeneralFixtures
const mockedUsedNavigate = jest.fn()
const mockedGetEdgeList = jest.fn()
const mockedDeleteReq = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const { click, hover } = userEvent

describe('SD-LAN Table', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockedUsedNavigate.mockReset()
    mockedGetEdgeList.mockReset()
    mockedDeleteReq.mockReset()
    store.dispatch(edgeSdLanApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataList }))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_, res, ctx) => {
          mockedGetEdgeList()
          return res(ctx.json(mockEdgeList))
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
        route: { params, path: '/:tenantId/services/sdLan/list' }
      }
    )

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    await screen.findByRole('columnheader', { name: 'RUCKUS Edge' })
    const rows = await screen.findAllByRole('row', { name: /Mocked_SDLAN_/i })
    expect(rows.length).toBe(2)
    // eslint-disable-next-line max-len
    expect(rows[0]).toHaveTextContent(/Mocked_SDLAN_1\s*Mocked-Venue-1\s*vSE-b490\s*Mocked_tunnel-1\s*1\s*Poor/)
    // eslint-disable-next-line max-len
    expect(rows[1]).toHaveTextContent(/Mocked_SDLAN_2\s*Mocked-Venue-2\s*vSE-b466\s*Mocked_tunnel-1\s*0\s*Good/)

    const networkNumStr = await screen.findByTestId('network-names-mocked-sd-lan-1')
    await hover(networkNumStr)
    await screen.findByText('Mocked_network')
  })

  it('should go edit page', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLan/list' }
      }
    )

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
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
        route: { params, path: '/:tenantId/services/edgeSdLan/list' }
      }
    )

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
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
        route: { params, path: '/:tenantId/services/edgeSdLan/list' }
      }
    )

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
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
    const cfList = _.cloneDeep(mockedSdLanDataList)
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
        route: { params, path: '/:tenantId/services/edgeSdLan/list' }
      }
    )

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    await screen.findByRole('columnheader', { name: 'RUCKUS Edge' })
    const rows = await screen.findAllByRole('row', { name: /Mocked_SDLAN_/i })
    // eslint-disable-next-line max-len
    // eslint-disable-next-line max-len
    expect(rows[0]).toHaveTextContent(/Mocked_SDLAN_1\s*Mocked-Venue-1\s*vSE-b490\s*Mocked_tunnel-1\s*1\s*Poor/)

    const networkNumStr = await screen.findByTestId('network-names-mocked-sd-lan-1')
    await hover(networkNumStr)
    expect(await screen.findByRole('tooltip'))
      .toHaveTextContent('')
  })
  it('should display service health Good if alarm summary is undefined', async () => {
    const cfListNoAlarm = _.cloneDeep(mockedSdLanDataList)
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
        route: { params, path: '/:tenantId/services/edgeSdLan/list' }
      }
    )

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    await screen.findByRole('columnheader', { name: 'RUCKUS Edge' })
    await screen.findByText(/sdLan_good_health/i)
    // eslint-disable-next-line max-len
    await screen.findByRole('row', { name: 'sdLan_good_health Mocked-Venue-1 vSE-b490 Mocked_tunnel-1 1 Good' })
  })
})
