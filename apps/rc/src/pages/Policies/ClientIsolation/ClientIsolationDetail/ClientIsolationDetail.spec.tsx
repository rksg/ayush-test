import { rest } from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  ClientIsolationUrls,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType

} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockedClientIsolation, mockedVenueUsage } from './__tests__/fixtures'
import ClientIsolationDetail                       from './ClientIsolationDetail'

describe('ClientIsolationDetail', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    policyId: '4b76b1952c80401b8500b00d68106576'
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.DETAIL })

  beforeEach(() => {
    mockServer.use(
      rest.get(
        ClientIsolationUrls.getClientIsolation.url,
        (req, res, ctx) => {
          return res(ctx.json({ ...mockedClientIsolation }))
        }
      ),
      rest.post(
        ClientIsolationUrls.getVenueUsageByClientIsolation.url,
        (req, res, ctx) => res(ctx.json({ ...mockedVenueUsage }))
      )
    )
  })

  it('should render the detail view', async () => {
    render(
      <Provider>
        <ClientIsolationDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    // Verify the settings
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('heading', { level: 1, name: mockedClientIsolation.name })).toBeVisible()
    expect(await screen.findByText(mockedClientIsolation.description!)).toBeVisible()

    // Verify the instances
    const targetVenue = mockedVenueUsage.data[0]
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: new RegExp(targetVenue.venueName) })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <ClientIsolationDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('Policies & Profiles')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Client Isolation'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <ClientIsolationDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Client Isolation'
    })).toBeVisible()
  })

  it('should navigate to the edit page', async () => {
    const editLink = `/${params.tenantId}/t/` + getPolicyDetailsLink({
      type: PolicyType.CLIENT_ISOLATION,
      oper: PolicyOperation.EDIT,
      policyId: params.policyId
    })

    render(
      <Provider>
        <ClientIsolationDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Configure' })).toHaveAttribute('href', editLink)
  })
})
