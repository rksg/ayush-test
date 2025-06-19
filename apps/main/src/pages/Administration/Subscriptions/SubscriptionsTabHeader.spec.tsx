import { rest } from 'msw'

import { useIsSplitOn }                                           from '@acx-ui/feature-toggle'
import { administrationApi }                                      from '@acx-ui/rc/services'
import { AdministrationUrlsInfo }                                 from '@acx-ui/rc/utils'
import { Provider, store, userApi }                               from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved  } from '@acx-ui/test-utils'

import { mockedEtitlementsList, mockedSummary } from './__tests__/fixtures'
import { SubscriptionsTabHeader }               from './SubscriptionsTabHeader'

jest.spyOn(Date, 'now').mockImplementation(() => {
  return new Date('2023-01-11T12:33:37.101+00:00').getTime()
})
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  StackedBarChart: () => (<div data-testid='rc-StackedBarChart' />),
  showToast: jest.fn()
}))

const mockedTierReq = jest.fn()
describe('SubscriptionTabHeader', () => {
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
      )
    )
  })

  it('should render correctly', async () => {

    render(
      <Provider>
        <SubscriptionsTabHeader />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect((await screen.findAllByTestId('rc-StackedBarChart')).length).toBe(3)
    expect(await screen.findByText(/2\s+\/\s+130/i)).toBeVisible()
    expect(mockedTierReq).not.toBeCalled()
  })
})
