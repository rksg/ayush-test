import { rest }                        from 'msw'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'


import { mockServer, render, screen } from '@acx-ui/test-utils'
import { renderHook }                 from '@acx-ui/test-utils'
import { UserUrlsInfo }               from '@acx-ui/user'

import { useIsSplitOn }     from './useIsSplitOn'
import { useIsTierAllowed } from './useIsTierAllowed'

let split = require('@splitsoftware/splitio-react')

const services = require('@acx-ui/user')

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user')
}))

const tenantAccountTierMock = {
  acx_account_tier: 'Gold'
}

jest.mock('@splitsoftware/splitio-react', () => (
  {
    ...jest.requireActual('@splitsoftware/splitio-react'),
    useTreatments: jest.fn()
  }))

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useGetBetaStatusQuery: () => ({ data: {
    enabled: 'true'
  } })
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  isDelegationMode: jest.fn().mockReturnValue(false)
}))

jest.mock('@splitsoftware/splitio-react', () => ({
  useTreatments: jest.fn()
}))

const splitProxyEndpoint = 'https://splitproxy.dev.ruckus.cloud/api'
jest.mock('@splitsoftware/splitio-react', () => ({
  useTreatments: (splitNames: string[], attributes: { params: '1234test' }) => {
    const treatments: Record<string, Object> = {}
    if (attributes) {
      splitNames.forEach((splitName) => {
        if (splitName === 'testSplitName') {
          treatments[splitName] = { treatment: 'on', config: JSON.stringify({
            featureList: ['ADMN-ESNTLS', 'CNFG-ESNTLS'],
            betaList: ['PLCY-EDGE', 'BETA-CP']
          }) }
        } else {
          treatments[splitName] = { treatment: 'off', config: '' }
        }
      })
      return treatments
    } else return { treatment: 'control', config: '' }
  }
}))

function TestSplitProvider (props: { tenant: string, IS_MLISA_SA: string,
  SPLIT_PROXY_ENDPOINT: string, text?: string }) {
  jest.resetModules()
  jest.doMock('@acx-ui/config', () => ({
    get: jest.fn().mockImplementation(name => {
      switch(name) {
        case 'SPLIT_IO_KEY': return '0123456789'
        case 'SPLIT_PROXY_ENDPOINT': return props.SPLIT_PROXY_ENDPOINT
        default: return props.IS_MLISA_SA
      }
    })
  }))
  jest.doMock('@acx-ui/utils', () => ({
    useTenantId: () => props.tenant
  }))
  jest.doMock('@splitsoftware/splitio-react', () => ({
    SplitFactory: jest.fn().mockImplementation(() => props.text || 'rendered'),
    SplitSdk: jest.fn().mockImplementation(() => 'factory1')
  }))
  split = require('@splitsoftware/splitio-react')
  const { SplitProvider } = require('./SplitProvider')
  return <MemoryRouter><div>{SplitProvider({ children: 'child1' })}</div></MemoryRouter>
}

