import { ReactElement } from 'react'

import { renderHook } from '@testing-library/react'
import { rest }       from 'msw'

import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'
import { UserUrlsInfo }               from '@acx-ui/user'

import { useFFList, useIsTierAllowed } from './useIsTierAllowed'

let split = require('@splitsoftware/splitio-react')

jest.mock('@acx-ui/analytics/utils', () => (
  {
    ...jest.requireActual('@acx-ui/analytics/utils'),
    useUserProfileContext: jest.fn()
  }))

jest.mock('@acx-ui/utils', () => ({
  getJwtTokenPayload: jest.fn(() => ({
    tenantType: 'REC',
    acx_account_tier: 'Gold',
    acx_account_vertical: 'Default',
    tenantId: '123',
    isBetaFlag: true
  }))
}))

function TestSplitProvider (props: { tenant: string, IS_MLISA_SA: string }) {
  jest.resetModules()
  jest.doMock('@acx-ui/config', () => ({
    get: jest.fn().mockImplementation(name => name === 'SPLIT_IO_KEY'
      ? '0123456789'
      : props.IS_MLISA_SA
    )
  }))
  jest.doMock('@acx-ui/analytics/utils', () => ({
    useUserProfileContext: jest.fn().mockImplementation(() => ({
      data: { accountId: props.tenant }
    }))
  }))
  jest.doMock('react-router-dom', () => ({
    useParams: () => ({ tenantId: props.tenant })
  }))
  jest.doMock('@splitsoftware/splitio-react', () => ({
    SplitFactory: jest.fn().mockImplementation(() => 'rendered'),
    SplitSdk: jest.fn().mockImplementation(() => 'factory1')
  }))
  split = require('@splitsoftware/splitio-react')
  const { SplitProvider } = require('./SplitProvider')
  return <div>{SplitProvider({ children: 'child1' })}</div>
}

describe('SplitProvider', () => {
  it('renders nothing if no tenant provided', async () => {
    render(<TestSplitProvider IS_MLISA_SA='' tenant='' />)
    expect(screen.queryByText('rendered')).toBeNull()
  })
  it('provides for R1', async () => {
    const tenant = 'f91b36cbfb9941e8b45b337a37f330c0'
    render(<TestSplitProvider IS_MLISA_SA='' tenant={tenant} />)
    await screen.findByText('rendered')
    expect(split.SplitSdk).toHaveBeenCalledWith({
      scheduler: { featuresRefreshRate: 30 },
      core: { authorizationKey: '0123456789', key: tenant },
      storage: { type: 'LOCALSTORAGE', prefix: 'ACX01234' },
      debug: false
    })
    expect(split.SplitFactory).toHaveBeenCalledWith({ children: 'child1', factory: 'factory1' }, {})
  })
  it('provides for RA', async () => {
    render(<TestSplitProvider IS_MLISA_SA='true' tenant='0015000000GlI7SAAV' />)
    await screen.findByText('rendered')
    expect(split.SplitSdk).toHaveBeenCalledWith({
      scheduler: { featuresRefreshRate: 30 },
      core: { authorizationKey: '0123456789', key: '0015000000GlI7SAAV' },
      storage: { type: 'LOCALSTORAGE', prefix: 'MLISA01234' },
      debug: false
    })
    expect(split.SplitFactory).toHaveBeenCalledWith({ children: 'child1', factory: 'factory1' }, {})
  })
})

describe('useFFList', () => {
  beforeEach( async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    mockServer.use(
      rest.get(UserUrlsInfo.getBetaStatus.url as string,
        (req, res, ctx) => {
          return res(ctx.json({ data: {
            enabled: true
          } }))
        })
    )
    jest.mock('@acx-ui/user', () => ({
      useGetBetaStatusQuery: jest.fn(() => ({
        data: {
          enabled: true
        }
      }))
    }))

  })

  it.skip('returns correct feature and beta lists', () => {
    const { result } = renderHook(() => useFFList())
    expect(result.current.featureList).toEqual(['ADMN-ESNTLS', 'CNFG-ESNTLS'])
    expect(result.current.betaList).toEqual(['PLCY-EDGE', 'BETA-CP'])
  })
})

describe('useIsTierAllowed', () => {
  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    mockServer.use(
      rest.get(UserUrlsInfo.getBetaStatus.url as string,
        (req, res, ctx) => {
          return res(ctx.json({ data: {
            enabled: true
          } }))
        }
      )
    )

    jest.mock('@acx-ui/user', () => ({
      useGetBetaStatusQuery: jest.fn(() => ({
        data: {
          enabled: true
        }
      }))
    }))
  })

  it.skip('returns true for allowed feature', () => {
    jest.mock('./useIsTierAllowed', () => {
      const useIsTierAllowedMock = jest.fn(() => true)
      return {
        useIsTierAllowed: useIsTierAllowedMock,
        useFFList: jest.fn(() => ({
          featureList: ['ADMN-ESNTLS', 'CNFG-ESNTLS'],
          betaList: ['PLCY-EDGE', 'BETA-CP']
        }))
      }
    })

    const { result } = renderHook(() => useIsTierAllowed('ADMN-ESNTLS'), {
      wrapper: ({ children }: { children: ReactElement }) => <Provider>{children}</Provider>
    })

    expect(result.current).toBe(true)
  })

  it.skip('returns false for disallowed feature', () => {
    jest.mock('./useIsTierAllowed', () => ({
      useFFList: jest.fn(() => ({
        featureList: ['ADMN-ESNTLS', 'CNFG-ESNTLS'],
        betaList: ['PLCY-EDGE', 'BETA-CP']
      }))
    }))

    const { result } = renderHook(() => useIsTierAllowed('INVALID-FEATURE'))

    expect(result.current).toBe(false)
  })
})

