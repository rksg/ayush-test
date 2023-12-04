import { rest } from 'msw'

import {
  getPolicyDetailsLink,
  PolicyType,
  PolicyOperation,
  ClientIsolationUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockedIsolationUsageByVenue } from './__tests__/fixtures'

import ClientIsolationAllowList from '.'

describe('ClientIsolationAllowList', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    venueId: '2e7a2dd226c8422ab62316b57f5a8631'
  }

  mockServer.use(
    rest.post(
      ClientIsolationUrls.getClientIsolationListUsageByVenue.url,
      (req, res, ctx) => res(ctx.json(mockedIsolationUsageByVenue))
    )
  )
  it('should render the table', async () => {
    const targetPolicy = mockedIsolationUsageByVenue.data[0]
    const policyDetailsPath = getPolicyDetailsLink({
      type: PolicyType.CLIENT_ISOLATION,
      oper: PolicyOperation.DETAIL,
      policyId: targetPolicy.id
    })
    const policyDetailsLink = `/${params.tenantId}/t/${policyDetailsPath}`

    render(
      <Provider>
        <ClientIsolationAllowList />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/venues/:venueId/venue-details/services'
        }
      }
    )

    const targetRow = await screen.findByRole('link', { name: targetPolicy.name })
    expect(targetRow).toHaveAttribute('href', policyDetailsLink)
  })
})
