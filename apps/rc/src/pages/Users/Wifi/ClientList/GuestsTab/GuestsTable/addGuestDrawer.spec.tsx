import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                                 from '@acx-ui/feature-toggle'
import { clientApi, networkApi }                                        from '@acx-ui/rc/services'
import { CommonUrlsInfo, ClientUrlsInfo, getGuestDictionaryByLangCode } from '@acx-ui/rc/utils'
import { store, Provider }                                              from '@acx-ui/store'
import {
  act,
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'
import { RolesEnum }                      from '@acx-ui/types'
import { getUserProfile, setUserProfile } from '@acx-ui/user'
import { UserUrlsInfo }                   from '@acx-ui/user'

import {
  GuestList,
  GuestClients,
  AllowedNetworkList,
  VenueList,
  UserProfile,
  AddGuestPassResponse,
  AddGuestPassErrorResponse,
  AllowedNetworkSingleList,
  AddGuestPassWihtoutExpirationResponse,
  validationFailed
} from '../../../__tests__/fixtures'

import {
  AddGuestDrawer,
  genUpdatedTemplate,
  getHumanizedLocale,
  getMomentLocale
} from './addGuestDrawer'

jest.mock('socket.io-client')
jest.spyOn(window, 'print').mockImplementation(jest.fn())

const mobilePlaceHolder = '555'

async function fillInfo () {
  await userEvent.type(await screen.findByRole('textbox', { name: 'Guest Name' }), 'wifitest')
  await userEvent.type(await screen.findByPlaceholderText(mobilePlaceHolder), '+12052220123')
  await userEvent.type(
    await screen.findByRole('textbox', { name: 'Email' }), 'ruckus@commscope.com')
  await userEvent.type(await screen.findByRole('textbox', { name: 'Note' }), 'test wifi')
}
async function selectAllowedNetwork (optionName: string) {
  const allowedNetworkCombo = await screen.findByRole('combobox', { name: 'Allowed Network' })
  await userEvent.click(allowedNetworkCombo)
  const option = await screen.findByText(optionName)
  await userEvent.click(option)
}

const mockedAddGuestReq = jest.fn()

jest.mock('@acx-ui/rc/components', () => ({
  PhoneInput: () => <input data-testid='PhoneInput' placeholder={mobilePlaceHolder}/>
}))

describe('Add Guest Drawer', () => {
  let params: { tenantId: string, networkId: string }
  const userProfile = getUserProfile()

  beforeEach(() => {
    mockedAddGuestReq.mockClear()
    store.dispatch(clientApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())

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
      rest.post(CommonUrlsInfo.getGuestsList.url, (_, res, ctx) =>
        res(ctx.json(GuestList))
      ),
      rest.post(ClientUrlsInfo.getClients.url, (_, res, ctx) =>
        res(ctx.json(GuestClients))
      ),
      rest.post(CommonUrlsInfo.getVenues.url, (_, res, ctx) =>
        res(ctx.json(VenueList))
      ),
      rest.post(CommonUrlsInfo.getWifiNetworksList.url, (_, res, ctx) =>
        res(ctx.json(AllowedNetworkList))
      ),
      rest.post(CommonUrlsInfo.addGuestPass.url, (_, res, ctx) => {
        mockedAddGuestReq()
        return res(ctx.json(AddGuestPassResponse))
      }),
      rest.get(UserUrlsInfo.getUserProfile.url, (_, res, ctx) =>
        res(ctx.json(UserProfile))
      ),
      rest.patch(ClientUrlsInfo.validateGuestPassword.url, (_, res, ctx) =>
        res(
          ctx.status(422),
          ctx.json(validationFailed)
        )
      )
    )
    params = {
      tenantId: 'tenant-id',
      networkId: 'network-id'
    }
  })

  afterEach(() => {
    Modal.destroyAll()
  })

  it('should create guest correctly', async () => {
    render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )

    await fillInfo()
    await selectAllowedNetwork('guest pass wlan1')
    await userEvent.click(await screen.findByTestId('saveBtn'))
    await waitFor(()=>{
      expect(mockedAddGuestReq).toBeCalledTimes(1)
    })
  })
  it('should created guest without delivery methods correctly', async () => {
    render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )

    expect(await screen.findByText(/Add Guest Pass/)).toBeVisible()
    await userEvent.type(await screen.findByRole('textbox', { name: 'Guest Name' }), 'wifitest')

    await selectAllowedNetwork('guest pass wlan1')

    await userEvent.click(await screen.findByRole('checkbox', { name: /Print Guest pass/ }))
    expect(await screen.findByRole('checkbox', { name: /Print Guest pass/ })).not.toBeChecked()
    expect(await screen.findByTestId('saveBtn')).toBeEnabled()

    await userEvent.click(await screen.findByTestId('saveBtn'))
    await waitFor(async ()=>{
      expect(await screen.findByText(/Guest pass won’t be printed or sent/)).toBeVisible()
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [drawer, dialog, ...rest] = await screen.findAllByRole('dialog')
    await userEvent.click(
      await within(dialog).findByRole('button', { name: 'Yes, create guest pass' })
    )
    await waitFor(()=> expect(dialog).not.toBeVisible())
    await waitFor(()=>{
      expect(mockedAddGuestReq).toBeCalled()
    })
  })
  it('should created guest without expiration period correctly', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.addGuestPass.url, (_, res, ctx) =>{
        mockedAddGuestReq()
        return res(ctx.json(AddGuestPassWihtoutExpirationResponse))
      })
    )
    render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )
    expect(await screen.findByText(/Add Guest Pass/)).toBeVisible()
    await userEvent.type(await screen.findByRole('textbox', { name: 'Guest Name' }), 'wifitest')

    await selectAllowedNetwork('guest pass wlan1')

    await userEvent.click(await screen.findByTestId('saveBtn'))
    await waitFor(()=>{
      expect(mockedAddGuestReq).toBeCalled()
    })
  })
  it('should created guest without expiration and unit day period correctly', async () => {
    AddGuestPassWihtoutExpirationResponse.response.expiration.unit = 'Day'
    mockServer.use(
      rest.post(CommonUrlsInfo.addGuestPass.url, (_, res, ctx) =>{
        mockedAddGuestReq()
        return res(ctx.json(AddGuestPassWihtoutExpirationResponse))
      })
    )
    render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )
    await userEvent.type(await screen.findByRole('textbox', { name: 'Guest Name' }), 'wifitest')

    await selectAllowedNetwork('guest pass wlan1')

    await userEvent.click(await screen.findByTestId('saveBtn'))
    await waitFor(()=>{
      expect(mockedAddGuestReq).toBeCalled()
    })
  })
  it('should handle error correctly', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.addGuestPass.url, (_, res, ctx) =>{
        mockedAddGuestReq()
        return res(
          // Send a valid HTTP status code
          ctx.status(400),
          // And a response body, if necessary
          ctx.json(AddGuestPassErrorResponse)
        )
      })
    )

    render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )

    await fillInfo()
    await selectAllowedNetwork('guest pass wlan1')

    await userEvent.click(await screen.findByTestId('saveBtn'))
    await waitFor(()=>{
      expect(mockedAddGuestReq).toBeCalledTimes(1)
    })
  })
  it('should handle error 400 correctly', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.addGuestPass.url, (_, res, ctx) =>{
        return res(
          // Send a valid HTTP status code
          ctx.status(400),
          // And a response body, if necessary
          ctx.json(AddGuestPassErrorResponse)
        )
      })
    )

    render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )

    await fillInfo()
    await selectAllowedNetwork('guest pass wlan1')

    await userEvent.click(await screen.findByTestId('saveBtn'))
  })
  it('should handle error 409 correctly', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.addGuestPass.url, (_, res, ctx) =>{
        return res(
          // Send a valid HTTP status code
          ctx.status(409),
          // And a response body, if necessary
          ctx.json(AddGuestPassErrorResponse)
        )
      })
    )

    render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )

    await fillInfo()
    await selectAllowedNetwork('guest pass wlan1')
    await userEvent.click(await screen.findByTestId('saveBtn'))
  })
  it('should handle error 422 correctly', async () => {
    AddGuestPassErrorResponse.error.rootCauseErrors[0].code = 'GUEST-422006'
    mockServer.use(
      rest.post(CommonUrlsInfo.addGuestPass.url, (_, res, ctx) =>{
        return res(
          // Send a valid HTTP status code
          ctx.status(422),
          // And a response body, if necessary
          ctx.json(AddGuestPassErrorResponse)
        )
      })
    )

    render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )

    await fillInfo()
    await selectAllowedNetwork('guest pass wlan1')
    await userEvent.click(await screen.findByTestId('saveBtn'))
  })
  it('test genUpdatedTemplate function', async () => {
    const guestDetail = {
      currentDate: '2022/12/07',
      guestNumber: 0,
      langCode: 'en',
      name: 'test1',
      password: '966169',
      validFor: '7 days',
      wifiNetwork: 'guest pass wlan'
    }

    const langDictionary = getGuestDictionaryByLangCode('en')
    genUpdatedTemplate(guestDetail, langDictionary)
  })
  it('should create guest with single network options correctly', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.getWifiNetworksList.url, (_, res, ctx) =>
        res(ctx.json(AllowedNetworkSingleList))
      )
    )
    render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )

    await fillInfo()
    await userEvent.click(await screen.findByTestId('saveBtn'))
    await waitFor(()=>{
      expect(mockedAddGuestReq).toBeCalledTimes(1)
    })
  })
  it('test getMomentLocale', async () => {
    getMomentLocale()
    getMomentLocale('eng')
  })
  it('test getHumanizedLocale', async () => {
    getHumanizedLocale()
    getHumanizedLocale('pt_BR')
  })
  it('should close guest drawer correctly', async () => {
    const setVisible = jest.fn()
    render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={setVisible} />
      </Provider>, { route: { params } }
    )

    const drawer = await screen.findByRole('dialog')
    expect(drawer).toBeVisible()
    await userEvent.click(await screen.findByTestId('cancelBtn'))
    expect(setVisible).toBeCalledTimes(1)
  })
  it('should validate duration correctly', async () => {
    const setVisible = jest.fn()
    render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={setVisible} />
      </Provider>, { route: { params } }
    )

    const duration = await screen.findByTestId('expirationDuration')
    await userEvent.type(duration, '366')
    expect(await screen.findByText('Value must be between 1 and 365')).toBeVisible()

    const unitCombo = await screen.findByTitle('Days')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => { fireEvent.mouseDown(unitCombo) })
    await userEvent.click(await screen.findByText('Hours'))

    await userEvent.type(duration, '8761')
    expect(await screen.findByText('Value must be between 1 and 8760')).toBeVisible()

    await userEvent.click(await screen.findByTestId('cancelBtn'))
    expect(setVisible).toBeCalledTimes(1)
  })
  it('should show manual password and do validation', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const setVisible = jest.fn()
    render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={setVisible} />
      </Provider>, { route: { params: { ...params, networkId: '123456' } } }
    )

    await selectAllowedNetwork('guest pass wlan1')

    const autoRadio = await screen.findByTestId('auto-radio')
    expect(autoRadio).toBeInTheDocument()

    const manualRadio = await screen.findByTestId('manual-radio')
    expect(manualRadio).toBeInTheDocument()

    await userEvent.click(manualRadio)
    expect(manualRadio).toBeChecked()

    const manualPasswordInput = await screen.findByTestId('manual-password-input')
    expect(manualPasswordInput).toBeInTheDocument()

    await userEvent.type(manualPasswordInput, '123456')
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
