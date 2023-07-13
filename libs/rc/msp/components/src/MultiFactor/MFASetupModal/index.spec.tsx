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
import { UserUrlsInfo } from '@acx-ui/user'

import {
  fakeMFAEnabledTenantDetail,
  fakeMFAEnabledAdminDetail,
  fakeMFADisabledTenantDetail,
  fakeMFADisabledAdminDetail
} from '../__tests__/fixtures'

import { MFASetupModal } from '.'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

const mockOnFinishFn = jest.fn()
describe('MFA Setup Dialog', () => {
  it('should be able to login when MFA config is well setup', async () => {
    mockServer.use(
      rest.get(
        UserUrlsInfo.getMfaTenantDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFAEnabledTenantDetail))
      ),
      rest.get(
        UserUrlsInfo.getMfaAdminDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFAEnabledAdminDetail))
      )
    )

    render(
      <Provider>
        <MFASetupModal
          onFinish={mockOnFinishFn}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('dialog', { name: /Multi-Factors Authentication Setup/i })
    await screen.findByText('test@email.com')
    await screen.findByRole('switch', { name: 'otp' })
    expect(await screen.findByRole('switch', { name: 'otp' })).toBeChecked()
    expect(await screen.findByRole('button', { name: 'Log in' })).not.toBeDisabled()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it('should be able to login button when MFA is not enabled', async () => {
    mockServer.use(
      rest.get(
        UserUrlsInfo.getMfaTenantDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFADisabledTenantDetail))
      ),
      rest.get(
        UserUrlsInfo.getMfaAdminDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFADisabledAdminDetail))
      )
    )

    render(
      <Provider>
        <MFASetupModal
          onFinish={mockOnFinishFn}
        />
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByRole('button', { name: 'Log in' })).not.toBeDisabled()

  })

  it('should block login button when setup is not finished', async () => {
    const mockedMfaAdminFn = jest.fn()
    const fakeMFATenantDetail = {
      ...fakeMFAEnabledTenantDetail,
      mfaMethods: []
    }
    const fakeMFAAdminDetail = {
      ...fakeMFAEnabledAdminDetail,
      contactId: '',
      mfaMethods: []
    }

    mockServer.use(
      rest.get(
        UserUrlsInfo.getMfaTenantDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFATenantDetail))
      ),
      rest.get(
        UserUrlsInfo.getMfaAdminDetails.url,
        (_req, res, ctx) => {
          mockedMfaAdminFn()
          return res(ctx.json(fakeMFAAdminDetail))
        }
      )
    )

    render(
      <Provider>
        <MFASetupModal
          onFinish={mockOnFinishFn}
        />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedMfaAdminFn).toBeCalled()
    })

    expect(await screen.findByRole('button', { name: 'Log in' })).toBeDisabled()
  })

})
