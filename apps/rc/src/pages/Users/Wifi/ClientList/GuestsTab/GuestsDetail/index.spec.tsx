import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                                      from '@acx-ui/feature-toggle'
import { clientApi, networkApi, switchApi }                                  from '@acx-ui/rc/services'
import { ClientUrlsInfo, CommonUrlsInfo, GuestFixtures, SwitchRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                   from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'
import { WifiScopes }                     from '@acx-ui/types'
import { getUserProfile, setUserProfile } from '@acx-ui/user'

import {
  GuestClients,
  RegenerateGuestPassword
} from '../../../__tests__/fixtures'
import { GuestsTable }     from '../GuestsTable'
import { GuestTabContext } from '../GuestsTable/context'

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

const mockNetworkData = { data: AllowedNetworkList, isLoading: false }

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
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

const mockGetClientList = jest.fn()

describe('Guest Generate New Password Modal', () => {
  const params: { tenantId: string, networkId: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    networkId: 'tenant-id'
  }
  const userProfile = getUserProfile()
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
    mockGetClientList.mockClear()
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(clientApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    store.dispatch(switchApi.util.resetApiState())

    setUserProfile({
      ...userProfile,
      abacEnabled: false,
      isCustomRole: false,
      allowedOperations: [
        'POST:/wifiNetworks/{wifiNetworkId}/guestUsers',
        'PATCH:/wifiNetworks/{wifiNetworkId}/guestUsers/{guestUserId}',
        'DELETE:/wifiNetworks/{wifiNetworkId}/guestUsers/{guestUserId}',
        'POST:/wifiNetworks',
        'POST:/guestUsers'
      ]
    })

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getGuestsList.url,
        (_, res, ctx) => res(ctx.json(GuestList))
      ),
      rest.post(
        ClientUrlsInfo.getClients.url,
        (_, res, ctx) => {
          mockGetClientList()
          return res(ctx.json(GuestClients))
        }
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
      ),
      rest.patch(
        ClientUrlsInfo.generateGuestPassword.url,
        (_, res, ctx) => {
          mockedPatchReq()
          return res(ctx.json(RegenerateGuestPassword))
        }
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json({ totalCount: 0, data: [] }))
      )
    )
  })

  it('should generate new password correctly from the action bar', async () => {
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
    await waitFor(() => expect(mockedPatchReq).toBeCalledTimes(1))
    await waitFor(() => expect(dialog).not.toBeVisible())
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

  it('should click "generate new password" and show password input and validate', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

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

    const autoRadio = await screen.findByTestId('auto-radio')
    expect(autoRadio).toBeInTheDocument()

    const manualRadio = await screen.findByTestId('manual-radio')
    expect(manualRadio).toBeInTheDocument()

    await userEvent.click(manualRadio)
    expect(manualRadio).toBeChecked()

    const manualPasswordInput = await screen.findByTestId('manual-password-input')
    expect(manualPasswordInput).toBeInTheDocument()

    await userEvent.type(manualPasswordInput, '456789')
    // eslint-disable-next-line
    expect(await screen.queryByText('Passwords on the same network should be unique.')).not.toBeInTheDocument()
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

  describe('ABAC permission', () => {
    it('should dispaly with custom scopeKeys', async () => {
      setUserProfile({
        profile: {
          ...getUserProfile().profile
        },
        allowedOperations: ['POST:/wifiNetworks/{wifiNetworkId}/guestUsers'],
        abacEnabled: true,
        isCustomRole: true,
        scopes: [WifiScopes.CREATE]
      })

      render(
        <Provider>
          <GuestTabContext.Provider value={{ setGuestCount }}>
            <GuestsTable />
          </GuestTabContext.Provider>
        </Provider>, {
          route: { params, path: '/:tenantId/t/users/wifi/guests' }
        })

      expect(await screen.findByRole('button', { name: 'Add Guest' })).toBeEnabled()
      const table = await screen.findByRole('table')
      expect(await within(table).findByText('test1')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Add Guest' }))
      const dialog = await screen.findByRole('dialog')
      await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(dialog).not.toBeVisible())
    })

    it('should correctly hide with custom scopeKeys', async () => {
      setUserProfile({
        profile: {
          ...getUserProfile().profile
        },
        allowedOperations: [],
        abacEnabled: true,
        isCustomRole: true,
        scopes: [WifiScopes.DELETE]
      })

      render(
        <Provider>
          <GuestTabContext.Provider value={{ setGuestCount }}>
            <GuestsTable />
          </GuestTabContext.Provider>
        </Provider>, {
          route: { params, path: '/:tenantId/t/users/wifi/guests' }
        })

      await waitFor(() => {
        expect(mockGetClientList).toBeCalledTimes(2)
      })
      expect(screen.queryByRole('button', { name: 'Add Guest' })).toBeNull()
    })
  })
})
