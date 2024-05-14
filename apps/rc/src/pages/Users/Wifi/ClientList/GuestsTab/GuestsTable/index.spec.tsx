import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                  from '@acx-ui/feature-toggle'
import { clientApi, networkApi }                         from '@acx-ui/rc/services'
import { ClientUrlsInfo, CommonUrlsInfo, GuestFixtures } from '@acx-ui/rc/utils'
import { Provider, store }                               from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  screen,
  waitFor,
  within,
  fireEvent
} from '@acx-ui/test-utils'
import { getUserProfile, setUserProfile } from '@acx-ui/user'

import {
  VenueList,
  GuestClients,
  RegenerateGuestPassword
} from '../../../__tests__/fixtures'

import { GuestTabContext } from './context'

import { GuestsTable } from '.'

const { GuestList, AllowedNetworkList } = GuestFixtures

const mockedDeleteReq = jest.fn()
const mockedPatchReq = jest.fn()
const mockedDownloadFileReq = jest.fn()
const mockedImportFileReq = jest.fn()
const setGuestCount = jest.fn()
const mockedDownloadReq = jest.fn()
jest.mock('socket.io-client')
jest.spyOn(window, 'print').mockImplementation(jest.fn())

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  downloadFile: jest.fn().mockImplementation(() => mockedDownloadFileReq)
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  NetworkForm: () => <div data-testid='network-form' />
}))

