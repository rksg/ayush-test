import React from 'react'

import { act, fireEvent, within } from '@testing-library/react'
import { rest }                   from 'msw'

import { policyApi }                                                                  from '@acx-ui/rc/services'
import { RogueAPDetectionContextType, RogueAPDetectionUrls, RogueAPRule, RogueVenue } from '@acx-ui/rc/utils'
import { Provider, store }                                                            from '@acx-ui/store'
import { mockServer, render, screen }                                                 from '@acx-ui/test-utils'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

import RogueVenueTable from './RogueVenueTable'


const venueTable = {
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

const setRogueAPConfigure = jest.fn()

const initState = {
  policyName: '',
  tags: [],
  description: '',
  rules: [] as RogueAPRule[],
  venues: [{
    id: '4ca20c8311024ac5956d366f15d96e03',
    name: 'test-venue2'
  }] as RogueVenue[]
} as RogueAPDetectionContextType

describe('RogueVenueTable', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(policyApi.util.resetApiState())
    })
  })

  it('should render RogueVenueTable successfully', async () => {
    mockServer.use(rest.post(
      RogueAPDetectionUrls.getVenueRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(venueTable)
      )
    ))

    render(
      <RogueAPDetectionContext.Provider value={{
        state: initState,
        dispatch: setRogueAPConfigure
      }}>
        <RogueVenueTable />
      </RogueAPDetectionContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          params: { policyId: 'policyId1', tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getByRole('columnheader', {
      name: /venue/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /aps/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /switches/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /rogue ap detection/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /activate/i
    })).toBeTruthy()

    await screen.findByText('test-venue')

    screen.getByText('test-venue2')

    const row = screen.getByRole('row', {
      name: /test\-venue2 5 0 ON \(Default policyId1 profile\)/i
    })

    fireEvent.click(within(row).getByRole('checkbox'))

    const activateBtn = screen.getByRole('button', { name: 'Activate' })
    fireEvent.click(activateBtn)

    fireEvent.click(within(row).getByRole('checkbox'))

    const deactivateBtn = screen.getByRole('button', { name: 'Deactivate' })
    fireEvent.click(deactivateBtn)
  })
})
