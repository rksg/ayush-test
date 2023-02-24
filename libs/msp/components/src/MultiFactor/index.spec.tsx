/* eslint-disable max-len */
import  userEvent from '@testing-library/user-event'
import { rest }   from 'msw'

import { UserUrlsInfo, MFAMethod } from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  fakeMFADisabledTenantDetail,
  fakeMFADisabledAdminDetail,
  fakeMFAEnabledTenantDetail,
  fakeMFAEnabledAdminDetail
} from './__tests__/fixtures'

import { MultiFactor } from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

describe('Multi-Factor Authentication Form', () => {

  it('should not have form item when MFA is disabled', async () => {
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
        <MultiFactor />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('heading', { name: 'Multi-Factor Authentication' })
    expect(screen.queryByRole('heading', { name: 'Set authentication method' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Backup authentication method' })).not.toBeInTheDocument()
  })

  it('should correctly render', async () => {
    mockServer.use(
      rest.get(
        UserUrlsInfo.getMfaTenantDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFAEnabledTenantDetail))
      ),
      rest.get(
        UserUrlsInfo.getMfaAdminDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFAEnabledAdminDetail))
      ),
      rest.post(
        UserUrlsInfo.mfaRegisterPhone.url,
        (_req, res, ctx) => res(ctx.json({}))
      )
    )

    render(
      <Provider>
        <MultiFactor />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('heading', { name: 'Multi-Factor Authentication' })
    await screen.findByRole('heading', { name: 'Set authentication method' })
    await screen.findByRole('heading', { name: 'Backup authentication method' })
    await screen.findByText('test@email.com')
    expect(await screen.findByRole('switch', { name: 'otp' })).toBeDisabled()
    await userEvent.click(await screen.findByRole('switch', { name: 'app' }))
    expect(await screen.findByRole('dialog')).toBeVisible()
  })

  it('should be able to disable MFA method', async () => {
    const mockedDisableMFAMethodFn = jest.fn()
    const fakeMFAAdminDetail = {
      ...fakeMFAEnabledAdminDetail,
      mfaMethods: [MFAMethod.EMAIL, MFAMethod.MOBILEAPP]
    }

    mockServer.use(
      rest.get(
        UserUrlsInfo.getMfaTenantDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFAEnabledTenantDetail))
      ),
      rest.get(
        UserUrlsInfo.getMfaAdminDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFAAdminDetail))
      ),
      rest.put(
        UserUrlsInfo.disableMFAMethod.url,
        (_req, res, ctx) => {
          mockedDisableMFAMethodFn()
          return res(ctx.status(202))
        }
      )
    )

    render(
      <Provider>
        <MultiFactor />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('heading', { name: 'Multi-Factor Authentication' })
    await screen.findByRole('heading', { name: 'Set authentication method' })
    await screen.findByRole('heading', { name: 'Backup authentication method' })
    await screen.findByText('test@email.com')
    await screen.findByRole('switch', { name: 'otp' })
    expect(await screen.findByRole('switch', { name: 'otp' })).toBeChecked()
    await screen.findByRole('switch', { name: 'app' })
    await screen.findByText('Add App')
    expect(await screen.findByRole('switch', { name: 'app' })).toBeChecked()
    expect(await screen.findByRole('switch', { name: 'otp' })).not.toBeDisabled()
    await userEvent.click(await screen.findByRole('switch', { name: 'app' }))
    expect(mockedDisableMFAMethodFn).toBeCalled()
  })
})