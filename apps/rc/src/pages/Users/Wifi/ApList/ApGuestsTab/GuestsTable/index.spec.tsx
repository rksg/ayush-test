import { rest } from 'msw'

import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'


import { GuestClient, AllowedNetworkList } from '../../../__tests__/fixtures'


import GuestsTable from '.'

jest.mock('socket.io-client')

describe('Guest Table', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getGuestsList.url,
        (req, res, ctx) => res(ctx.json(GuestClient))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(AllowedNetworkList))
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


    jest.useFakeTimers()
    jest.setSystemTime(new Date(Date.parse('2022-08-04T01:20:00+10:00')))
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()

    await screen.findByText('test1')
    jest.useRealTimers()

  })


  it('should render detail by click name', async () => {
    render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/aps/guests' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click(await screen.findByText('test1'))
    await screen.findByText('Guest Details')

  })

  it('should render detail by click created time', async () => {
    render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/aps/guests' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    fireEvent.click(await screen.findByText('01/01/2000 00:00'))
    await screen.findByText('Guest Details')
  })

  it('should render not applicable guest client detail', async () => {
    render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/aps/guests' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click(await screen.findByText('test2'))
    await screen.findByText('Guest Details')

    const button = screen.getByRole('button', { name: /close/i })
    fireEvent.click(button)
  })

  it('should render online guest client detail', async () => {
    render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/aps/guests' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click(await screen.findByText('test4'))
    await screen.findByText('Guest Details')
    await screen.findByText('testVenue')
  })

})
