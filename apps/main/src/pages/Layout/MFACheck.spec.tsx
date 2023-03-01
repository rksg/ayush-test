import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { UserUrlsInfo, MFAStatus }             from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { render, screen, mockServer, waitFor } from '@acx-ui/test-utils'

import { MFACheck } from './MFACheck'

jest.mock('@acx-ui/msp/components', () => ({
  ...jest.requireActual('@acx-ui/msp/components'),
  MFASetupModal: (props: {
    onFinish: () => void
  }) => {
    return <div data-testid='mfaSetup'>
      <button onClick={props.onFinish}>Login</button>
    </div>
  }
}), { virtual: true })

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: () => ({ tenantId: 'tenantId' })
}))

const params = { tenantId: 'tenantId' }
describe('MFA First-time Setup Check', () => {
  const mockedGetMfaAdminDetails = jest.fn()

  beforeEach(() => {
    const mockedMFATenantDetail = {
      tenantStatus: MFAStatus.ENABLED,
      mfaMethods: [],
      userId: 'userId'
    }

    mockServer.use(
      rest.get(
        UserUrlsInfo.getMfaTenantDetails.url,
        (_req, res, ctx) => res(ctx.json(mockedMFATenantDetail))
      ),
      rest.get(
        UserUrlsInfo.getMfaAdminDetails.url,
        (_req, res, ctx) => {
          mockedGetMfaAdminDetails()
          return res(ctx.json(mockedMFATenantDetail))
        }
      )
    )
  })

  test('should popup setup modal', async () => {
    render(<Provider>
      <MFACheck />
    </Provider>, {
      route: {
        path: '/t/:tenantId/dashboard',
        params
      }
    })

    await waitFor(() => {
      expect(mockedGetMfaAdminDetails).toBeCalled()
    })

    await screen.findByTestId('mfaSetup')
  })

  test('should close setup modal after settings finished', async () => {
    render(<Provider>
      <MFACheck />
    </Provider>, {
      route: {
        path: '/t/:tenantId/dashboard',
        params
      }
    })

    await waitFor(() => {
      expect(mockedGetMfaAdminDetails).toBeCalled()
    })

    await screen.findByTestId('mfaSetup')

    await userEvent.click(await screen.findByRole('button'))
  })
})