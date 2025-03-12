import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                                      from '@acx-ui/feature-toggle'
import { clientApi, networkApi, switchApi }                                  from '@acx-ui/rc/services'
import { ClientUrlsInfo, CommonUrlsInfo, GuestFixtures, SwitchRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                   from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'
import { RolesEnum, WifiScopes }          from '@acx-ui/types'
import { getUserProfile, setUserProfile } from '@acx-ui/user'

import {
  VenueList,
  GuestClients
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

const mockFormData = new FormData()

jest.mock('@acx-ui/rc/components', () => ({
  NetworkForm: () => <div data-testid='network-form' />,
  ImportFileDrawer: ({ importRequest, onClose, visible }: {
    visible: boolean
    importRequest: (formData: FormData, values: object) => void
    onClose: () => void
  }) =>
    visible && <div data-testid={'ImportFileDrawer'}>
      <button onClick={(e)=>{
        e.preventDefault()
        importRequest(mockFormData, { wifiNetworkId: 'network-id', deliveryMethods: [] })
      }}>Import</button>
      <button onClick={(e)=>{
        e.preventDefault()
        onClose()
      }}>Cancel</button>
    </div>,
  CsvSize: {},
  ImportFileDrawerType: {},
  ClientHealthIcon: () => <div data-testid='ClientHealthIcon' />
}))

jest.mock('./addGuestDrawer', () => ({
  ...jest.requireActual('./addGuestDrawer'),
  AddGuestDrawer: () => <div data-testid='AddGuestDrawer' />
}))

jest.mock('../GuestsDetail/generateNewPasswordModal', () => ({
  GenerateNewPasswordModal: () => <div data-testid='GenerateNewPasswordModal' />
}))

const mockGuestData = { data: GuestList, isLoading: false }
const mockNetworkData = { data: AllowedNetworkList, isLoading: false }

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetGuestsListQuery: () => mockGuestData,
  useWifiNetworkListQuery: () => mockNetworkData,
  useGetGuestsMutation: () => {
    return [() => {
      mockedDownloadReq()
      return { unwrap: () => Promise.resolve(), catch: () => {} }
    }, { isLoading: false }]
  },
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
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    act(() => {
      store.dispatch(clientApi.util.resetApiState())
      store.dispatch(networkApi.util.resetApiState())
      store.dispatch(switchApi.util.resetApiState())
    })

    setUserProfile({
      ...userProfile,
      profile: {
        ...userProfile.profile,
        customRoleName: RolesEnum.GUEST_MANAGER
      },
      abacEnabled: false,
      isCustomRole: false
    })

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getGuestsList.url,
        (_, res, ctx) => res(ctx.json(GuestList))
      ),
      rest.post(
        ClientUrlsInfo.getClients.url,
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
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json({ totalCount: 0, data: [] }))
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
    expect(await screen.findByTestId('AddGuestDrawer')).toBeVisible()
  })

  it('should render Add Guest Pass Network modal correctly', async () => {
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
    await waitFor(() => expect(mockedDeleteReq).toBeCalledTimes(1))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should click "delete" on GuestDetailDrawer correctly', async () => {
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
    await userEvent.click(await screen.findByRole('button', { name: 'Disable' }))
    await waitFor(() => expect(mockedPatchReq).toBeCalledTimes(1))
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
    expect(await screen.findByText('Download Information')).toBeVisible()
    expect(await screen.findByText('Guest Details')).toBeVisible()
    const dialog = await screen.findByRole('dialog')
    const closeButton = await within(dialog).findByTestId('CloseSymbol')
    expect(closeButton).toBeVisible()
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
    setUserProfile({
      ...userProfile,
      profile: {
        ...userProfile.profile,
        dateFormat: 'dd/mm/yyyy'
      }
    })

    const table = await screen.findByRole('table')
    await userEvent.click(await within(table).findByText('20/11/2022 08:57'))
    expect(await screen.findByText('Guest Details')).toBeVisible()
    const dialog = await screen.findByRole('dialog')
    const closeButton = await within(dialog).findByTestId('CloseSymbol')
    expect(closeButton).toBeVisible()
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
    await waitFor(() => expect(mockedPatchReq).toBeCalledTimes(1))
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
    await waitFor(() => expect(mockedPatchReq).toBeCalledTimes(1))
  })

  it('should show "Import from file" correctly', async () => {

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

    const dialog = await screen.findByTestId('ImportFileDrawer')
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Import' }))
    expect(await screen.findByText(/Guest pass won’t be printed or sent/)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Yes, create guest pass' }))
    await waitFor(() => expect(mockedImportFileReq).toBeCalledTimes(1))
  })

  it('should show correct template file after guest-manual-password-toggle turn on', async () => {
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

    expect(await screen.findByTestId('ImportFileDrawer')).toBeVisible()
  })


  it('should click "download" correctly', async () => {
    render(
      <Provider>
        <GuestTabContext.Provider value={{ setGuestCount }}>
          <GuestsTable />
        </GuestTabContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/guests' }
      })

    await openGuestDetailsAndClickAction('test5')
    await userEvent.click(await screen.findByRole('menuitem', { name: /download information/i }))
    await waitFor(() => expect(mockedDownloadReq).toBeCalledTimes(1))
  })

  describe('ABAC permission', () => {
    it('should dispaly with custom scopeKeys', async () => {
      setUserProfile({
        ...userProfile,
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
      expect(await screen.findByTestId('AddGuestDrawer')).toBeVisible()
    })

    it('should correctly hide with custom scopeKeys', async () => {
      setUserProfile({
        ...userProfile,
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
      expect(screen.queryByRole('button', { name: 'Add Guest' })).toBeNull()
    })
  })
})
