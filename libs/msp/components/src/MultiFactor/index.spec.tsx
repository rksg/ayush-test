/* eslint-disable max-len */
import { rest } from 'msw'

import { UserUrlsInfo, MFAStatus, MFAMethod } from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { MultiFactor } from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

export const fakeMFATenantDetail = {
  tenantStatus: MFAStatus.ENABLED,
  recoveryCodes: ['678490','287605','230202','791760','169187'],
  mfaMethods: [MFAMethod.EMAIL],
  userId: '9bd8c312-00e3-4ced-a63e-c4ead7bf36c7'
}


jest.mock('./', () => ({
  ...jest.requireActual('./'),
  __esModule: true,
  AuthenticationMethod: () => {
    return <div data-testid='mocked-AuthenticationMethod'></div>
  },
  BackupAuthenticationMethod: () => {
    return <div data-testid='mocked-BackupAuthenticationMethod'></div>
  }
}))

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
    await screen.findByRole('heading', { name: 'Set authentication method' })
    await screen.findByRole('heading', { name: 'Backup authentication method' })
  })
})