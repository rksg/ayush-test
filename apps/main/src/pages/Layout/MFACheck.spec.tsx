import { useState } from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { act }   from 'react-dom/test-utils'

import { Provider }                                        from '@acx-ui/store'
import { render, renderHook, screen, mockServer, waitFor } from '@acx-ui/test-utils'
import { UserUrlsInfo, MFAStatus, MfaDetailStatus }        from '@acx-ui/user'

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
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: () => ({ tenantId: 'tenantId' }),
  isDelegationMode: jest.fn().mockReturnValue(false)
}))


const params = { tenantId: 'tenantId' }

describe('MFA is not enabled', () => {
  it('should not popup setup modal', async () => {
    const mockedGetMfaTenantDetDetails = jest.fn()
    mockServer.use(
      rest.get(
        UserUrlsInfo.getMfaTenantDetails.url,
        (_req, res, ctx) => {
          mockedGetMfaTenantDetDetails()
          return res(ctx.json({
            tenantStatus: MFAStatus.DISABLED,
            userId: 'userId',
            enabled: false
          }))
        }
      )
    )

    renderHook(() => {
      const[mfaDetails, setMfaDetails] = useState({} as MfaDetailStatus)
      return { mfaDetails, setMfaDetails }
    })

    render(<Provider>
      <MFACheck />
    </Provider>, {
      route: {
        path: '/t/:tenantId/dashboard',
        params
      }
    })

    await waitFor(() => {
      expect(mockedGetMfaTenantDetDetails).toBeCalled()
    })

    expect(screen.queryByTestId('mfaSetup')).not.toBeInTheDocument()
  })
})

describe('MFA First-time Setup Check', () => {
  const mockedGetMfaAdminDetails = jest.fn()

  it('should popup setup modal', async () => {
    const mockedMFATenantDetail = {
      tenantStatus: MFAStatus.ENABLED,
      mfaMethods: [],
      userId: 'userId',
      enabled: true
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

    const { result } = renderHook(() => {
      const[mfaDetails, setMfaDetails] = useState({})
      const[mfaSetupFinish, setMfaSetupFinish] = useState(false)
      return { mfaDetails, setMfaDetails, mfaSetupFinish, setMfaSetupFinish }
    })

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

    act(() => {
      result.current.setMfaDetails(mockedMFATenantDetail)
    })

    await waitFor(async () => {
      expect(await screen.findByTestId('mfaSetup')).toBeInTheDocument()
    })

    await userEvent.click(await screen.findByRole('button'))
    act(() => {
      result.current.setMfaSetupFinish(true)
    })
    expect(screen.queryByTestId('mfaSetup')).toBeNull()
  })
})

