import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo, getGuestDictionaryByLangCode } from '@acx-ui/rc/utils'
import { Provider }                                                   from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'
import { UserUrlsInfo } from '@acx-ui/user'

import {
  GuestClient,
  AllowedNetworkList,
  UserProfile,
  AddGuestPassResponse,
  wifiNetworkDetail,
  AddGuestPassErrorResponse,
  AllowedNetworkSingleList,
  AddGuestPassWihtoutExpirationResponse,
  network,
  userProfile
} from '../../../__tests__/fixtures'

import {
  AddGuestDrawer,
  genUpdatedTemplate,
  getHumanizedLocale,
  getMomentLocale
} from './addGuestDrawer'

jest.mock('socket.io-client')

const mobilePlaceHolder = /555/
describe.skip('Add Guest Drawer', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (req, res, ctx) => res(ctx.json(network))
      ),
      rest.post(CommonUrlsInfo.getGuestsList.url, (req, res, ctx) =>
        res(ctx.json(GuestClient))
      ),
      rest.get(
        UserUrlsInfo.getUserProfile.url,
        (req, res, ctx) => res(ctx.json(userProfile))
      ),
      rest.post(CommonUrlsInfo.getVMNetworksList.url, (req, res, ctx) =>
        res(ctx.json(AllowedNetworkList))
      ),
      rest.post(CommonUrlsInfo.addGuestPass.url, (req, res, ctx) =>
        res(ctx.json(AddGuestPassResponse))
      ),
      rest.get(WifiUrlsInfo.getNetwork.url, (req, res, ctx) =>
        res(ctx.json(wifiNetworkDetail))
      ),
      rest.get(UserUrlsInfo.getUserProfile.url, (req, res, ctx) =>
        res(ctx.json(UserProfile))
      )
    )
    params = {
      tenantId: 'tenant-id'
    }
  })

  it('should create guest correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Guest Name' }),
      'wifitest'
    )
    await userEvent.type(
      await screen.findByPlaceholderText(mobilePlaceHolder),
      '+12052220123'
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Email' }),
      'ruckus@commscope.com'
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Note' }),
      'test wifi'
    )

    const allowedNetworkCombo = await screen.findAllByRole('combobox')
    fireEvent.mouseDown(allowedNetworkCombo[1])
    const option = await screen.findAllByText('guest pass wlan1')
    await userEvent.click(option[0])

    fireEvent.click(await screen.findByTestId('saveBtn'))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should created guest without delivery methods correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Guest Name' }),
      'wifitest'
    )

    const allowedNetworkCombo = await screen.findAllByRole('combobox')
    fireEvent.mouseDown(allowedNetworkCombo[1])
    const option = await screen.findAllByText('guest pass wlan1')
    await userEvent.click(option[0])

    await userEvent.click(await screen.findByRole('checkbox', { name: /Print Guest pass/ }))

    fireEvent.click(await screen.findByTestId('saveBtn'))
    fireEvent.click(await screen.findByText('Yes, create guest pass'))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should created guest without expiration period correctly', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.addGuestPass.url, (req, res, ctx) =>{
        return res(ctx.json(AddGuestPassWihtoutExpirationResponse))
      })
    )
    const { asFragment } = render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Guest Name' }),
      'wifitest'
    )

    const allowedNetworkCombo = await screen.findAllByRole('combobox')
    fireEvent.mouseDown(allowedNetworkCombo[1])
    const option = await screen.findAllByText('guest pass wlan1')
    await userEvent.click(option[0])

    fireEvent.click(await screen.findByTestId('saveBtn'))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should created guest without expiration and unit day period correctly', async () => {
    AddGuestPassWihtoutExpirationResponse.response[0].expiration.unit = 'Day'
    mockServer.use(
      rest.post(CommonUrlsInfo.addGuestPass.url, (req, res, ctx) =>{
        return res(ctx.json(AddGuestPassWihtoutExpirationResponse))
      })
    )
    const { asFragment } = render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Guest Name' }),
      'wifitest'
    )

    const allowedNetworkCombo = await screen.findAllByRole('combobox')
    fireEvent.mouseDown(allowedNetworkCombo[1])
    const option = await screen.findAllByText('guest pass wlan1')
    await userEvent.click(option[0])

    fireEvent.click(await screen.findByTestId('saveBtn'))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should handle error correctly', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.addGuestPass.url, (req, res, ctx) =>{
        return res(
          // Send a valid HTTP status code
          ctx.status(400),
          // And a response body, if necessary
          ctx.json(AddGuestPassErrorResponse)
        )
      })
    )

    const { asFragment } = render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Guest Name' }),
      'wifitest'
    )
    await userEvent.type(
      await screen.findByPlaceholderText(mobilePlaceHolder),
      '+12052220123'
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Email' }),
      'ruckus@commscope.com'
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Note' }),
      'test wifi'
    )

    const allowedNetworkCombo = await screen.findAllByRole('combobox')
    fireEvent.mouseDown(allowedNetworkCombo[1])
    const option = await screen.findAllByText('guest pass wlan1')
    await userEvent.click(option[0])

    fireEvent.click(await screen.findByTestId('saveBtn'))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should handle error 400 correctly', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.addGuestPass.url, (req, res, ctx) =>{
        return res(
          // Send a valid HTTP status code
          ctx.status(400),
          // And a response body, if necessary
          ctx.json(AddGuestPassErrorResponse)
        )
      })
    )

    const { asFragment } = render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Guest Name' }),
      'wifitest'
    )
    await userEvent.type(
      await screen.findByPlaceholderText(mobilePlaceHolder),
      '+12052220123'
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Email' }),
      'ruckus@commscope.com'
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Note' }),
      'test wifi'
    )

    const allowedNetworkCombo = await screen.findAllByRole('combobox')
    fireEvent.mouseDown(allowedNetworkCombo[1])
    const option = await screen.findAllByText('guest pass wlan1')
    await userEvent.click(option[0])

    fireEvent.click(await screen.findByTestId('saveBtn'))

    expect(asFragment()).toMatchSnapshot()
  })
  it('should handle error 409 correctly', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.addGuestPass.url, (req, res, ctx) =>{
        return res(
          // Send a valid HTTP status code
          ctx.status(409),
          // And a response body, if necessary
          ctx.json(AddGuestPassErrorResponse)
        )
      })
    )

    const { asFragment } = render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Guest Name' }),
      'wifitest'
    )
    await userEvent.type(
      await screen.findByPlaceholderText(mobilePlaceHolder),
      '+12052220123'
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Email' }),
      'ruckus@commscope.com'
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Note' }),
      'test wifi'
    )

    const allowedNetworkCombo = await screen.findAllByRole('combobox')
    fireEvent.mouseDown(allowedNetworkCombo[1])
    const option = await screen.findAllByText('guest pass wlan1')
    await userEvent.click(option[0])

    fireEvent.click(await screen.findByTestId('saveBtn'))

    expect(asFragment()).toMatchSnapshot()
  })
  it('should handle error 422 correctly', async () => {
    AddGuestPassErrorResponse.error.rootCauseErrors[0].code = 'GUEST-422006'
    mockServer.use(
      rest.post(CommonUrlsInfo.addGuestPass.url, (req, res, ctx) =>{
        return res(
          // Send a valid HTTP status code
          ctx.status(422),
          // And a response body, if necessary
          ctx.json(AddGuestPassErrorResponse)
        )
      })
    )

    const { asFragment } = render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Guest Name' }),
      'wifitest'
    )
    await userEvent.type(
      await screen.findByPlaceholderText(mobilePlaceHolder),
      '+12052220123'
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Email' }),
      'ruckus@commscope.com'
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Note' }),
      'test wifi'
    )

    const allowedNetworkCombo = await screen.findAllByRole('combobox')
    fireEvent.mouseDown(allowedNetworkCombo[1])
    const option = await screen.findAllByText('guest pass wlan1')
    await userEvent.click(option[0])

    fireEvent.click(await screen.findByTestId('saveBtn'))

    expect(asFragment()).toMatchSnapshot()
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
      rest.post(CommonUrlsInfo.getVMNetworksList.url, (req, res, ctx) =>
        res(ctx.json(AllowedNetworkSingleList))
      )
    )
    const { asFragment } = render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Guest Name' }),
      'wifitest'
    )
    await userEvent.type(
      await screen.findByPlaceholderText(mobilePlaceHolder),
      '+12052220123'
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Email' }),
      'ruckus@commscope.com'
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Note' }),
      'test wifi'
    )

    fireEvent.click(await screen.findByTestId('saveBtn'))
    expect(asFragment()).toMatchSnapshot()
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
    const { asFragment } = render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )

    fireEvent.click(await screen.findByTestId('cancelBtn'))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should validate duration correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <AddGuestDrawer visible={true} setVisible={jest.fn()} />
      </Provider>, { route: { params } }
    )

    const duration = await screen.findByText('Pass is Valid for' )
    await userEvent.type(duration, '366')
    expect(await screen.findByText('Value must be between 1 and 365')).toBeVisible()

    const unitCombo = await screen.findByTitle('Days')
    fireEvent.mouseDown(unitCombo)
    await userEvent.click(await screen.findByText('Hours'))

    await userEvent.type(duration, '8761')
    expect(await screen.findByText('Value must be between 1 and 8760')).toBeVisible()

    fireEvent.click(await screen.findByTestId('cancelBtn'))
    expect(asFragment()).toMatchSnapshot()
  })
})
