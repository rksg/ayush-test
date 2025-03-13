import { rest } from 'msw'

import { Features, useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { MspUrlsInfo }                                                     from '@acx-ui/msp/utils'
import { administrationApi }                                               from '@acx-ui/rc/services'
import { AdministrationUrlsInfo }                                          from '@acx-ui/rc/utils'
import { Provider, store, userApi }                                        from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved  } from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                    from '@acx-ui/user'
import { isDelegationMode }                                                from '@acx-ui/utils'

import { fakeMspEcProfile, mockedEtitlementsList, mockedSummary } from './__tests__/fixtures'
import { SubscriptionHeader }                                     from './SubscriptionHeader'

jest.spyOn(Date, 'now').mockImplementation(() => {
  return new Date('2023-01-11T12:33:37.101+00:00').getTime()
})
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  StackedBarChart: () => (<div data-testid='rc-StackedBarChart' />),
  showToast: jest.fn()
}))
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  isDelegationMode: jest.fn().mockReturnValue(false),
  getJwtTokenPayload: jest.fn().mockReturnValue({
    acx_account_tier: 'Platinum'
  })
}))

const mockedTierReq = jest.fn()
describe('SubscriptionHeader', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockedTierReq.mockClear()

    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }

    store.dispatch(administrationApi.util.resetApiState())
    store.dispatch(userApi.util.resetApiState())

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getEntitlementSummary.oldUrl as string,
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
      rest.get(UserUrlsInfo.getAccountTier.url as string,
        (_req, res, ctx) => {
          mockedTierReq()
          return res(ctx.json({ acx_account_tier: 'Gold' }))
        }
      ),
      rest.get(
        MspUrlsInfo.getMspEcProfile.url,
        (req, res, ctx) => res(ctx.json(fakeMspEcProfile))
      )
    )
  })

  it('should render correctly', async () => {

    render(
      <Provider>
        <SubscriptionHeader />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect((await screen.findAllByTestId('rc-StackedBarChart')).length).toBe(3)
    expect(await screen.findByText(/2\s+\/\s+130/i)).toBeVisible()
    expect(await screen.findByText('Professional')).toBeVisible()
    expect(mockedTierReq).not.toBeCalled()
  })

  it('should call account tier API when delegation mode', async () => {
    jest.mocked(isDelegationMode).mockReturnValue(true)

    render(
      <Provider>
        <SubscriptionHeader />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await waitFor(() => expect(mockedTierReq).toBeCalled())
    expect((await screen.findAllByTestId('rc-StackedBarChart')).length).toBe(3)
    expect(await screen.findByText('Essentials')).toBeVisible()
  })

  it('should filter edge data when edge FF is not denabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.EDGES_TOGGLE)

    render(
      <Provider>
        <SubscriptionHeader />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect((await screen.findAllByTestId('rc-StackedBarChart')).length).toBe(2)
    expect(screen.queryAllByText('SmartEdge').length).toBe(0)
    expect(await screen.findByText('Essentials')).toBeVisible()
  })
})
