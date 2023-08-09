import '@testing-library/jest-dom'
import { rest } from 'msw'

import { switchApi, venueApi }                                   from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                                        from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { SwitchDhcpLeaseTable } from './SwitchDhcpLeaseTable'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('SwitchDhcpLeaseTable', () => {
  const params = {
    tenantId: 'tenant-id',
    switchId: 'switch-id'
  }

  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get( SwitchUrlsInfo.dhcpLeaseTable.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get( SwitchUrlsInfo.getDhcpLeases.url,
        (_, res, ctx) => res(ctx.status(400), ctx.json({})))
      // TODO: should render data
      // res(ctx.json({ response: { syncing: false, result: '{}' } }))),
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <SwitchDhcpLeaseTable />
      </Provider>,
      { route: { params } }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Client ID')
    await screen.findByText('Lease Expiration')
  })
})