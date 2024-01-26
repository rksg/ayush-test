import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { clientApi, networkApi }                        from '@acx-ui/rc/services'
import { ClientUrlsInfo, CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                              from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'
import { getUserProfile, setUserProfile } from '@acx-ui/user'

import {
  AllowedNetworkList,
  GuestClient,
  RegenerateGuestPassword
} from '../../../__tests__/fixtures'

import { GuestTabContext } from './context'

import { GuestsTable } from '.'

const mockedDeleteReq = jest.fn()
const mockedDownloadReq = jest.fn()
const mockedGetNetworkReq = jest.fn()
const mockedPacthReq = jest.fn()
const mockedDownloadFileReq = jest.fn()
jest.mock('socket.io-client')
jest.spyOn(window, 'print').mockImplementation(jest.fn())

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  downloadFile: jest.fn().mockImplementation(() => mockedDownloadFileReq)
}))

const openGuestDetailsAndClickAction = async (guestName: string) => {
  const table = await screen.findByRole('table')
  await userEvent.click(await within(table).findByText(guestName))
  expect(await screen.findByText('Guest Details')).toBeVisible()

  await userEvent.click(await screen.findByRole('button', { name: /actions/i }))
  const menuitems = await screen.findAllByRole('menuitem')
  expect(menuitems).toHaveLength(4)
}

