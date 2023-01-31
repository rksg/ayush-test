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

import ServicesTable from '.'

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
    type: 'mDNS Proxy',
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
    type: 'DHCP (Wi-Fi)',
    category: 'CONNECTIVITY',
    status: 'DOWN',
    adminState: 'DISABLED',
    technology: 'WI-FI',
    scope: '15',
    health: '',
    tags: ['tag5', 'tag6']
  },
  {
    id: 'dd080e33-26a7-4d34-870f-b7f312fcfccb',
    name: 'DHCP-Guest',
    type: 'DHCP (Wi-Fi)',
    category: 'CONNECTIVITY',
    status: 'DOWN',
    adminState: 'DISABLED',
    technology: 'WI-FI',
    scope: '0',
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
    render(
      <Provider>
        <ServicesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services' }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const targetServiceName = mockTableResult.data[0].name
    expect(await screen.findByRole('button', { name: /Add Service/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetServiceName) })).toBeVisible()
  })

  it('should delete selected row', async () => {
    render(
      <Provider>
        <ServicesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

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

  it('should delete selected row failed', async () => {
    render(
      <Provider>
        <ServicesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const selectedServiceName = mockTableResult.data[2].name
    const nameReg = new RegExp(selectedServiceName)
    const row = await screen.findByRole('row', { name: nameReg })
    fireEvent.click(within(row).getByRole('radio'))

    // DHCP without scope
    const deleteButton = screen.queryByRole('button', { name: /delete/i })
    expect(deleteButton).toBeNull()

    fireEvent.click(within(row).getByRole('radio'))

    // DHCP with scope (DEFAULT_GUEST_DHCP_NAME)
    const selectedDefaultServiceName = mockTableResult.data[3].name
    const defaultNameReg = new RegExp(selectedDefaultServiceName)
    const defaultRow = await screen.findByRole('row', { name: defaultNameReg })
    fireEvent.click(within(defaultRow).getByRole('radio'))

    expect(screen.queryByRole('button', { name: /delete/i })).toBeNull()
  })
})
