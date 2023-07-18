import React from 'react'

import { userEvent }         from '@storybook/testing-library'
import { fireEvent, within } from '@testing-library/react'
import { rest }              from 'msw'

import { policyApi } from '@acx-ui/rc/services'
import {
  RogueAPDetectionContextType,
  RogueApUrls,
  RogueAPRule,
  RogueVenue
} from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

import { RogueVenueTable } from './RogueVenueTable'


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

const ruleState = {
  policyName: '',
  tags: [],
  description: '',
  rules: [] as RogueAPRule[],
  venues: [{
    id: '4ca20c8311024ac5956d366f15d96e03',
    name: 'test-venue2'
  }, ...Array.from(Array(63).keys()).map(key => {
    return {
      id: `name_${key}`,
      name: key
    }
  })] as RogueVenue[]
} as RogueAPDetectionContextType

describe('RogueVenueTable', () => {
  beforeEach(() => {
    store.dispatch(policyApi.util.resetApiState())
  })

  it('should render RogueVenueTable successfully', async () => {
    mockServer.use(rest.post(
      RogueApUrls.getVenueRoguePolicy.url,
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
    await screen.findByText('test-venue2')

    const row = screen.getByRole('row', {
      name: /test\-venue2 5 0 ON \(Default policyId1 profile\)/i
    })

    fireEvent.click(within(row).getByRole('checkbox'))

    const activateBtn = screen.getByRole('button', { name: 'Activate' })
    fireEvent.click(activateBtn)

    const dialog = await screen.findByRole('dialog')
    await screen.findByText(/Change Rogue AP Profile/i)
    fireEvent.click( await screen.findByText(/OK/))

    await waitFor(()=>{
      expect(dialog).not.toBeInTheDocument()
    })

    expect(await within(row).findByRole('switch')).toBeChecked()
    expect(await within(row).findByRole('checkbox')).not.toBeChecked()

    fireEvent.click(await within(row).findByRole('checkbox'))
    const deactivateBtn = await screen.findByRole('button', { name: 'Deactivate' })
    fireEvent.click(deactivateBtn)
    expect(await within(row).findByRole('checkbox')).not.toBeChecked()
  })

  it('render RogueVenueTable with maximum venue', async () => {
    mockServer.use(rest.post(
      RogueApUrls.getVenueRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(venueTables)
      )
    ))

    render(
      <RogueAPDetectionContext.Provider value={{
        state: ruleState,
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

    await screen.findByText('test-venue2')

    const row = screen.getByRole('row', {
      name: /test\-venue2 5 0 ON \(Default policyId1 profile\)/i
    })
    expect(await within(row).findByRole('switch')).toBeChecked()

    fireEvent.click(within(row).getByRole('checkbox'))

    const activateBtn = screen.getByRole('button', { name: 'Activate' })
    fireEvent.click(activateBtn)

    await userEvent.click(screen.getByTestId('switchBtn_4ca20c8311024ac5956d366f15d96e03'))
  })
})
