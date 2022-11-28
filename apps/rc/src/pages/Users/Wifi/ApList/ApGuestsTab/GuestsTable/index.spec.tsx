import { rest } from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  within,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import moment from 'moment-timezone'


import { GuestClient } from '../../../__tests__/fixtures'


import ConnectedClientsTable from '.'
import GuestsTable from '.'

jest.mock('socket.io-client')



describe('Guest Table', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getGuestsList.url,
        (req, res, ctx) => res(ctx.json(GuestClient))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/aps/guests' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()

    await screen.findByText('test1')

  })


  it('should render detail by click name', async () => {
    const { asFragment } = render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/aps/guests' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click( await screen.findByText('test1'))
    await screen.findByText('Guest Details')

  })

  it('should render detail by click created time', async () => {
    const { asFragment } = render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/aps/guests' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    fireEvent.click( await screen.findByText('01/01/2000 00:00'))
    await screen.findByText('Guest Details')
  })

  it('should render not applicable guest client detail', async () => {
    const { asFragment } = render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/aps/guests' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click( await screen.findByText('test2'))
    await screen.findByText('Guest Details')
    
    const button = screen.getByRole('button', { name: /close/i })
    fireEvent.click(button)
  })

  it('should render online guest client detail', async () => {
    const { asFragment } = render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/aps/guests' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click( await screen.findByText('test4'))
    await screen.findByText('Guest Details')
    await screen.findByText('testVenue')
  })

})
