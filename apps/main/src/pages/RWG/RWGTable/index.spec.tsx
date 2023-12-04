import { rest } from 'msw'

import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
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
  response: [{
    rwgId: 'bbc41563473348d29a36b76e95c50381',
    tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
    venueId: '3f10af1401b44902a88723cb68c4bc77',
    venueName: 'My-Venue',
    name: 'ruckusdemos',
    loginUrl: 'https://rxgs5-vpoc.ruckusdemos.net',
    username: 'inigo',
    password: 'Inigo123!',
    status: 'Operational',
    id: 'bbc41563473348d29a36b76e95c50381',
    new: false
  }, {
    rwgId: 'bbc41563473348d29a36b76e95c50382',
    tenantId: '7b8cb9e8e99a4f42884ae9053604a377',
    venueId: '3f10af1401b44902a88723cb68c4bc77',
    venueName: 'My-Venue',
    name: 'rwg1',
    loginUrl: 'https://rxgs5-vpoc.ruckusdemos.net',
    username: 'inigo',
    password: 'Inigo123!',
    status: 'Offline',
    id: 'bbc41563473348d29a36b76e95c50382',
    new: false
  }]
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))


describe('RWG Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getRwgList.url,
        (req, res, ctx) => res(ctx.json(rwgList))
      ),
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.delete(
        CommonUrlsInfo.deleteGateway.url,
        (req, res, ctx) => res(ctx.json({ requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f' }))
      )
    )
    params = {
      tenantId: '7b8cb9e8e99a4f42884ae9053604a376'
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
