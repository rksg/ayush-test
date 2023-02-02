import React from 'react'

import { act, fireEvent, within } from '@testing-library/react'
import { rest }                   from 'msw'

import { policyApi } from '@acx-ui/rc/services'
import {
  SyslogContextType,
  SyslogUrls,
  SyslogVenue
} from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import SyslogContext from '../SyslogContext'

import SyslogVenueTable from './SyslogVenueTable'

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
    },
    {
      id: '4ca20c5411024ac5956d366f15d96e03',
      name: 'test-venue3',
      city: 'Toronto, Ontario',
      country: 'Canada',
      aggregatedApStatus: {
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

const venueTables = {
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
  totalCount: 63,
  page: 1,
  data: [
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
    },
    ...Array.from(Array(63).keys()).map(key => {
      return {
        id: `name_${key}`,
        name: key
      }
    })
  ]
}

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

const setSyslogConfigure = jest.fn()

const initState = {
  policyName: '',
  server: '1.1.1.1',
  port: '514',
  protocol: 'TCP',
  secondaryServer: '2.2.2.2',
  secondaryPort: '1514',
  secondaryProtocol: 'UDP',
  facility: 'KEEP_ORIGINAL',
  priority: 'ERROR',
  flowLevel: 'ALL',
  venues: [{
    id: '4ca20c8311024ac5956d366f15d96e03',
    name: 'test-venue2'
  }] as SyslogVenue[]
} as SyslogContextType

const ruleState = {
  policyName: '',
  server: '1.1.1.1',
  port: '514',
  protocol: 'TCP',
  secondaryServer: '2.2.2.2',
  secondaryPort: '1514',
  secondaryProtocol: 'UDP',
  facility: 'KEEP_ORIGINAL',
  priority: 'ERROR',
  flowLevel: 'ALL',
  venues: [{
    id: '4ca20c8311024ac5956d366f15d96e03',
    name: 'test-venue2'
  }, ...Array.from(Array(63).keys()).map(key => {
    return {
      id: `name_${key}`,
      name: key
    }
  })] as SyslogVenue[]
} as SyslogContextType

describe('SyslogVenueTable', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(policyApi.util.resetApiState())
    })
  })

  it('should render SyslogVenueTable successfully', async () => {
    mockServer.use(rest.post(
      SyslogUrls.getVenueSyslogPolicy.url,
      (_, res, ctx) => res(
        ctx.json(venueTable)
      )
    ))

    render(
      <SyslogContext.Provider value={{
        state: initState,
        dispatch: setSyslogConfigure
      }}>
        <SyslogVenueTable />
      </SyslogContext.Provider>
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
      name: /activate/i
    })).toBeTruthy()

    await screen.findByText('test-venue')
    screen.getByText('test-venue2')
    const row = screen.getByRole('row', {
      name: /test\-venue2/i
    })
    fireEvent.click(within(row).getByRole('checkbox'))
    const activateBtn = screen.getByRole('button', { name: 'Activate' })
    fireEvent.click(activateBtn)
    fireEvent.click(within(row).getByRole('checkbox'))
    const deactivateBtn = screen.getByRole('button', { name: 'Deactivate' })
    fireEvent.click(deactivateBtn)

  })

  it('render SyslogVenueTable with maximum venue', async () => {
    mockServer.use(rest.post(
      SyslogUrls.getVenueSyslogPolicy.url,
      (_, res, ctx) => res(
        ctx.json(venueTables)
      )
    ))

    render(
      <SyslogContext.Provider value={{
        state: ruleState,
        dispatch: setSyslogConfigure
      }}>
        <SyslogVenueTable />
      </SyslogContext.Provider>
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
      name: /activate/i
    })).toBeTruthy()

  })
})