describe('SplitProvider', () => {
  it('renders nothing if no tenant provided', async () => {
    render(<TestSplitProvider IS_MLISA_SA=''
      tenant=''
      SPLIT_PROXY_ENDPOINT={splitProxyEndpoint} />)
    expect(screen.queryByText('rendered')).toBeNull()
  })
  it('provides for R1', async () => {
    const tenant = 'f91b36cbfb9941e8b45b337a37f330c0'
    render(<TestSplitProvider IS_MLISA_SA=''
      tenant={tenant}
      SPLIT_PROXY_ENDPOINT={splitProxyEndpoint} />)
    await screen.findByText('rendered')
    expect(split.SplitSdk).toHaveBeenCalledWith({
      scheduler: { featuresRefreshRate: 30 },
      core: { authorizationKey: '0123456789', key: tenant },
      urls: {
        auth: 'https://splitproxy.dev.ruckus.cloud/api',
        events: 'https://splitproxy.dev.ruckus.cloud/api',
        sdk: 'https://splitproxy.dev.ruckus.cloud/api'
      },
      storage: { type: 'LOCALSTORAGE', prefix: 'ACX-01234-f91b36cbfb9941e8b45b337a37f330c0' },
      debug: false
    })
    expect(split.SplitFactory).toHaveBeenCalledWith({ children: 'child1', factory: 'factory1' }, {})
  })
  it('provides for RA', async () => {
    render(<TestSplitProvider IS_MLISA_SA='true'
      tenant='0015000000GlI7SAAV'
      SPLIT_PROXY_ENDPOINT={''} />)
    await screen.findByText('rendered')
    expect(split.SplitSdk).toHaveBeenCalledWith({
      scheduler: { featuresRefreshRate: 30 },
      core: { authorizationKey: '0123456789', key: '0015000000GlI7SAAV' },
      storage: { type: 'LOCALSTORAGE', prefix: 'MLISA-01234-0015000000GlI7SAAV' },
      debug: false
    })
    expect(split.SplitFactory).toHaveBeenCalledWith({ children: 'child1', factory: 'factory1' }, {})
  })
  it('handles tenant switch for RA', async () => {
    const { rerender } = render(<TestSplitProvider IS_MLISA_SA='true'
      tenant='0015000000GlI7SAAV'
      SPLIT_PROXY_ENDPOINT={''}
    />)
    await screen.findByText('rendered')
    expect(split.SplitSdk).toHaveBeenCalledWith({
      scheduler: { featuresRefreshRate: 30 },
      core: { authorizationKey: '0123456789', key: '0015000000GlI7SAAV' },
      storage: { type: 'LOCALSTORAGE', prefix: 'MLISA-01234-0015000000GlI7SAAV' },
      debug: false
    })
    expect(split.SplitFactory).toHaveBeenCalledWith({ children: 'child1', factory: 'factory1' }, {})
    rerender(<TestSplitProvider IS_MLISA_SA='true'
      tenant='1015000000GlI7SAAV'
      SPLIT_PROXY_ENDPOINT={''}
      text='rerendered'
    />)
    await screen.findByText('rerendered')
    expect(split.SplitSdk).toHaveBeenCalledWith({
      scheduler: { featuresRefreshRate: 30 },
      core: { authorizationKey: '0123456789', key: '1015000000GlI7SAAV' },
      storage: { type: 'LOCALSTORAGE', prefix: 'MLISA-01234-1015000000GlI7SAAV' },
      debug: false
    })
  })
})

describe('useIsTierAllowed', () => {
  beforeEach( async () => {
    mockServer.use(
      rest.get(UserUrlsInfo.getAccountTier.url as string,
        (req, res, ctx) => {
          return res(ctx.json({ acx_account_tier: 'Gold' }))
        }
      ),
      rest.get(UserUrlsInfo.getBetaStatus.url as string,
        (req, res, ctx) => {
          return res(ctx.json({ data: { enabled: 'true' } }))
        }
      )
    )
  })

  it('returns false for disallowed feature', () => {
    jest.mock('./useIsTierAllowed', () => ({
      useFFList: jest.fn(() => ({
        featureList: ['ADMN-ESNTLS', 'CNFG-ESNTLS'],
        betaList: ['PLCY-EDGE', 'BETA-CP']
      }))
    }))

    services.useGetAccountTierQuery = jest.fn().mockImplementation(() => {
      return { data: tenantAccountTierMock }
    })
    const { result } = renderHook(() => useIsTierAllowed('INVALID-FEATURE'))

    expect(result.current).toBe(false)
  })
})

describe('useIsSplitOn', () => {
  it('should return true when the treatment is "on"', () => {
    const { result } = renderHook(() => useIsSplitOn('testSplitName'),
      { wrapper: BrowserRouter })

    expect(result.current).toBe(true)
  })

  it('should return false when the treatment is "off"', () => {
    const { result } = renderHook(() => useIsSplitOn('anotherSplitName'),
      { wrapper: BrowserRouter })

    expect(result.current).toBe(false)
  })
})
