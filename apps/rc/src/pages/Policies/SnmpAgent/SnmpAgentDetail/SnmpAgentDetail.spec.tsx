import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                      from '@acx-ui/feature-toggle'
import { ApSnmpUrls, getPolicyDetailsLink, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { Provider }                                                                          from '@acx-ui/store'
import { mockServer, render, screen }                                                        from '@acx-ui/test-utils'

import SnmpAgentDetail from './SnmpAgentDetail'

const mockOverviewData = {
  totalCount: 1,
  page: 1,
  data: [{
    aps: { count: 1, names: ['R550_0131'] },
    id: 'c1082e7d05d74eb897bb3600a15c1dc7',
    name: 'SNMP-1',
    v2Agents: { count: 1, names: ['test'] },
    v3Agents: { count: 1, names: ['testUser'] },
    venues: { count: 1, names: ['My-Venue'] }
  }]
}

const mockInstancesData = {
  data: [
    {
      apId: '302002030366',
      apName: 'R550_0131',
      venueId: 'f44d4134ecbb4ce5a1a41baca4dfe5de',
      venueName: 'My-Venue'
    }
  ],
  totalCount: 1,
  totalPages: 1,
  page: 1
}

describe('SnmpAgentForm', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    policyId: '4b76b1952c80401b8500b00d68106576'
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.DETAIL })


  beforeEach(async () => {
    mockServer.use(
      rest.post(ApSnmpUrls.getApSnmpFromViewModel.url,
        (_, res, ctx) => res(ctx.json(mockOverviewData))),
      rest.post(ApSnmpUrls.getApUsageByApSnmpPolicy.url,
        (_, res, ctx) => res(ctx.json(mockInstancesData)))
    )
  })

  it('should create SNMP Agent Detail successfully', async () => {
    render(
      <Provider>
        <SnmpAgentDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    const snampOverviewData = mockOverviewData.data[0]
    // Verify the settings
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('heading', { level: 1, name: snampOverviewData.name })).toBeVisible()


    // Verify the instances
    await screen.findByText('Instances (1)')
    const targetVenue = mockInstancesData.data[0]
    // eslint-disable-next-line max-len
    const venueLink = await screen.findByRole('link', { name: new RegExp(targetVenue.venueName) })
    expect(venueLink).toBeVisible()

    userEvent.click(venueLink)
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <SnmpAgentDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'SNMP Agent'
    })).toBeVisible()
  })


  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <SnmpAgentDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'SNMP Agent'
    })).toBeVisible()
  })

  it('should navigate to the edit page', async () => {
    const editLink = `/${params.tenantId}/t/` + getPolicyDetailsLink({
      type: PolicyType.SNMP_AGENT,
      oper: PolicyOperation.EDIT,
      policyId: params.policyId
    })

    render(
      <Provider>
        <SnmpAgentDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Configure' })).toHaveAttribute('href', editLink)
  })
})
