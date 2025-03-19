import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspRbacUrlsInfo }                             from '@acx-ui/msp/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen }                  from '@acx-ui/test-utils'
import { UserProfileContext, UserProfileContextProps } from '@acx-ui/user'

import SolutionTokenSettingsTabContent from './SolutionTokenSettingsTabContent'

const isPrimeAdmin: () => boolean = jest.fn().mockReturnValue(true)
const userProfileContextValues = {
  isPrimeAdmin
} as UserProfileContextProps

const list = [
  {
    featureType: 'SLTN_PIN_FOR_IDENTITY',
    featureName: 'PIN for RUCKUS One Identity',
    maxQuantity: 0,
    enabled: false,
    capped: false,
    licenseToken: 1,
    featureCostUnit: 'per Tunnel',
    featureUnit: 'Tunnels'
  },
  {
    featureType: 'SLTN_ADAPT_POLICY',
    featureName: 'Adaptive Policy',
    maxQuantity: 0,
    enabled: false,
    capped: false,
    licenseToken: 5,
    featureCostUnit: 'per Policy',
    featureUnit: 'Policies'
  }
]

describe('SolutionTokenLicenses', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        MspRbacUrlsInfo.getSolutionTokenSettings.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.patch(
        MspRbacUrlsInfo.updateSolutionTokenSettings.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'request-id' }))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render settings content', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <SolutionTokenSettingsTabContent isTabSelected={true} />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/administration/subscriptions/compliance' }
      })

    expect(await screen.findByText('PIN for RUCKUS One Identity')).toBeVisible()
    await userEvent.click(screen.getByRole('checkbox', { name: 'PIN for RUCKUS One Identity' }))
    expect(await screen.findByText('PIN for RUCKUS One Identity is Enabled')).toBeVisible()
  })
})
