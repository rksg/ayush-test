import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }       from '@acx-ui/feature-toggle'
import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'


import { GuestClient, GuestNetworkList } from '../../../__tests__/fixtures'


import GuestsTable from '.'

jest.mock('socket.io-client')

describe('Guest Table', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getGuestsList.url,
        (req, res, ctx) => res(ctx.json(GuestClient))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(GuestNetworkList))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(Date.parse('2022-08-04T01:20:00+10:00')))
    const { asFragment } = render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/wifi/guests' }
      })



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
        route: { params, path: '/:tenantId/users/wifi/guests' }
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
        route: { params, path: '/:tenantId/users/wifi/guests' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    fireEvent.click(await screen.findByText('20/11/2022 08:57'))
    await screen.findByText('Guest Details')
  })

  it('should render not applicable guest client detail', async () => {
    render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/wifi/guests' }
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
        route: { params, path: '/:tenantId/users/wifi/guests' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click(await screen.findByText('test4'))
    await screen.findByText('Guest Details')
    await screen.findByText('testVenue')
  })

  it('should click "enable guest" correctly', async () => {
    render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/wifi/guests' },
        wrapper: Provider
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click(await screen.findByText('disable_client'))
    await screen.findByText('Guest Details')
    await fireEvent.mouseEnter(await screen.findByText(/actions/i))
    fireEvent.click(await screen.findByText(/enable guest/i))
  })

  it('should click "disable guest" correctly', async () => {
    render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/wifi/guests' },
        wrapper: Provider
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click(await screen.findByText('test3'))
    await screen.findByText('Guest Details')
    await fireEvent.mouseEnter(await screen.findByText(/actions/i))
    fireEvent.click(await screen.findByText(/disable guest/i))
  })

  it('should click "generate new password" with mail and phone number', async () => {
    render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/wifi/guests' },
        wrapper: Provider
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click(await screen.findByText('test3'))
    await screen.findByText('Guest Details')
    await fireEvent.mouseEnter(await screen.findByText(/actions/i))
    fireEvent.click(await screen.findByText(/generate new password/i))
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)

  })

  it('should click "generate new password" without mail and phone number', async () => {
    render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/wifi/guests' },
        wrapper: Provider
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click(await screen.findByText('test4'))
    await screen.findByText('Guest Details')
    await fireEvent.mouseEnter(await screen.findByText(/actions/i))
    fireEvent.click(await screen.findByText(/generate new password/i))
    fireEvent.click(screen.getByRole('checkbox', {
      name: /send to phone/i
    }))
    fireEvent.click(screen.getByRole('checkbox', {
      name: /send to phone/i
    }))
    fireEvent.click(screen.getByRole('checkbox', {
      name: /send to email/i
    }))
    const generateButton = screen.getByRole('button', { name: /generate/i })
    await userEvent.click(generateButton)

  })

  it('should click "download" correctly', async () => {
    render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/wifi/guests' },
        wrapper: Provider
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click(await screen.findByText('test3'))
    await screen.findByText('Guest Details')
    await fireEvent.mouseEnter(await screen.findByText(/actions/i))
    fireEvent.click(await screen.findByText(/download information/i))
  })

  it('should click "delete" correctly', async () => {
    render(
      <Provider>
        <GuestsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/users/wifi/guests' },
        wrapper: Provider
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click(await screen.findByText('test3'))
    await screen.findByText('Guest Details')
    await fireEvent.mouseEnter(await screen.findByText(/actions/i))
    fireEvent.click(await screen.findByText(/delete guest/i))
    await screen.findByText(/are you sure you want to delete this guest\?/i)
    fireEvent.click(screen.getByRole('button', {
      name: /delete guest/i
    }))
  })
})
