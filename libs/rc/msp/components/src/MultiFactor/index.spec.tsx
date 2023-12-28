/* eslint-disable max-len */
import  userEvent from '@testing-library/user-event'
import { rest }   from 'msw'

import { Provider, userApi, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'
import { UserUrlsInfo, MFAMethod } from '@acx-ui/user'
import { isDelegationMode }        from '@acx-ui/utils'

import {
  fakeMFADisabledTenantDetail,
  fakeMFADisabledAdminDetail,
  fakeMFAEnabledTenantDetail,
  fakeMFAEnabledAdminDetail
} from './__tests__/fixtures'

import { MultiFactor } from '.'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  isDelegationMode: jest.fn().mockReturnValue(false)
}))

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
const mockedDisableMFAMethodFn = jest.fn()
describe('Multi-Factor Authentication Form', () => {

  beforeEach(() => {
    store.dispatch(userApi.util.resetApiState())
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
      ),
      rest.put(
        UserUrlsInfo.disableMFAMethod.url,
        (_req, res, ctx) => {
          mockedDisableMFAMethodFn()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly render', async () => {
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
    const fakeMFAAdminDetail = {
      ...fakeMFAEnabledAdminDetail,
      mfaMethods: [MFAMethod.EMAIL, MFAMethod.MOBILEAPP]
    }

    mockServer.use(
      rest.get(
        UserUrlsInfo.getMfaAdminDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFAAdminDetail))
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

  it('should be empty if no recovery codes', async () => {
    const fakeMFATenantDetail = {
      ...fakeMFAEnabledTenantDetail,
      recoveryCodes: undefined
    }
    const fakeMFAAdminDetail = {
      ...fakeMFAEnabledAdminDetail,
      recoveryCodes: undefined
    }

    mockServer.use(
      rest.get(
        UserUrlsInfo.getMfaTenantDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFATenantDetail))
      ),
      rest.get(
        UserUrlsInfo.getMfaAdminDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFAAdminDetail))
      )
    )

    render(
      <Provider>
        <MultiFactor />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('heading', { name: 'Multi-Factor Authentication' })
    await screen.findByText('Backup authentication method')
    await userEvent.click(await screen.findByText('See'))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect((await screen.findByRole('textbox')).textContent).toEqual('')
  })

  it('should not be able to configure MFA authentication method', async () => {
    jest.mocked(isDelegationMode).mockReturnValue(true)

    render(
      <Provider>
        <MultiFactor />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('heading', { name: 'Multi-Factor Authentication' })
    expect(screen.queryByRole('heading', { name: 'Set authentication method' })).not.toBeInTheDocument()
  })

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
})
