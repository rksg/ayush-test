import { rest } from 'msw'

import { SyslogUrls }                          from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import SyslogVenueDetail from './SyslogVenueDetail'

const venueDetailContent = {
  fields: [
    'country',
    'city',
    'name',
    'id',
    'aggregatedApStatus',
    'syslog',
    'status'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '4ca20c8311024ac5956d366f15d96e0c',
      name: 'test-venue',
      city: 'Toronto, Ontario',
      country: 'Canada',
      aggregatedApStatus: {
        '1_01_NeverContactedCloud': 10
      },
      status: '1_InSetupPhase',
      syslog: {
        policyId: 'policyId1',
        policyName: 'Default profile',
        enabled: false
      }
    },
    {
      id: '4ca20c8311024ac5956d366f15d96e03',
      name: 'test-venue2',
      city: 'Toronto, Ontario',
      country: 'Canada',
      aggregatedApStatus: {
        '2_00_Operational': 5
      },
      status: '1_InSetupPhase',
      syslog: {
        policyId: 'policyId1',
        policyName: 'Default profile',
        enabled: true
      }
    },
    {
      id: '4ca20a8511024ac5956d366f15d12t03',
      name: 'test-venue3',
      city: 'Toronto, Ontario',
      country: 'Canada',
      status: '1_InSetupPhase',
      syslog: {
        policyId: 'policyId1',
        policyName: 'Default profile',
        enabled: true
      }
    }
  ]
}

const detailContent = {
  venues: [
    {
      id: '4ca20c8311024ac5956d366f15d96e0c',
      name: 'test-venue'
    }
  ],
  name: 'Default profile',
  id: 'policyId1'
}

const params: { tenantId: string, policyId: string } = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  policyId: 'policy-id'
}

describe('SyslogVenueDetail', () => {
  it('should render SyslogVenueDetail successfully', async () => {
    const mockGetSyslogPolicy = jest.fn()
    mockServer.use(
      rest.get(
        SyslogUrls.getSyslogPolicy.url,
        (_, res, ctx) => {
          mockGetSyslogPolicy()
          return res(
            ctx.json(detailContent)
          )
        }
      ),
      rest.post(
        SyslogUrls.getVenueSyslogList.url,
        (_, res, ctx) => res(
          ctx.json(venueDetailContent)
        )
      )
    )

    render(<Provider><SyslogVenueDetail /></Provider>, { route: { params } })

    await waitFor(()=>{
      expect(mockGetSyslogPolicy).toBeCalled()
    })
    expect(await screen.findByText(/Venue Name/i)).toBeInTheDocument()
    expect(await screen.findByText(/Instance \(1\)/)).toBeVisible()
  })
})
