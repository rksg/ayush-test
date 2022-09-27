import { rest } from 'msw'

import { CommonUrlsInfo, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  within,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { ServicesTable } from '.'

const mockTableResult = {
  totalCount: 3,
  page: 1,
  data: [{
    id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
    name: 'Service 1',
    type: 'Wi-Fi Calling',
    category: 'APPLICATION',
    status: 'UP',
    adminState: 'ENABLED',
    technology: 'WI-FI',
    scope: '5',
    health: '',
    tags: ['tag1', 'tag2']
  },
  {
    id: 'aa080e33-26a7-4d34-870f-b7f312fcfccb',
    name: 'Service 2',
    type: 'MDNS_PROXY',
    category: 'APPLICATION',
    status: 'UP',
    adminState: 'ENABLED',
    technology: 'WI-FI',
    scope: '7',
    health: '',
    tags: ['tag3', 'tag4']
  },
  {
    id: 'bb080e33-26a7-4d34-870f-b7f312fcfccb',
    name: 'Service 3',
    type: 'DHCP',
    category: 'CONNECTIVITY',
    status: 'DOWN',
    adminState: 'DISABLED',
    technology: 'WI-FI',
    scope: '15',
    health: '',
    tags: ['tag5', 'tag6']
  }]
}

describe('Services Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getServicesList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.delete(
        WifiCallingUrls.deleteWifiCalling.url,
        (req, res, ctx) => res(ctx.json({ requestId: '' }))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <ServicesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()

    const targetServiceName = mockTableResult.data[0].name
    await screen.findByRole('button', { name: /Add Service/i })
    await screen.findByRole('row', { name: new RegExp(targetServiceName) })
  })

  it('should delete selected row', async () => {
    const { asFragment } = render(
      <Provider>
        <ServicesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()

    const selectedServiceName = mockTableResult.data[0].name
    const nameReg = new RegExp(selectedServiceName)
    const row = await screen.findByRole('row', { name: nameReg })
    fireEvent.click(within(row).getByRole('radio'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText('Delete "' + selectedServiceName + '"?')
    const deleteServiceButton = await screen.findByRole('button', { name: /Delete Service/i })
    fireEvent.click(deleteServiceButton)
  })
})
