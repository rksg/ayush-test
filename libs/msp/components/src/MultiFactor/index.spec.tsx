/* eslint-disable max-len */
import  userEvent from '@testing-library/user-event'
import { rest }   from 'msw'

import { UserUrlsInfo, MFAStatus, MFAMethod } from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { MultiFactor } from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

export const fakeMFATenantDetail = {
  tenantStatus: MFAStatus.ENABLED,
  recoveryCodes: ['678490','287605','230202','791760','169187'],
  mfaMethods: [MFAMethod.EMAIL],
  userId: '9bd8c312-00e3-4ced-a63e-c4ead7bf36c7'
}


describe('Multi-Factor Authentication Form', () => {

  it('should not have form item when MFA is disabled', async () => {
    const fakeMFATenantDetail = {
      tenantStatus: MFAStatus.DISABLED,
      mfaMethods: [],
      userId: '9bd8c312-00e3-4ced-a63e-c4ead7bf36c7'
    }

    mockServer.use(
      rest.get(
        UserUrlsInfo.getMfaTenantDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFATenantDetail))
      ),
      rest.get(
        UserUrlsInfo.getMfaAdminDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFATenantDetail))
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
    const fakeMFATenantDetail = {
      tenantStatus: MFAStatus.ENABLED,
      recoveryCodes: ['678490','287605','230202','791760','169187'],
      mfaMethods: [],
      userId: '9bd8c312-00e3-4ced-a63e-c4ead7bf36c7'
    }
    const fakeMFAAdminDetail = {
      contactId: 'test@email.com',
      tenantStatus: MFAStatus.ENABLED,
      recoveryCodes: ['678490','287605','230202','791760','169187'],
      mfaMethods: [MFAMethod.EMAIL],
      userId: '9bd8c312-00e3-4ced-a63e-c4ead7bf36c7'
    }

    mockServer.use(
      rest.get(
        UserUrlsInfo.getMfaTenantDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFATenantDetail))
      ),
      rest.get(
        UserUrlsInfo.getMfaAdminDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFAAdminDetail))
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
    const fakeMFATenantDetail = {
      tenantStatus: MFAStatus.ENABLED,
      recoveryCodes: ['678490','287605','230202','791760','169187'],
      mfaMethods: [],
      userId: '9bd8c312-00e3-4ced-a63e-c4ead7bf36c7'
    }
    const fakeMFAAdminDetail = {
      contactId: 'test@email.com',
      tenantStatus: MFAStatus.ENABLED,
      recoveryCodes: ['678490','287605','230202','791760','169187'],
      mfaMethods: [MFAMethod.EMAIL, MFAMethod.MOBILEAPP],
      userId: '9bd8c312-00e3-4ced-a63e-c4ead7bf36c7'
    }

    mockServer.use(
      rest.get(
        UserUrlsInfo.getMfaTenantDetails.url,
        (_req, res, ctx) => res(ctx.json(fakeMFATenantDetail))
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
    await waitFor(async () => {
      expect(await screen.findByRole('switch', { name: 'app' })).toBeChecked()
    })
    expect(await screen.findByRole('switch', { name: 'otp' })).toBeChecked()
    expect(await screen.findByRole('switch', { name: 'otp' })).not.toBeDisabled()
    await userEvent.click(await screen.findByRole('switch', { name: 'app' }))
    expect(mockedDisableMFAMethodFn).toBeCalled()
  })
})