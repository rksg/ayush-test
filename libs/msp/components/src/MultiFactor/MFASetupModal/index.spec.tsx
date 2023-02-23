/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { UserUrlsInfo, MFAStatus, MFAMethod } from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { MFASetupModal } from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

const mockOnFinishFn = jest.fn()
describe('MFA Setup Dialog', () => {
  it('should be able to login button when MFA is not enabled', async () => {
    const fakeMFATenantDetail = {
      tenantStatus: MFAStatus.DISABLED,
      recoveryCodes: ['678490','287605','230202','791760','169187'],
      mfaMethods: [],
      userId: '9bd8c312-00e3-4ced-a63e-c4ead7bf36c7'
    }
    const fakeMFAAdminDetail = {
      tenantStatus: MFAStatus.DISABLED,
      recoveryCodes: ['678490','287605','230202','791760','169187'],
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
        (_req, res, ctx) => res(ctx.json(fakeMFAAdminDetail))
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
      tenantStatus: MFAStatus.ENABLED,
      recoveryCodes: ['678490','287605','230202','791760','169187'],
      mfaMethods: [],
      userId: '9bd8c312-00e3-4ced-a63e-c4ead7bf36c7'
    }
    const fakeMFAAdminDetail = {
      contactId: '',
      tenantStatus: MFAStatus.ENABLED,
      recoveryCodes: ['678490','287605','230202','791760','169187'],
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

  it('should be able to login when MFA config is well setup', async () => {
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

    expect(await screen.findByRole('button', { name: 'Log in' })).not.toBeDisabled()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })
})