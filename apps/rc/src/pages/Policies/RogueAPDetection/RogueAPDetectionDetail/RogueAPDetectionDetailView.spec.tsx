import React from 'react'

import { act }  from '@testing-library/react'
import { rest } from 'msw'

import { policyApi }                  from '@acx-ui/rc/services'
import { RogueAPDetectionUrls }       from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import RogueAPDetectionDetailView from './RogueAPDetectionDetailView'

const detailContent = {
  venues: [
    {
      id: '4ca20c8311024ac5956d366f15d96e0c',
      name: 'test-venue'
    }
  ],
  name: 'Default profile',
  rules: [
    {
      name: 'Same Network Rule',
      type: 'SameNetworkRule',
      classification: 'Malicious',
      priority: 1
    }
  ],
  id: 'policyId1'
}

const venueDetailContent = {
  fields: [
    'country',
    'city',
    'name',
    'switches',
    'id',
    'aggregatedApStatus',
    'rogueDetection',
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
      rogueDetection: {
        policyId: '14d6ee52df3a48988f91558bac54c1ae',
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
      rogueDetection: {
        policyId: 'policyId1',
        policyName: 'Default policyId1 profile',
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

describe('RogueAPDetectionDetailView', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(policyApi.util.resetApiState())
    })
  })

  it('should render RogueAPDetectionDetailView successfully', async () => {
    mockServer.use(rest.get(
      RogueAPDetectionUrls.getRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(detailContent)
      )
    ), rest.post(
      RogueAPDetectionUrls.getVenueRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(venueDetailContent)
      )
    ))

    render(
      <RogueAPDetectionDetailView />
      , {
        wrapper: wrapper,
        route: {
          params: { policyId: 'policyId1', tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByRole('heading', {
      name: /classification rules/i
    })

    screen.getByText(1)

    await screen.findByRole('columnheader', {
      name: /venue name/i
    })

    await screen.findByRole('cell', {
      name: /test-venue2/i
    })
  })
})
