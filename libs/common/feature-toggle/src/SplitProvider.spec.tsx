import { useTreatments } from '@splitsoftware/splitio-react'
import { rest }          from 'msw'

import { useGetAccountTierQuery }     from '@acx-ui/rc/services'
import { AdministrationUrlsInfo }     from '@acx-ui/rc/utils'
import { mockServer, render, screen } from '@acx-ui/test-utils'
import { renderHook }                 from '@acx-ui/test-utils'
import { UserUrlsInfo }               from '@acx-ui/user'
import { useGetBetaStatusQuery }      from '@acx-ui/user'

import { Features }                    from './features'
import { useIsSplitOn }                from './useIsSplitOn'
import { useIsTierAllowed, useFFList } from './useIsTierAllowed'



let split = require('@splitsoftware/splitio-react')

const services = require('@acx-ui/rc/services')
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services')
}))
const user = require('@acx-ui/user')
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user')
}))

const tenantAccountTierValue = {
  acx_account_tier: 'Gold'
}

jest.mock('@acx-ui/analytics/utils', () => (
  {
    ...jest.requireActual('@acx-ui/analytics/utils'),
    useUserProfileContext: jest.fn()
  }))

// Mock the useTreatments hook to return the expected values
jest.mock('@splitsoftware/splitio-react', () => (
  {
    ...jest.requireActual('@splitsoftware/splitio-react'),
    useTreatments: jest.fn()
  }))


const userProfile = {
  adminId: '246b49448c7e490895e925d5a200da4d',
  companyName: 'RUCKUS NETWORKS, INC',
  dateFormat: 'mm/dd/yyyy',
  detailLevel: 'debug',
  email: 'support.employee9@ruckuswireless.com',
  externalId: '0032h00000LV0XAAA1',
  firstName: 'support',
  lastName: 'employee9',
  role: 'PRIME_ADMIN',
  support: true,
  tenantId: 'bcaeb185cbd046528615473518e0382a',
  username: 'support.employee9@ruckuswireless.com',
  var: true,
  varTenantId: 'bcaeb185cbd046528615473518e0382a',
  allowedRegions: []
}

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

describe('useIsTierAllowed', () => {
  beforeEach( async () => {
    jest.doMock('@splitsoftware/splitio-react', () => ({
      useTreatments: jest.fn(() => ({
        [Features.PLM_FF]: {
          treatment: 'control',
          config: JSON.stringify({
            'feature-REC-Default': ['FEATURE_1', 'FEATURE_2'],
            'feature-MSP-Default': ['FEATURE_3', 'FEATURE_4'],
            'betaList': ['BETA_FEATURE_1', 'BETA_FEATURE_2']
          })
        }
      }))
    }))

    jest.doMock('@acx-ui/rc/services', () => ({
      useGetAccountTierQuery: jest.fn(() => ({
        data: {
          acx_account_tier: 'Gold'
        }
      }))
    }))

    jest.doMock('@acx-ui/user', () => ({
      useGetBetaStatusQuery: jest.fn(() => ({
        data: {
          enabled: true
        }
      }))
    }))
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    mockServer.use(
      rest.get(AdministrationUrlsInfo.getAccountTier.url as string,
        (req, res, ctx) => {
          return res(ctx.json({ data: {
            acx_account_tier: 'Gold'
          } }))
        }
      )
    )

    mockServer.use(
      rest.get(UserUrlsInfo.getBetaStatus.url as string,
        (req, res, ctx) => {
          return res(ctx.json({ data: {
            enabled: true
          } }))
        }
      )
    )

  })
  it.skip('should return tier Gold', async () => {
    services.useGetAccountTierQuery = jest.fn().mockImplementation(() => {
      return { data: tenantAccountTierValue }
    })

    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })

    const { result } = renderHook(() => useIsTierAllowed('ANLT-ADV'))
    expect(result.current).toBe(true)

  })

})
