import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { EdgeUrlsInfo, ServiceOperation, ServiceType, getServiceDetailsLink, CommonUrlsInfo, EdgeSdLanUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                                          from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within }                                     from '@acx-ui/test-utils'

import { mockEdgeList, mockedSdLanDataList } from '../__tests__/fixtures'

import EdgeSdLanTable from '.'

const mockedUsedNavigate = jest.fn()
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
        (_, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.delete(
        EdgeSdLanUrls.deleteEdgeSdLan.url,
        (_, res, ctx) => res(ctx.status(202))
      ),
      rest.delete(
        EdgeSdLanUrls.batchDeleteEdgeSdLan.url,
        (_, res, ctx) => res(ctx.status(202))
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

    await screen.findByRole('columnheader', { name: 'SmartEdge' })
    const row = await screen.findAllByRole('row', { name: /Amy_sdLan_/i })
    expect(row.length).toBe(2)
    // eslint-disable-next-line max-len
    await screen.findByRole('row', { name: 'Amy_sdLan_1 Sting-Venue-1 sting-vSE-b490 amyTunnel 1 Poor' })
    // eslint-disable-next-line max-len
    await screen.findByRole('row', { name: 'Amy_sdLan_2 Sting-Venue-3 sting-vSE-b466 amyTunnel 0 Good' })

    const networkNumStr = await screen.findByTestId('network-names-mocked-sd-lan-1')
    await hover(networkNumStr)
    await screen.findByText('amyNetwork')
  })

  it('should go edit page', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLan/list' }
      }
    )
    const row = await screen.findByRole('row', { name: /Amy_sdLan_1/i })
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
    const row = await screen.findByRole('row', { name: /Amy_sdLan_2/i })
    await click(within(row).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText('Delete "Amy_sdLan_2"?')
    await click(screen.getByRole('button', { name: 'Delete SD-LAN' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('should delete multiple selected rows', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLan/list' }
      }
    )
    await click(within(await screen.findByRole('row', { name: /Amy_sdLan_1/i }))
      .getByRole('checkbox'))
    await click(within(await screen.findByRole('row', { name: /Amy_sdLan_2/i }))
      .getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText('Delete "2 SD-LAN"?')
    await click(screen.getByRole('button', { name: 'Delete SD-LAN' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
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

    await screen.findByRole('columnheader', { name: 'SmartEdge' })
    await screen.findAllByRole('row', { name: /Amy_sdLan_/i })
    // eslint-disable-next-line max-len
    await screen.findByRole('row', { name: 'Amy_sdLan_1 Sting-Venue-1 sting-vSE-b490 amyTunnel 1 Poor' })

    const networkNumStr = await screen.findByTestId('network-names-mocked-sd-lan-1')
    await hover(networkNumStr)
    expect(await screen.findByRole('tooltip'))
      .toHaveTextContent('')
  })
  it('should display service health Unknown if alarm summary is undefined', async () => {
    const cfListNoAlarm = _.cloneDeep(mockedSdLanDataList)
    delete cfListNoAlarm[0].edgeAlarmSummary

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: cfListNoAlarm }))
      ))

    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLan/list' }
      }
    )

    await screen.findByRole('columnheader', { name: 'SmartEdge' })
    await screen.findAllByRole('row', { name: /Amy_sdLan_/i })
    // eslint-disable-next-line max-len
    await screen.findByRole('row', { name: 'Amy_sdLan_1 Sting-Venue-1 sting-vSE-b490 amyTunnel 1 Unknown' })
  })
})
