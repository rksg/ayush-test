import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                   from '@acx-ui/feature-toggle'
import { ClientUrlsInfo, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'
import { getUserProfile, setUserProfile } from '@acx-ui/user'
import { DateRange }                      from '@acx-ui/utils'

import {
  AllowedNetworkList,
  GuestClient,
  RegenerateGuestPassword
} from '../../../__tests__/fixtures'


import { GuestTabContext } from './context'

import { GuestsTable } from '.'

jest.mock('socket.io-client')

describe('Guest Table', () => {
  let params: { tenantId: string }
  global.URL.createObjectURL = jest.fn()
  HTMLAnchorElement.prototype.click = jest.fn()

  const mockDateFilter = {
    range: DateRange.allTime,
    setRange: () => { },
    startDate: '',
    setStartDate: () => { },
    endDate: '',
    setEndDate: () => { }
  }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getGuestsList.url,
        (req, res, ctx) => res(ctx.json(GuestClient))
      ),
      rest.post(
        ClientUrlsInfo.getGuests.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(AllowedNetworkList))
      ),
      rest.patch(
        ClientUrlsInfo.generateGuestPassword.url,
        (req, res, ctx) => res(ctx.json(RegenerateGuestPassword))
      )

    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  const setGuestCount = jest.fn()

  it('should render table', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(Date.parse('2022-08-04T01:20:00+10:00')))
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable dateFilter={mockDateFilter} />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })
    await screen.findByText('test1')
    jest.useRealTimers()
  })


  it('should render detail by click name', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable dateFilter={mockDateFilter} />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })


    fireEvent.click(await screen.findByText('test1'))
    await screen.findByText('Guest Details')
  })

  it('should render detail by click created time', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable dateFilter={mockDateFilter} />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    const userProfile = getUserProfile()
    setUserProfile({ ...userProfile, profile: {
      ...userProfile.profile, dateFormat: 'dd/mm/yyyy' } })

    fireEvent.click(await screen.findByText('20/11/2022 08:57'))
    await screen.findByText('Guest Details')
  })

  it('should render not applicable guest client detail', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable dateFilter={mockDateFilter} />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })


    fireEvent.click(await screen.findByText('test2'))
    await screen.findByText('Guest Details')

    const button = screen.getByRole('button', { name: 'Close' })
    fireEvent.click(button)
  })

  it('should render online guest client detail', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable dateFilter={mockDateFilter} />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })


    fireEvent.click(await screen.findByText('test4'))
    await screen.findByText('Guest Details')
    await screen.findByText('testVenue')
  })

  it('should click "enable guest" correctly', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable dateFilter={mockDateFilter} />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })


    fireEvent.click(await screen.findByText('disable_client'))
    await screen.findByText('Guest Details')
    await fireEvent.mouseEnter(await screen.findByText(/actions/i))
    fireEvent.click(await screen.findByText(/enable guest/i))
  })

  it('should click "disable guest" correctly', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable dateFilter={mockDateFilter} />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })


    fireEvent.click(await screen.findByText('test3'))
    await screen.findByText('Guest Details')
    await fireEvent.mouseEnter(await screen.findByText(/actions/i))
    fireEvent.click(await screen.findByText(/disable guest/i))
  })

  it('should click "generate new password" with mail and phone number', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable dateFilter={mockDateFilter} />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' },
        wrapper: Provider
      })


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
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable dateFilter={mockDateFilter} />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })


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
    fireEvent.click(screen.getByRole('checkbox', {
      name: /print guest pass/i
    }))
    const generateButton = screen.getByRole('button', { name: 'Generate' })
    await userEvent.click(generateButton)

  })

  it('should click "generate new password" validation 1', async () => {
    const json = {
      requestId: '96dcffb7-583a-499a-8305-def359adf8b4',
      response: {
        id: '0b71a2d4-6dc0-4616-8d1e-105deee0ad72',
        createdDate: 1670475350467,
        name: 'guest1',
        disabled: false,
        networkId: 'd50b652907b64a008e8af2d160b29b64',
        notes: '',
        email: 'test@commscope.com',
        mobilePhoneNumber: '+886988000000',
        macAddresses: [],
        ssid: 'test guest',
        deliveryMethods: ['PRINT'],
        guestUserType: 'GuestPass',
        expiration: {
          activationType: 'Creation',
          duration: 7,
          unit: 'Day'
        },
        locale: 'en',
        password: '886007'
      }
    }
    mockServer.use(
      rest.patch(
        ClientUrlsInfo.generateGuestPassword.url,
        (req, res, ctx) => res(ctx.json(json))
      )
    )

    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable dateFilter={mockDateFilter} />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })


    fireEvent.click(await screen.findByText('test4'))
    await screen.findByText('Guest Details')
    await fireEvent.mouseEnter(await screen.findByText(/actions/i))
    fireEvent.click(await screen.findByText(/generate new password/i))
    fireEvent.click(screen.getByRole('checkbox', {
      name: /print guest pass/i
    }))
    const generateButton = screen.getByRole('button', { name: 'Generate' })
    await userEvent.click(generateButton)
  })

  it('should click "generate new password" validation 2', async () => {
    const json = {
      requestId: '96dcffb7-583a-499a-8305-def359adf8b4',
      response: {
        id: '0b71a2d4-6dc0-4616-8d1e-105deee0ad72',
        createdDate: 1670475350467,
        name: 'guest1',
        disabled: false,
        networkId: 'd50b652907b64a008e8af2d160b29b64',
        notes: '',
        email: 'test@commscope.com',
        mobilePhoneNumber: '+886988000000',
        macAddresses: [],
        ssid: 'test guest',
        deliveryMethods: ['PRINT'],
        guestUserType: 'GuestPass',
        expiration: {
          activationType: 'Creation',
          duration: 7,
          unit: 'Hour'
        },
        locale: 'en',
        password: '886007'
      }
    }
    mockServer.use(
      rest.patch(
        ClientUrlsInfo.generateGuestPassword.url,
        (req, res, ctx) => res(ctx.json(json))
      )
    )

    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable dateFilter={mockDateFilter} />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })


    fireEvent.click(await screen.findByText('test4'))
    await screen.findByText('Guest Details')
    await fireEvent.mouseEnter(await screen.findByText(/actions/i))
    fireEvent.click(await screen.findByText(/generate new password/i))
    fireEvent.click(screen.getByRole('checkbox', {
      name: /print guest pass/i
    }))
    const generateButton = screen.getByRole('button', { name: 'Generate' })
    await userEvent.click(generateButton)
  })

  it('should click "download" correctly', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable dateFilter={mockDateFilter} />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })


    fireEvent.click(await screen.findByText('test3'))
    await screen.findByText('Guest Details')
    await fireEvent.mouseEnter(await screen.findByText(/actions/i))
    fireEvent.click(await screen.findByText(/download information/i))
  })

  it('should click "delete" correctly', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable dateFilter={mockDateFilter} />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })


    fireEvent.click(await screen.findByText('test3'))
    await screen.findByText('Guest Details')
    await fireEvent.mouseEnter(await screen.findByText(/actions/i))
    fireEvent.click(await screen.findByText(/delete guest/i))
    await screen.findByText(/are you sure you want to delete this guest\?/i)
    fireEvent.click(screen.getByRole('button', {
      name: /delete guest/i
    }))
  })

  it('should handle error for generate password', async () => {
    mockServer.use(
      rest.patch(
        ClientUrlsInfo.generateGuestPassword.url,
        (req, res, ctx) => res(ctx.status(404), ctx.json({}))
      )
    )
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable dateFilter={mockDateFilter} />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    fireEvent.click(await screen.findByText('test4'))
    await screen.findByText('Guest Details')
    await fireEvent.mouseEnter(await screen.findByText(/actions/i))
    fireEvent.click(await screen.findByText(/generate new password/i))
    fireEvent.click(screen.getByRole('checkbox', {
      name: /print guest pass/i
    }))
    const generateButton = screen.getByRole('button', { name: 'Generate' })
    await userEvent.click(generateButton)
    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })

  it.skip('should show "Import from file" correctly', async () => {
    mockServer.use(
      rest.post(
        ClientUrlsInfo.importGuestPass.url,
        (req, res, ctx) => res(ctx.status(400), ctx.json({
          requestId: '12b13705-fcf4-4fd2-94b9-2ef93106e396',
          error: {
            rootCauseErrors: [{
              code: 'GUEST-400002',
              message: 'File does not contain any entries'
            }],
            request: {},
            status: 400
          }
        }))
      )
    )
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable dateFilter={mockDateFilter} />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Import from file' })).toBeEnabled())

    const importBtn = await screen.findByRole('button', { name: 'Import from file' })
    fireEvent.click(importBtn)
    const dialog = await screen.findByRole('dialog')
    const csvFile = new File([''], 'guests_import_template.csv', { type: 'text/csv' })
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    const allowedNetworkCombo =
      await within(dialog).findByLabelText('Allowed Network', { exact: false })
    fireEvent.mouseDown(allowedNetworkCombo)
    const option = await screen.findByText('guest pass wlan1')
    fireEvent.click(option)

    fireEvent.click(await within(dialog).findByLabelText('Print Guest pass', { exact: false }))

    fireEvent.click(await within(dialog).findByRole('button', { name: 'Import' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Yes, create guest pass' }))

    await waitFor(() => expect(dialog).toHaveTextContent('File does not contain any entries'))
  })
})
