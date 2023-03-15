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
      ),
      rest.delete(
        NetworkSegmentationUrls.deleteWebAuthTemplate.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it( 'should render successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <NetworkSegAuthTable />
      </Provider>, { route: { params, path: '/:tenantId/services/webAuth/list' } }
    )

    const row = await screen.findByRole('row', { name: /Mock Template name/i })
    await user.click(within(row).getByRole('radio'))
    await user.click(screen.getByRole('button', { name: 'Edit' }))
  })

  it( 'should delete selected row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <NetworkSegAuthTable />
      </Provider>, { route: { params, path: '/:tenantId/services/webAuth/list' } }
    )
    const row = await screen.findByRole('row', { name: /Mock Template name/i })
    await user.click(within(row).getByRole('radio'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "Mock Template name"?')
    await user.click((await screen.findAllByRole('button', { name: 'Delete' }))[1])
  })

  it( 'should update selected row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <NetworkSegAuthTable />
      </Provider>, { route: { params, path: '/:tenantId/services/webAuth/list' } }
    )
    const row = await screen.findByRole('row', { name: /Mock Template name/i })
    await user.click(within(row).getByRole('radio'))
    await user.click(screen.getByRole('button', { name: 'Update Now' }))
    await screen.findByText('Service Update')
    await user.click((await screen.findByRole('button', { name: 'Update' })))
  })
})
