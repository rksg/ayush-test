import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AdministrationUrlsInfo, SmsProviderType } from '@acx-ui/rc/utils'
import { Provider }                                from '@acx-ui/store'
import {
  render,
  screen,
  waitFor,
  mockServer
} from '@acx-ui/test-utils'

import { SmsProviderItem } from '.'

// const TwilioData = [
//   {
//     providerType: SmsProviderType.TWILIO,
//     providerData: {
//       accountSid: 'AC1234567890abcdef1234567890abcdef',
//       authToken: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6',
//       fromNumber: '+19388887785'
//     }
//   }
// ]

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

const FakedTwilioData = {
  data: {
    accountSid: 'AC1234567890abcdef1234567890abcdef',
    authToken: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6',
    fromNumber: '+19388887785',
    apiKey: '29b04e7f-3bfb-4fed-b333-a49327981cab',
    url: 'test.com'
  }
}


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const services = require('@acx-ui/rc/services')

describe('SMS Provider Form Item', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useGetAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: [] }
    })
    jest.spyOn(services, 'useDeleteNotificationSmsProviderMutation')
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getNotificationSms.url,
        (req, res, ctx) => res(ctx.json({ fakeSmsNoProvider }))
      ),
      rest.get(
        AdministrationUrlsInfo.getNotificationSmsProvider.url,
        (req, res, ctx) => res(ctx.json({ FakedTwilioData }))
      ),
      rest.post(
        AdministrationUrlsInfo.updateNotificationSmsProvider.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.delete(
        AdministrationUrlsInfo.DeleteNotificationSmsProvider.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render layout correctly when no data exists', async () => {
    render(
      <Provider>
        <SmsProviderItem/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('SMS Provider')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Set SMS Provider' })).toBeVisible()
  })
  it('should show drawer when Set SMS Provider button is clicked', async () => {
    render(
      <Provider>
        <SmsProviderItem/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('SMS Provider')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Set SMS Provider' }))
    expect(screen.getByText('Set SMS Provider')).toBeVisible()
  })
  it('should render layout correctly when twilio data exists', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getNotificationSms.url,
        (req, res, ctx) => res(ctx.json({ fakeSmsTwilioProvider }))
      )
    )
    render(
      <Provider>
        <SmsProviderItem/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('SMS Provider')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Change' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeVisible()
  })
  it('should show drawer when change button is clicked', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getNotificationSms.url,
        (req, res, ctx) => res(ctx.json({ fakeSmsTwilioProvider }))
      )
    )
    render(
      <Provider>
        <SmsProviderItem/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('SMS Provider')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(screen.getByText('Set SMS Provider')).toBeVisible()
  })
  it('should remove SMS provider correctly', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getNotificationSms.url,
        (req, res, ctx) => res(ctx.json({ fakeSmsTwilioProvider }))
      )
    )
    render(
      <Provider>
        <SmsProviderItem/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('SMS Provider')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(await screen.findByText('Remove SMS Provider')).toBeVisible()
    const button = screen.getByRole('button', { name: 'Yes, Remove Provider' })
    await waitFor(() => {
      expect(button).toBeEnabled()
    })
    await userEvent.click(button)
    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]
    await waitFor(()=> {
      expect(services.useDeleteNotificationSmsProviderMutation).toHaveLastReturnedWith(value)
    })
    await waitFor(() => {
      expect(screen.queryByText('Delete Azure AD SSO Service')).toBeNull()
    })

  })
})
