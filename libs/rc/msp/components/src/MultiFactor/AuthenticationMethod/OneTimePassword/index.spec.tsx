/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  // waitFor,
  within
} from '@acx-ui/test-utils'
import { UserUrlsInfo } from '@acx-ui/user'

import { fakeMFADisabledTenantDetail } from '../../__tests__/fixtures'

import { OneTimePassword } from '.'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

const mockedOTPMethodResponse = {
  contactId: 'test@email.com',
  method: 'EMAIL'
}
const mockedCloseDrawer = jest.fn()
describe('One-Time Password Setup Drawer', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        UserUrlsInfo.mfaRegisterAdmin.url,
        (_req, res, ctx) => res(ctx.json(mockedOTPMethodResponse))
      )
    )
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <OneTimePassword
          visible={true}
          setVisible={mockedCloseDrawer}
          userId={fakeMFADisabledTenantDetail.userId}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('OTP Authentication')
    await screen.findByRole('radio', { name: 'Email' })

    await userEvent.type(await screen.findByRole('textbox'), 'test@email.com')
    await userEvent.click(await screen.findByRole('button', { name: 'Verify' }))
  })

  it('should correctly display mobile verification', async () => {
    render(
      <Provider>
        <OneTimePassword
          visible={true}
          setVisible={mockedCloseDrawer}
          userId={fakeMFADisabledTenantDetail.userId}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('OTP Authentication')
    await userEvent.click(await screen.findByRole('radio', { name: /Text Message/i }))
    await userEvent.type(await screen.findByRole('textbox'), '+886912345678')
    await userEvent.click(await screen.findByRole('button', { name: 'Verify' }))
  })

  it('should block submit when email is invalid', async () => {
    render(
      <Provider>
        <OneTimePassword
          visible={true}
          setVisible={mockedCloseDrawer}
          userId={fakeMFADisabledTenantDetail.userId}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('OTP Authentication')
    await screen.findByRole('radio', { name: 'Email' })

    await userEvent.type(await screen.findByRole('textbox'), 'test')
    await userEvent.click(await screen.findByRole('button', { name: 'Verify' }))
    await screen.findByText('Please enter a valid email address')
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
  })

  it('should block submit when mobile is invalid', async () => {
    render(
      <Provider>
        <OneTimePassword
          visible={true}
          setVisible={mockedCloseDrawer}
          userId={fakeMFADisabledTenantDetail.userId}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('OTP Authentication')
    await userEvent.click(await screen.findByRole('radio', { name: /Text Message/i }))
    await userEvent.type(await screen.findByRole('textbox'), '123')
    await userEvent.click(await screen.findByRole('button', { name: 'Verify' }))
    await screen.findByText('Please enter a valid phone number')
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
  })

  it('should display toast when verify failed', async () => {
    mockServer.use(
      rest.post(
        UserUrlsInfo.mfaRegisterAdmin.url,
        (_req, res, ctx) => res(ctx.status(400))
      )
    )

    render(
      <Provider>
        <OneTimePassword
          visible={true}
          setVisible={mockedCloseDrawer}
          userId={fakeMFADisabledTenantDetail.userId}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('OTP Authentication')
    await userEvent.click(await screen.findByRole('radio', { name: /Text Message/i }))
    await userEvent.type(await screen.findByRole('textbox'), '+886912345678')
    await userEvent.click(await screen.findByRole('button', { name: 'Verify' }))
    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })

  it('should correctly render when user abort verification', async () => {
    render(
      <Provider>
        <OneTimePassword
          visible={true}
          setVisible={mockedCloseDrawer}
          userId={fakeMFADisabledTenantDetail.userId}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('OTP Authentication')
    await userEvent.click(await screen.findByRole('radio', { name: /Text Message/i }))
    await userEvent.type(await screen.findByRole('textbox'), '+886912345678')
    await userEvent.click(await screen.findByRole('button', { name: 'Verify' }))
    expect(await screen.findByText('Verify your Mobile Number')).toBeVisible()
    const verifyCodeDialog = await screen.findByRole('dialog', { name: /Verify your Mobile Number/i })
    await userEvent.click(await within(verifyCodeDialog).findByRole('button', { name: 'Cancel' }))
  })
})