const mockGuestData = { data: GuestList, isLoading: false }
const mockNetworkData = { data: AllowedNetworkList, isLoading: false }

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetGuestsListQuery: () => mockGuestData,
  useWifiNetworkListQuery: () => mockNetworkData,
  useGetGuestsMutation: () => ([ mockedDownloadReq ]),
  useDeleteGuestMutation: () => ([ mockedDeleteReq ]),
  useEnableGuestsMutation: () => ([ mockedPatchReq ]),
  useDisableGuestsMutation: () => ([ mockedPatchReq ])
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
  const params: { tenantId: string, networkId: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    networkId: 'tenant-id'
  }
  global.URL.createObjectURL = jest.fn()
  HTMLAnchorElement.prototype.click = jest.fn()

  afterEach(() => {
    mockedDeleteReq.mockClear()
    mockedPatchReq.mockClear()
    mockedDownloadFileReq.mockClear()
    mockedImportFileReq.mockClear()
    setGuestCount.mockClear()
    Modal.destroyAll()
  })

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    act(() => {
      store.dispatch(clientApi.util.resetApiState())
      store.dispatch(networkApi.util.resetApiState())
    })

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getGuestsList.url,
        (_, res, ctx) => res(ctx.json(GuestList))
      ),
      rest.post(
        ClientUrlsInfo.getClientList.url,
        (_, res, ctx) => res(ctx.json(GuestClients))
      ),
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (_, res, ctx) => res(ctx.json(VenueList))
      ),
      rest.post(
        CommonUrlsInfo.getWifiNetworksList.url,
        (_, res, ctx) => res(ctx.json(AllowedNetworkList))
      ),
      rest.delete(
        ClientUrlsInfo.deleteGuest.url,
        (_, res, ctx) => {
          mockedDeleteReq()
          return res(ctx.json({ requestId: '123' }))
        }
      ),
      rest.post(
        ClientUrlsInfo.getGuests.url,
        (_, res, ctx) => {
          mockedDownloadReq()
          return res(ctx.json({}))
        }
      )
    )
  })

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

  it('should render Add Guest drawer correctly', async () => {
    const userProfile = getUserProfile()
    setUserProfile({
      ...userProfile,
      allowedOperations: ['POST:/wifiNetworks/{wifiNetworkId}/guestUsers']
    })

    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    await waitFor(async () =>
      expect(await screen.findByRole('button', { name: 'Add Guest' })).toBeEnabled()
    )
    const table = await screen.findByRole('table')
    expect(await within(table).findByText('test1')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Add Guest' }))
    expect(await screen.findByTestId('saveBtn')).toBeVisible()
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should render Add Guest Pass Network modal correctly', async () => {
    const userProfile = getUserProfile()
    setUserProfile({
      ...userProfile,
      allowedOperations: ['POST:/networks']
    })

    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    const addNetworkBtn = await screen.findByRole('button', { name: /Add Guest Pass Network/ })
    await waitFor(async () => expect(addNetworkBtn).toBeEnabled())

    const table = await screen.findByRole('table')
    expect(await within(table).findByText('test1')).toBeVisible()

    await userEvent.click(addNetworkBtn)
    await waitFor(async () => expect(await screen.findByRole('dialog')).toBeVisible())
    const modal = await screen.findByRole('dialog')
    expect(await within(modal).findByText('Add Guest Pass Network')).toBeVisible()
    expect(await within(modal).findByTestId('network-form')).toBeVisible()
  })

  it('should delete guest correctly from the action bar', async () => {
    mockServer.use(
      rest.delete(
        ClientUrlsInfo.deleteGuest.url,
        (_, res, ctx) => {
          mockedDeleteReq()
          return res(ctx.json({ requestId: '123' }))
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

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('+12015550123'))

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    expect(await screen.findByText('Delete "test2"?')).toBeVisible()

    await userEvent.click(await within(dialog).findByRole('button', { name: /Delete Guest/i }))
    await waitFor(() => expect(dialog).not.toBeVisible())
    await waitFor(() => expect(mockedDeleteReq).toBeCalledTimes(1))
  })

  it('should click "delete" on GuestDetailDrawer correctly', async () => {
    mockServer.use(
      rest.delete(
        ClientUrlsInfo.deleteGuest.url,
        (_, res, ctx) => {
          mockedDeleteReq()
          return res(ctx.json({ requestId: '123' }))
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

    await userEvent.click(await screen.findByText('test3'))
    await screen.findByText('Guest Details')

    await userEvent.click(await screen.findByText(/actions/i))
    await userEvent.click(await screen.findByText(/delete guest/i))
    const content = await screen.findByText(/are you sure you want to delete this guest\?/i)
    await userEvent.click(screen.getByRole('button', {
      name: /delete guest/i
    }))
    await waitFor(() => expect(content).not.toBeVisible())
    await waitFor(() => expect(mockedDeleteReq).toBeCalledTimes(1))
  })

  it.todo('should download guest information correctly from the action bar')

  it('should generate new password correctly from the action bar', async () => {
    mockServer.use(
      rest.patch(
        ClientUrlsInfo.generateGuestPassword.url,
        (_, res, ctx) => {
          mockedPatchReq()
          return res(ctx.json(RegenerateGuestPassword))
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

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('+12015550321'))
    await userEvent.click(await screen.findByRole('button', { name: 'Generate New Password' }))

    const dialog = await screen.findByTestId('generate-password-modal')
    expect(await within(dialog).findByText('Generate New Password')).toBeVisible()
    await userEvent.click(within(dialog).getByRole('checkbox', { name: /send to phone/i }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'Generate' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
    await waitFor(() => expect(mockedPatchReq).toBeCalledTimes(1))
  })

  it('should disable guest correctly from the action bar', async () => {
    mockServer.use(
      rest.patch(
        ClientUrlsInfo.generateGuestPassword.url,
        (_, res, ctx) => {
          mockedPatchReq()
          return res(ctx.json(RegenerateGuestPassword))
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

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('+12015550123'))
    await userEvent.click(await screen.findByRole('button', { name: 'Disable' }))
    await waitFor(() => expect(mockedPatchReq).toBeCalledTimes(1))
  })

  it('should enable guest correctly from the action bar', async () => {
    mockServer.use(
      rest.patch(
        ClientUrlsInfo.generateGuestPassword.url,
        (_, res, ctx) => {
          mockedPatchReq()
          return res(ctx.json(RegenerateGuestPassword))
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

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('Disabled'))
    await userEvent.click(await screen.findByRole('button', { name: 'Enable' }))
    await waitFor(() => expect(mockedPatchReq).toBeCalledTimes(1))
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
    const dialog = await screen.findByRole('dialog')
    const closeButton = await within(dialog).findByTestId('CloseSymbol')
    expect(closeButton).toBeVisible()
    await userEvent.click(closeButton)
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
    const dialog = await screen.findByRole('dialog')
    const closeButton = await within(dialog).findByTestId('CloseSymbol')
    expect(closeButton).toBeVisible()
    await userEvent.click(closeButton)
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
    mockServer.use(
      rest.patch(
        ClientUrlsInfo.generateGuestPassword.url,
        (_, res, ctx) => {
          mockedPatchReq()
          return res(ctx.json(RegenerateGuestPassword))
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

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('disable_client'))
    await screen.findByText('Guest Details')

    const drawer = await screen.findByRole('dialog')
    expect(await within(drawer).findByTestId('guest-status')).toHaveTextContent('Disable')
    await userEvent.click(await within(drawer).findByText(/actions/i))
    await userEvent.click(await screen.findByText(/enable guest/i))
    await waitFor(() => expect(mockedPatchReq).toBeCalledTimes(1))
  })

  it('should click "disable guest" correctly', async () => {
    mockServer.use(
      rest.patch(
        ClientUrlsInfo.generateGuestPassword.url,
        (_, res, ctx) => {
          mockedPatchReq()
          return res(ctx.json(RegenerateGuestPassword))
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

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('test3'))
    await screen.findByText('Guest Details')

    const drawer = await screen.findByRole('dialog')
    expect(await within(drawer).findByTestId('guest-status')).toHaveTextContent('Offline')
    await userEvent.click(await within(drawer).findByText(/actions/i))
    await userEvent.click(await screen.findByText(/disable guest/i))
    await waitFor(() => expect(mockedPatchReq).toBeCalledTimes(1))
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

    await openGuestDetailsAndClickAction('test5')
    await userEvent.click(await screen.findByRole('menuitem', { name: /generate new password/i }))
    const dialog = await screen.findByTestId('generate-password-modal')
    expect(await within(dialog).findByText('Generate New Password')).toBeVisible()
    expect(await within(dialog).findByText('Send to Phone')).toBeVisible()
    expect(await within(dialog).findByText('Send to Email')).toBeVisible()
    const cancelButton = within(dialog).getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should click "generate new password" validation 1', async () => {
    const json = {
      requestId: '96dcffb7-583a-499a-8305-def359adf8b4',
      response: {
        id: '0b71a2d4-6dc0-4616-8d1e-105deee0ad72',
        createdDate: 1670475350467,
        name: 'guest1',
        disabled: false,
        wifiNetworkId: 'd50b652907b64a008e8af2d160b29b64',
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
        (_, res, ctx) => {
          mockedPatchReq()
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
    await userEvent.click(await screen.findByRole('checkbox', { name: /Print Guest pass/ }))
    expect(await screen.findByRole('checkbox', { name: /Print Guest pass/ })).toBeChecked()
    const generateButton = screen.getByRole('button', { name: 'Generate' })
    await userEvent.click(generateButton)
    await waitFor(() => expect(mockedPatchReq).toBeCalledTimes(1))
  })

  it('should click "generate new password" validation 2', async () => {
    const json = {
      requestId: '96dcffb7-583a-499a-8305-def359adf8b4',
      response: {
        id: '0b71a2d4-6dc0-4616-8d1e-105deee0ad72',
        createdDate: 1670475350467,
        name: 'guest1',
        disabled: false,
        wifiNetworkId: 'd50b652907b64a008e8af2d160b29b64',
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
        (_, res, ctx) => {
          mockedPatchReq()
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
    await userEvent.click(screen.getByRole('checkbox', { name: /print guest pass/i }))
    expect(await screen.findByRole('checkbox', { name: /Print Guest pass/ })).toBeChecked()
    const generateButton = screen.getByRole('button', { name: 'Generate' })
    expect(generateButton).toBeEnabled()
    await userEvent.click(generateButton)
    await waitFor(() => expect(mockedPatchReq).toBeCalledTimes(1))
  })

  it('should handle error for generate password', async () => {
    const spyLog = jest.spyOn(console, 'log')
    mockServer.use(
      rest.patch(
        ClientUrlsInfo.generateGuestPassword.url,
        (_, res, ctx) => res(ctx.status(404), ctx.json({}))
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

  it('should show "Import from file" correctly', async () => {
    const userProfile = getUserProfile()
    setUserProfile({
      ...userProfile,
      allowedOperations: ['POST:/wifiNetworks/{wifiNetworkId}/guestUsers']
    })

    mockServer.use(
      rest.post(
        ClientUrlsInfo.importGuestPass.url,
        (_, res, ctx) => {
          mockedImportFileReq()
          return res(ctx.status(400), ctx.json({
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

    await waitFor(async () =>
      expect(await screen.findByRole('button', { name: /Import from file/ })).toBeEnabled()
    )

    const importBtn = await screen.findByRole('button', { name: 'Import from file' })
    await userEvent.click(importBtn)
    const dialog = await screen.findByRole('dialog')
    const csvFile = new File([''], 'guests_import_template.csv', { type: 'text/csv' })
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)
    const allowedNetworkCombo =
      await within(dialog).findByLabelText('Allowed Network', { exact: false })
    fireEvent.mouseDown(allowedNetworkCombo)
    const option = await screen.findByText('guest pass wlan2')
    await userEvent.click(option)
    await userEvent.click(await within(dialog).findByRole('checkbox', { name: /Print Guest pass/ }))
    expect(await screen.findByRole('checkbox', { name: /Print Guest pass/ })).not.toBeChecked()
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Import' }))
    expect(await screen.findByText(/Guest pass won\’t be printed or sent/)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Yes, create guest pass' }))
    await waitFor(() => expect(dialog).toHaveTextContent('File does not contain any entries'))
    await waitFor(() => expect(mockedImportFileReq).toBeCalledTimes(1))
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
    expect(await screen.findByRole('dialog')).not.toBeVisible()
  })

  it.skip('should click "generate new password" without mail and phone number', async () => {
    mockServer.use(
      rest.patch(
        ClientUrlsInfo.generateGuestPassword.url,
        (_, res, ctx) => {
          mockedPatchReq()
          return res(ctx.json(RegenerateGuestPassword))
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
    await waitFor(() => expect(mockedPatchReq).toBeCalledTimes(1))
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
    await openGuestDetailsAndClickAction('test5')
    await userEvent.click(await screen.findByRole('menuitem', { name: /download information/i }))
    await waitFor(() => expect(mockedDownloadReq).toBeCalledTimes(1))
  })
})
