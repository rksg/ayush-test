import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { administrationApi }                       from '@acx-ui/rc/services'
import { AdministrationUrlsInfo, SmsProviderType } from '@acx-ui/rc/utils'
import { Provider, store }                         from '@acx-ui/store'
import {
  render,
  screen,
  waitFor,
  mockServer,
  fireEvent
} from '@acx-ui/test-utils'

import { SmsProviderItem } from '.'

const fakeSmsNoProvider = {
  threshold: 80,
  provider: SmsProviderType.RUCKUS_ONE,
  ruckusOneUsed: 0
}

const fakeSmsTwilioProvider = {
  threshold: 80,
  provider: SmsProviderType.TWILIO,
  ruckusOneUsed: 0
}

const fakedTwilioData = {
  data: {
    accountSid: 'AC1234567890abcdef1234567890abcdef',
    authToken: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6',
    fromNumber: '+19388887785',
    apiKey: '29b04e7f-3bfb-4fed-b333-a49327981cab',
    url: 'test.com'
  }
}

const fakedTwilioWhatsappData = {
  data: {
    ...fakedTwilioData.data,
    enableWhatsapp: true,
    authTemplateSid: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6'
  }
}

const fakeSmsEsendexProvider = {
  threshold: 80,
  provider: SmsProviderType.ESENDEX,
  ruckusOneUsed: 0
}

const fakeSmsOthersProvider = {
  threshold: 80,
  provider: SmsProviderType.OTHERS,
  ruckusOneUsed: 0
}
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const services = require('@acx-ui/rc/services')
const mockMutation = jest.fn().mockImplementation(() => Promise.resolve())
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useUpdateNotificationSmsMutation: () => ([ mockMutation ])
}))

describe('SMS Provider Form Item', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useGetAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: [] }
    })
    store.dispatch(administrationApi.util.resetApiState())
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getNotificationSmsProvider.url,
        (req, res, ctx) => res(ctx.json({ fakedTwilioData }))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  afterEach(() => {
    mockServer.resetHandlers()
  })
  it('should render correctly when no data exists', async () => {
    services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeSmsNoProvider }
    })
    render(
      <Provider>
        <SmsProviderItem/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('SMS Provider')).toBeVisible()
    expect(screen.getByText('This account has a 100 SMS pool for')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Set SMS Provider' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Change' })).toBeVisible()
  })
  it('should update threshold correctly', async () => {
    services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeSmsNoProvider }
    })
    render(
      <Provider>
        <SmsProviderItem/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('SMS Provider')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Change' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(await screen.findByRole('button', { name: 'Cancel' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(await screen.findByRole('button', { name: 'Save' })).toBeVisible()
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '70' } } )
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = expect.objectContaining({
      payload: { provider: SmsProviderType.RUCKUS_ONE, threshold: '70' }
    })
    await waitFor(()=> {
      expect(mockMutation).toHaveBeenLastCalledWith(value)
    })
  })
  it('should render layout correctly when in grace period', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
      return { data: { ...fakeSmsNoProvider, ruckusOneUsed: 110 } }
    })
    render(
      <Provider>
        <SmsProviderItem/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('SMS Provider')).toBeVisible()
    expect(screen.getByText('Attention! RUCKUS SMS pool for Captive')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Set SMS Provider' })).toBeVisible()
  })
  it('should show drawer when Set SMS Provider button is clicked', async () => {
    services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeSmsNoProvider }
    })
    render(
      <Provider>
        <SmsProviderItem/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('SMS Provider')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Set SMS Provider' }))
    expect(screen.getAllByText('Set SMS Provider')).toHaveLength(2)
  })
  it('should render layout correctly when twilio data exists', async () => {
    services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeSmsTwilioProvider }
    })
    render(
      <Provider>
        <SmsProviderItem/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('SMS Provider')).toBeVisible()
    expect(screen.getByText('Account SID')).toBeVisible()
    expect(screen.getByText('Auth Token')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Change' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeVisible()
  })
  it('should render layout correctly when twilio data with whatsapp info exists', async () => {
    services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeSmsTwilioProvider }
    })
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getNotificationSmsProvider.url,
        (req, res, ctx) => res(ctx.json(fakedTwilioWhatsappData.data))
      )
    )
    render(
      <Provider>
        <SmsProviderItem/>
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByText('WhatsApp Authentication Template SID')).toBeVisible()

    expect(screen.getByText('SMS Provider')).toBeVisible()
    expect(screen.getByText('Account SID')).toBeVisible()
    expect(screen.getByText('Auth Token')).toBeVisible()
    expect(screen.getByText('WhatsApp Authentication Template SID')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Change' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeVisible()
  })
  it('should show drawer when change button clicked', async () => {
    services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeSmsEsendexProvider }
    })
    render(
      <Provider>
        <SmsProviderItem/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('SMS Provider')).toBeVisible()
    expect(screen.getByText('API Token')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Change' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(await screen.findAllByText('SMS Provider')).toHaveLength(2)
  })
  it('should delete correctly when remove button clicked', async () => {
    services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeSmsOthersProvider }
    })
    render(
      <Provider>
        <SmsProviderItem/>
      </Provider>, {
        route: { params }
      })
    expect(screen.getByText('SMS Provider')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Change' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(await screen.findByRole('button', { name: 'Yes, Remove Provider' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Yes, Remove Provider' }))

    const value: [Function, Object] = expect.objectContaining({
      payload: { provider: SmsProviderType.SMSProvider_UNSET, threshold: 80 }
    })
    await waitFor(()=> {
      expect(mockMutation).toHaveBeenLastCalledWith(value)
    })
  })
})