describe('Guest Table', () => {
  let params: { tenantId: string }
  global.URL.createObjectURL = jest.fn()
  HTMLAnchorElement.prototype.click = jest.fn()

  beforeEach(() => {
    store.dispatch(clientApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    mockedDeleteReq.mockClear()
    mockedDownloadReq.mockClear()
    mockedGetNetworkReq.mockClear()
    mockedPacthReq.mockClear()
    mockedDownloadFileReq.mockClear()
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getGuestsList.url,
        (req, res, ctx) => res(ctx.json(GuestClient))
      ),
      rest.post(
        ClientUrlsInfo.getGuests.url,
        (req, res, ctx) => {
          mockedDownloadReq()
          return res(ctx.json({}))
        }
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(AllowedNetworkList))
      ),
      rest.patch(
        ClientUrlsInfo.generateGuestPassword.url,
        (req, res, ctx) => {
          // enable guest, disable guest, generate password
          mockedPacthReq()
          return res(ctx.json(RegenerateGuestPassword))
        }
      ),
      rest.delete(
        ClientUrlsInfo.deleteGuests.url,
        (req, res, ctx) => {
          mockedDeleteReq()
          return res(ctx.json({ requestId: '123' }))
        }
      ),
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => {
          mockedGetNetworkReq()
          return res(ctx.json({ guestPortal: { guestPage: {} } }))
        }
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  afterEach(() => {
    Modal.destroyAll()
  })
  const setGuestCount = jest.fn()

  it('should render table', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(Date.parse('2022-08-04T01:20:00+10:00')))
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })
    const table = await screen.findByRole('table')
    expect(await within(table).findByText('test1')).toBeVisible()
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should delete guest correctly from the action bar', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('+12015550123'))

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    expect(await screen.findByText('Delete "test2"?')).toBeVisible()

    await userEvent.click(await within(dialog).findByRole('button', { name: /Delete Guest/i }))
    await waitFor(() => expect(dialog).not.toBeVisible())
    expect(mockedDeleteReq).toBeCalledTimes(1)
  })

  it.todo('should download guest information correctly from the action bar')
  it.todo('should generate new password correctly from the action bar')

  it('should disable guest correctly from the action bar', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('+12015550123'))
    await userEvent.click( await screen.findByRole('button', { name: 'Disable' }))

    expect(mockedPacthReq).toBeCalledTimes(1)
  })

  it('should enable guest correctly from the action bar', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('Disabled'))
    await userEvent.click( await screen.findByRole('button', { name: 'Enable' }))

    expect(mockedPacthReq).toBeCalledTimes(1)
  })

  it('should render detail by click name', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('test1'))
    expect(await screen.findByText('Guest Details')).toBeVisible()
  })

  it('should render detail by click created time', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    const userProfile = getUserProfile()
    setUserProfile({ ...userProfile, profile: {
      ...userProfile.profile, dateFormat: 'dd/mm/yyyy' } })

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('20/11/2022 08:57'))
    expect(await screen.findByText('Guest Details')).toBeVisible()
  })

  it.skip('should render not applicable guest client detail', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('test2'))
    expect(await screen.findByText('Guest Details')).toBeVisible()

    const drawer = await screen.findByRole('dialog')
    const button = within(drawer).getByRole('button', { name: 'Close' })
    await userEvent.click(button)
    // TODO: add expect.assertions
  })

  it('should render online guest client detail', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('test4'))
    expect(await screen.findByText('Guest Details')).toBeVisible()
    expect(await screen.findByText('testVenue')).toBeVisible()
    expect(await screen.findByTestId('guest-status')).toHaveTextContent('Online (1)')
  })

  it('should click "enable guest" correctly', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('disable_client'))
    await screen.findByText('Guest Details')

    const drawer = await screen.findByRole('dialog')
    expect(await within(drawer).findByTestId('guest-status')).toHaveTextContent('Disable')
    await userEvent.click(await within(drawer).findByText(/actions/i))
    await userEvent.click(await screen.findByText(/enable guest/i))
    expect(mockedPacthReq).toBeCalledTimes(1)
  })

  it('should click "disable guest" correctly', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('test3'))
    await screen.findByText('Guest Details')

    const drawer = await screen.findByRole('dialog')
    expect(await within(drawer).findByTestId('guest-status')).toHaveTextContent('Offline')
    await userEvent.click(await within(drawer).findByText(/actions/i))
    await userEvent.click(await screen.findByText(/disable guest/i))
    expect(mockedPacthReq).toBeCalledTimes(1)
  })

  it('should click "generate new password" with mail and phone number', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' },
        wrapper: Provider
      })

    await openGuestDetailsAndClickAction('test3')
    await userEvent.click(await screen.findByText(/generate new password/i))

    const dialog = await screen.findByTestId('generate-password-modal')
    expect(await within(dialog).findByText('Generate New Password')).toBeVisible()
    expect(await within(dialog).findByText('Send to Phone')).toBeVisible()
    expect(await within(dialog).findByText('Send to Email')).toBeVisible()
    const cancelButton = within(dialog).getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)
    await waitFor(() => expect(dialog).not.toBeVisible())

  })

  it.skip('should click "generate new password" without mail and phone number', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    await openGuestDetailsAndClickAction('test4')
    await userEvent.click(await screen.findByRole('menuitem', { name: /generate new password/i }))
    await userEvent.click(screen.getByRole('checkbox', {
      name: /send to phone/i
    }))
    await userEvent.click(screen.getByRole('checkbox', {
      name: /send to phone/i
    }))
    await userEvent.click(screen.getByRole('checkbox', {
      name: /send to email/i
    }))
    await userEvent.click(screen.getByRole('checkbox', {
      name: /print guest pass/i
    }))
    const generateButton = screen.getByRole('button', { name: 'Generate' })
    await userEvent.click(generateButton)
    await waitFor(() => expect(mockedGetNetworkReq).toBeCalledTimes(1))
    expect(mockedPacthReq).toBeCalledTimes(1)
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
        (req, res, ctx) => {
          mockedPacthReq()
          return res(ctx.json(json))
        }
      )
    )

    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    await openGuestDetailsAndClickAction('test4')
    await userEvent.click(await screen.findByRole('menuitem', { name: /generate new password/i }))
    await userEvent.click(screen.getByRole('checkbox', {
      name: /print guest pass/i
    }))
    const generateButton = screen.getByRole('button', { name: 'Generate' })
    await userEvent.click(generateButton)
    await waitFor(() => expect(mockedGetNetworkReq).toBeCalledTimes(1))
    expect(mockedPacthReq).toBeCalledTimes(1)
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
        (req, res, ctx) => {
          mockedPacthReq()
          return res(ctx.json(json))
        }
      )
    )

    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    await openGuestDetailsAndClickAction('test4')
    await userEvent.click(await screen.findByRole('menuitem', { name: /generate new password/i }))
    await userEvent.click(screen.getByRole('checkbox', {
      name: /print guest pass/i
    }))
    const generateButton = screen.getByRole('button', { name: 'Generate' })
    await userEvent.click(generateButton)
    await waitFor(() => expect(mockedGetNetworkReq).toBeCalledTimes(1))
    expect(mockedPacthReq).toBeCalledTimes(1)
  })

  it.skip('should click "download" correctly', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    // TODO: fix Error encountered handling the endpoint getGuests
    await openGuestDetailsAndClickAction('test3')
    await userEvent.click(await screen.findByRole('menuitem', { name: /download information/i }))
    await waitFor(() => expect(mockedDownloadReq).toBeCalledTimes(1))
    // expect(mockedDownloadFileReq).toBeCalledTimes(1)
  })

  it('should click "delete" correctly', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })


    fireEvent.click(await screen.findByText('test3'))
    await screen.findByText('Guest Details')

    await userEvent.click(await screen.findByText(/actions/i))
    await userEvent.click(await screen.findByText(/delete guest/i))
    await screen.findByText(/are you sure you want to delete this guest\?/i)
    await userEvent.click(screen.getByRole('button', {
      name: /delete guest/i
    }))
    await waitFor(() => expect(mockedDeleteReq).toBeCalledTimes(1))
  })

  it('should handle error for generate password', async () => {
    const spyLog = jest.spyOn(console, 'log')
    mockServer.use(
      rest.patch(
        ClientUrlsInfo.generateGuestPassword.url,
        (req, res, ctx) => res(ctx.status(404), ctx.json({}))
      )
    )
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    await openGuestDetailsAndClickAction('test4')
    await userEvent.click(await screen.findByRole('menuitem', { name: /generate new password/i }))

    const dialog = await screen.findByTestId('generate-password-modal')
    expect(await within(dialog).findByText('Generate New Password')).toBeVisible()
    await userEvent.click(screen.getByRole('checkbox', {
      name: /print guest pass/i
    }))
    const generateButton = screen.getByRole('button', { name: 'Generate' })
    await userEvent.click(generateButton)

    await waitFor(() => {
      // catch error log
      expect(spyLog).toHaveBeenLastCalledWith(expect.objectContaining({
        status: 404
      }))
    })
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
          <GuestsTable />
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
