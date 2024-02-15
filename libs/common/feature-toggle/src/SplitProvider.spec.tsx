import { rest } from 'msw'

import { mockServer, render, screen } from '@acx-ui/test-utils'
import { renderHook }                 from '@acx-ui/test-utils'
import { UserUrlsInfo }               from '@acx-ui/user'

import { Features }         from './features'
import { useIsSplitOn }     from './useIsSplitOn'
import { useIsTierAllowed } from './useIsTierAllowed'

let split = require('@splitsoftware/splitio-react')

const services = require('@acx-ui/rc/services')

const tenantAccountTierMock = {
  acx_account_tier: 'Gold'
}

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useGetBetaStatusQuery: () => ({ data: {
    enabled: 'true'
  } })
}))

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: () => ({
    accountId: 'mockedAccountId'
  })
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  isDelegationMode: jest.fn().mockReturnValue(false)
}))

const splitProxyEndpoint = 'https://splitproxy.dev.ruckus.cloud/api'
jest.mock('@splitsoftware/splitio-react', () => {
  const actualSplit = jest.requireActual('@splitsoftware/splitio-react')
  const { SplitSdk, SplitFactory, SplitTreatments } = actualSplit
  return {
    ...actualSplit,
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
    },
    SplitSdk: jest.fn((args) => SplitSdk(args)),
    SplitFactory: jest.fn((args) => <SplitFactory {...args} /> ),
    SplitTreatments: jest.fn((args) => <SplitTreatments {...args} />)
  }})

function TestSplitProvider (props: { tenant: string, IS_MLISA_SA: string,
  SPLIT_PROXY_ENDPOINT: string }) {
  jest.resetModules()
  jest.doMock('@acx-ui/config', () => ({
    get: jest.fn().mockImplementation(name => {
      switch(name) {
        case 'SPLIT_IO_KEY': return 'localhost'
        case 'SPLIT_PROXY_ENDPOINT': return props.SPLIT_PROXY_ENDPOINT
        default: return props.IS_MLISA_SA
      }
    })
  }))
  jest.doMock('@acx-ui/analytics/utils', () => ({
    getUserProfile: jest.fn().mockImplementation(() => ({ accountId: props.tenant }))
  }))
  jest.doMock('react-router-dom', () => ({
    useParams: () => ({ tenantId: props.tenant })
  }))
  split = require('@splitsoftware/splitio-react')
  const { SplitProvider } = require('./SplitProvider')
  return <div>{SplitProvider('child1')}</div>
}

const names = Object.keys(Features).map(k => Features[k as keyof typeof Features])
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
    expect(split.SplitSdk).toHaveBeenCalledWith({
      scheduler: { featuresRefreshRate: 30 },
      core: { authorizationKey: 'localhost', key: tenant },
      urls: {
        auth: 'https://splitproxy.dev.ruckus.cloud/api',
        events: 'https://splitproxy.dev.ruckus.cloud/api',
        sdk: 'https://splitproxy.dev.ruckus.cloud/api'
      },
      storage: { type: 'LOCALSTORAGE', prefix: 'ACX-local' },
      debug: false
    })
    expect(split.SplitTreatments).toHaveBeenCalledWith(expect.objectContaining({
      names
    }), {})
    expect(split.SplitFactory).toHaveBeenCalled()
  })
  it('provides for RA', async () => {
    render(<TestSplitProvider IS_MLISA_SA='true'
      tenant='0015000000GlI7SAAV'
      SPLIT_PROXY_ENDPOINT={''} />)
    expect(split.SplitSdk).toHaveBeenCalledWith({
      scheduler: { featuresRefreshRate: 30 },
      core: { authorizationKey: 'localhost', key: '0015000000GlI7SAAV' },
      storage: { type: 'LOCALSTORAGE', prefix: 'MLISA-local' },
      debug: false
    })
    expect(split.SplitFactory).toHaveBeenCalled()
    expect(split.SplitTreatments).toHaveBeenCalledWith(expect.objectContaining({
      names
    }), {})
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
    const { result } = renderHook(() => useIsSplitOn('testSplitName'))

    expect(result.current).toBe(true)
  })

  it('should return false when the treatment is "off"', () => {
    const { result } = renderHook(() => useIsSplitOn('anotherSplitName'))

    expect(result.current).toBe(false)
  })
})
