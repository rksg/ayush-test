import React from 'react'

import { act }  from '@testing-library/react'
import { rest } from 'msw'

import { policyApi }                  from '@acx-ui/rc/services'
import { SyslogUrls }                 from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import SyslogDetailView  from './SyslogDetailView'
import SyslogVenueDetail from './SyslogVenueDetail'

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

const emptyDetailContent = {
  id: 'policyId2'
}

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

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

describe('SyslogDetailView', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(policyApi.util.resetApiState())
    })
  })

  it('should render SyslogDetailView successfully', async () => {
    mockServer.use(rest.get(
      SyslogUrls.getSyslogPolicy.url,
      (_, res, ctx) => res(
        ctx.json(detailContent)
      )
    ), rest.post(
      SyslogUrls.getVenueSyslogList.url,
      (_, res, ctx) => res(
        ctx.json(venueDetailContent)
      )
    ))

    render(
      <SyslogDetailView />
      , {
        wrapper: wrapper,
        route: {
          params: { policyId: 'policyId1', tenantId: 'tenantId1' }
        }
      }
    )

  })

  it('should render breadcrumb correctly', async () => {
    mockServer.use(rest.get(
      SyslogUrls.getSyslogPolicy.url,
      (_, res, ctx) => res(
        ctx.json(detailContent)
      )
    ))
    render(
      <SyslogDetailView />
      , {
        wrapper: wrapper,
        route: {
          params: { policyId: 'policyId1', tenantId: 'tenantId1' }
        }
      }
    )

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Syslog Server'
    })).toBeVisible()
  })

  it('should render empty SyslogDetailView successfully', async () => {
    mockServer.use(rest.get(
      SyslogUrls.getSyslogPolicy.url,
      (_, res, ctx) => res(
        ctx.json(emptyDetailContent)
      )
    ), rest.post(
      SyslogUrls.getVenueSyslogList.url,
      (_, res, ctx) => res(
        ctx.json(venueDetailContent)
      )
    ))

    render(
      <SyslogDetailView />
      , {
        wrapper: wrapper,
        route: {
          params: { policyId: 'policyId2', tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByText(/configure/i)
  })

  it('should render SyslogVenueDetail successfully', async () => {
    mockServer.use(rest.get(
      SyslogUrls.getSyslogPolicy.url,
      (_, res, ctx) => res(
        ctx.json(emptyDetailContent)
      )
    ), rest.post(
      SyslogUrls.getVenueSyslogList.url,
      (_, res, ctx) => res(
        ctx.json(venueDetailContent)
      )
    ))

    render(
      <SyslogVenueDetail />
      , {
        wrapper: wrapper,
        route: {
          params: { policyId: 'policyId2', tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByText(/Venue Name/i)
  })

})
