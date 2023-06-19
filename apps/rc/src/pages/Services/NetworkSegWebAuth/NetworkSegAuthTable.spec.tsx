import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  NetworkSegmentationUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import NetworkSegAuthTable from './NetworkSegAuthTable'

const data = [{
  webAuthPasswordLabel: 'DPSK Password',
  webAuthCustomTitle: 'Enter your Password below and press the button',
  id: 'zxzz',
  name: 'Mock Template name'
}]

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe( 'NetworkSegAuthTable', () => {
  const params = { tenantId: 'tenant-id', serviceId: 'service-id' }

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        NetworkSegmentationUrls.getWebAuthTemplateList.url,
        (req, res, ctx) => res(ctx.json({ data, page: 1, totalCount: 1, totalPages: 1 }))
      )
    )
  })

  it( 'should render successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <NetworkSegAuthTable />
      </Provider>, { route: { params, path: '/:tenantId/t/services/webAuth/list' } }
    )

    const row = await screen.findByRole('row', { name: /Mock Template name/i })
    await user.click(within(row).getByRole('radio'))
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledTimes(1))
  })

  it( 'should delete selected row', async () => {
    const user = userEvent.setup()
    mockServer.use(
      rest.delete(
        NetworkSegmentationUrls.deleteWebAuthTemplate.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
    render(
      <Provider>
        <NetworkSegAuthTable />
      </Provider>, { route: { params, path: '/:tenantId/t/services/webAuth/list' } }
    )
    const row = await screen.findByRole('row', { name: /Mock Template name/i })
    await user.click(within(row).getByRole('radio'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    await within(dialog).findByText('Delete "Mock Template name"?')
    await user.click((await within(dialog).findByRole('button', { name: 'Delete' })))

    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it( 'should update selected row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <NetworkSegAuthTable />
      </Provider>, { route: { params, path: '/:tenantId/t/services/webAuth/list' } }
    )
    const row = await screen.findByRole('row', { name: /Mock Template name/i })
    await user.click(within(row).getByRole('radio'))
    await user.click(screen.getByRole('button', { name: 'Update Now' }))

    const dialog = await screen.findByRole('dialog')
    await within(dialog).findByText('Service Update')
    await user.click((await within(dialog).findByRole('button', { name: 'Update' })))

    await waitFor(() => expect(dialog).not.toBeVisible())
  })
})
