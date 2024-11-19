import { rest } from 'msw'

import { rwgApi, venueApi }                                          from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, CommonUrlsInfo, RWGRow, RWGStatusEnum } from '@acx-ui/rc/utils'
import { Provider, store }                                           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  within,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { RWGTable } from '.'

const rwgList = {
  requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f',
  response: {
    data: [{
      rwgId: 'bbc41563473348d29a36b76e95c50381',
      rowId: 'bbc41563473348d29a36b76e95c50381',
      venueId: '3f10af1401b44902a88723cb68c4bc77',
      venueName: 'My-Venue',
      name: 'ruckusdemos',
      hostname: 'https://rxgs5-vpoc.ruckusdemos.net',
      apiKey: 'xxxxxxxxxxxxxxxxxxx',
      status: RWGStatusEnum.ONLINE,
      isCluster: false
    }, {
      rwgId: 'bbc41563473348d29a36b76e95c50382',
      rowId: 'bbc41563473348d29a36b76e95c50382',
      venueId: '3f10af1401b44902a88723cb68c4bc77',
      venueName: 'My-Venue',
      name: 'rwg1',
      hostname: 'https://rxgs5-vpoc.ruckusdemos.net',
      apiKey: 'xxxxxxxxxxxxxxxxxxx',
      status: RWGStatusEnum.OFFLINE,
      isCluster: false
    }, {
      rwgId: 'bbc41563473348d29a36b76e95c50383',
      rowId: 'bbc41563473348d29a36b76e95c50383',
      venueId: '3f10af1401b44902a88723cb68c4bc77',
      venueName: 'My-Venue',
      name: 'cluster',
      hostname: 'https://rxgs5-vpoc.ruckusdemos.net',
      apiKey: 'xxxxxxxxxxxxxxxxxxx',
      status: RWGStatusEnum.RWG_STATUS_UNKNOWN,
      isCluster: true,
      clusterNodes: [{
        name: 'node1',
        ip: '4.4.4.4',
        id: '1'
      }]
    }] as RWGRow[],
    totalCount: 3,
    page: 1
  }
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))


describe('RWG Table', () => {
  let params: { tenantId: string, venueId: string }
  beforeEach(async () => {
    store.dispatch(rwgApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(
        CommonRbacUrlsInfo.getRwgList.url,
        (req, res, ctx) => res(ctx.json(rwgList))
      ),
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.delete(
        CommonRbacUrlsInfo.deleteGateway.url,
        (req, res, ctx) => res(ctx.json({ requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f' }))
      )
    )
    params = {
      tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
      venueId: '3f10af1401b44902a88723cb68c4bc77'
    }
  })

  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <RWGTable />
      </Provider>, {
        route: { params, path: '/:tenantId/ruckus-wan-gateway' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Add Gateway')
    await screen.findByText('ruckusdemos')
    expect(asFragment().querySelector('div[class="ant-space-item"]')).not.toBeNull()
  })

  it('should delete selected row', async () => {
    render(
      <Provider>
        <RWGTable />
      </Provider>, {
        route: { params, path: '/:tenantId/ruckus-wan-gateway' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /rwg1/i })
    fireEvent.click(within(row).getByRole('checkbox'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText('Delete "rwg1"?')
    const deleteGatewayButton = await screen.findByText('Delete Gateway')
    fireEvent.click(deleteGatewayButton)
  })

  it('should edit selected row', async () => {
    render(
      <Provider>
        <RWGTable />
      </Provider>, {
        route: { params, path: '/:tenantId/ruckus-wan-gateway' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /rwg1/i })
    fireEvent.click(within(row).getByRole('checkbox'))

    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    expect(await screen.findByText('rwg1')).toBeInTheDocument()
  })

})
