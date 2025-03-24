import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                    from '@acx-ui/feature-toggle'
import { administrationApi }                                               from '@acx-ui/rc/services'
import { AdministrationUrlsInfo, LicenseUrlsInfo }                         from '@acx-ui/rc/utils'
import { Provider, store, userApi }                                        from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved  } from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                    from '@acx-ui/user'
import { AccountType }                                                     from '@acx-ui/utils'

import { fakeMspEcProfile, mockedEtitlementsList, mockedSummary } from './__tests__/fixtures'
import { SubscriptionTabs }                                       from './SubscriptionsTab'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useTenantId: () => 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  isDelegationMode: jest.fn().mockReturnValue(true)
}))

const services = require('@acx-ui/msp/services')

const mockedTierReq = jest.fn()
describe('SubscriptionsTab', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    store.dispatch(administrationApi.util.resetApiState())
    store.dispatch(userApi.util.resetApiState())

    mockedTierReq.mockClear()

    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }

    services.useGetMspEcProfileQuery = jest.fn().mockImplementation(() => {
      return { data: fakeMspEcProfile }
    })
    services.useGetMspProfileQuery = jest.fn().mockImplementation(() => {
      return { data: fakeMspEcProfile }
    })

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getEntitlementSummary.oldUrl as string,
        (_req, res, ctx) => {
          return res(ctx.json(mockedSummary))
        }
      ),
      rest.post(
        LicenseUrlsInfo.getEntitlementSummary.url as string,
        (_req, res, ctx) => {
          return res(ctx.json(mockedSummary))
        }
      ),
      rest.get(
        AdministrationUrlsInfo.getEntitlementSummary.url,
        (req, res, ctx) => {
          if (req.url.searchParams.get('refresh') === 'true')
            return res(ctx.status(202))
          else
            return res(ctx.json({
              banners: [],
              entitlements: mockedEtitlementsList,
              summary: mockedSummary
            }))
        }
      ),
      rest.get(
        AdministrationUrlsInfo.getEntitlementsList.url,
        (_req, res, ctx) => {
          return res(ctx.json(mockedEtitlementsList))
        }
      ),
      rest.post(
        LicenseUrlsInfo.getEntitlementsList.url,
        (_req, res, ctx) => {
          return res(ctx.json(mockedEtitlementsList))
        }
      ),
      rest.get(UserUrlsInfo.getAccountTier.url as string,
        (_req, res, ctx) => {
          mockedTierReq()
          return res(ctx.json({ acx_account_tier: 'Platinum' }))
        }
      ),
      rest.post(
        AdministrationUrlsInfo.getEntitlementsActivations.url,
        (req, res, ctx) => res(ctx.json([]))
      )
    )
  })

  it('should render correctly for platinum/professional tier', async () => {

    render(
      <Provider>
        <SubscriptionTabs tenantType={AccountType.REC} />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.getByText('Current Subscription Tier:')).toBeVisible()
    expect(screen.getByText('Professional')).toBeVisible()
    expect(screen.getByText('My Subscriptions')).toBeVisible()
    expect(screen.getByText('Pending Activations')).toBeVisible()
  })

  it('should render correctly for gold/essentials tier', async () => {
    mockServer.use(
      rest.get(UserUrlsInfo.getAccountTier.url as string,
        (_req, res, ctx) => {
          mockedTierReq()
          return res(ctx.json({ acx_account_tier: 'Gold' }))
        }
      )
    )
    render(
      <Provider>
        <SubscriptionTabs tenantType={AccountType.REC} />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.getByText('Current Subscription Tier:')).toBeVisible()
    await waitFor(() => {
      expect(screen.getByText('Essentials')).toBeVisible()
    })
    expect(screen.getByText('My Subscriptions')).toBeVisible()
    expect(screen.getByText('Pending Activations')).toBeVisible()
  })
  it('should navigate correctly on tab click', async () => {
    render(
      <Provider>
        <SubscriptionTabs tenantType={AccountType.REC} />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.getByText('Current Subscription Tier:')).toBeVisible()
    expect(screen.getByText('Professional')).toBeVisible()
    expect(screen.getByText('My Subscriptions')).toBeVisible()
    await userEvent.click(screen.getByText('Pending Activations'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/administration/subscriptions/pendingActivations`,
      hash: '',
      search: ''
    })
  })
  it('should navigate correctly on tab click for MSP REC', async () => {
    render(
      <Provider>
        <SubscriptionTabs tenantType={AccountType.MSP_REC} />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.getByText('Current Subscription Tier:')).toBeVisible()
    expect(screen.getByText('Professional')).toBeVisible()
    expect(screen.getByText('My Subscriptions')).toBeVisible()
    await userEvent.click(screen.getByText('Pending Activations'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/administration/subscriptions/pendingActivations`,
      hash: '',
      search: ''
    })
  })
})
