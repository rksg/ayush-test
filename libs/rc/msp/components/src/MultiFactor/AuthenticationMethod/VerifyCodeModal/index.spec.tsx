/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { UserUrlsInfo, MFAMethod } from '@acx-ui/user'

import { fakeMFADisabledTenantDetail } from '../../__tests__/fixtures'
import { OTPMethodProps }              from '../OneTimePassword'

import { VerifyCodeModal } from '.'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

const mockedCancelFn = jest.fn()
const mockedSuccessFn = jest.fn()
describe('MFA Verify Code Modal', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        UserUrlsInfo.setupMFAAccount.url,
        (_req, res, ctx) => res(ctx.status(200))
      ),
      rest.post(
        UserUrlsInfo.mfaResendOTP.url,
        (_req, res, ctx) => res(ctx.status(200))
      )
    )
  })

  it('should correctly render', async () => {
    const fakeOTPData:OTPMethodProps = {
      userId: fakeMFADisabledTenantDetail.userId,
      type: MFAMethod.EMAIL,
      data: '123@email.com'
    }

    render(
      <Provider>
        <VerifyCodeModal
          visible={true}
          onCancel={mockedCancelFn}
          onSuccess={mockedSuccessFn}
          data={fakeOTPData}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Verify your Email Address')
    await screen.findByLabelText('Enter the verification code that was sent to '+fakeOTPData.data)
    expect(await screen.findByRole('button', { name: 'Verify' })).toBeDisabled()
    await userEvent.type(await screen.findByRole('textbox'), '1{backspace}')
    await waitFor(async () => {
      await screen.findByText('Please enter verification code')
    })

    await userEvent.type(await screen.findByRole('textbox'), '12345678')
    await userEvent.click(await screen.findByRole('button', { name: 'Verify' }))
  })

  it('should display failed message under input area when verification failed', async () => {
    mockServer.use(
      rest.post(
        UserUrlsInfo.setupMFAAccount.url,
        (_req, res, ctx) => res(ctx.status(400))
      )
    )

    const fakeOTPData:OTPMethodProps = {
      userId: fakeMFADisabledTenantDetail.userId,
      type: MFAMethod.SMS,
      data: '+886912345678'
    }

    render(
      <Provider>
        <VerifyCodeModal
          visible={true}
          onCancel={mockedCancelFn}
          onSuccess={mockedSuccessFn}
          data={fakeOTPData}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Verify your Mobile Number')
    await screen.findByText('Enter the verification code that was sent to '+fakeOTPData.data)
    await userEvent.type(await screen.findByRole('textbox'), '12345678')
    await userEvent.click(await screen.findByRole('button', { name: 'Verify' }))
    await waitFor(async () => {
      await screen.findByText('Looks like you entered an incorrect code. Please try again.')
    })
  })

  it('should display failed message under input area when resend failed', async () => {
    mockServer.use(
      rest.post(
        UserUrlsInfo.mfaResendOTP.url,
        (_req, res, ctx) => res(ctx.status(400))
      )
    )

    const fakeOTPData:OTPMethodProps = {
      userId: fakeMFADisabledTenantDetail.userId,
      type: MFAMethod.SMS,
      data: '+886912345678'
    }

    render(
      <Provider>
        <VerifyCodeModal
          visible={true}
          onCancel={mockedCancelFn}
          onSuccess={mockedSuccessFn}
          data={fakeOTPData}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Verify your Mobile Number')
    await userEvent.type(await screen.findByRole('textbox'), '12345678')
    await userEvent.click(await screen.findByRole('button', { name: 'Resend' }))
    await waitFor(async () => {
      await screen.findByText('Resend verification error. Please try again.')
    })
  })
})
