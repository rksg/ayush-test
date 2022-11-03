import React from 'react'

import { act, fireEvent } from '@testing-library/react'
import { Form }           from 'antd'
import { rest }           from 'msw'

import { policyApi }                                                                  from '@acx-ui/rc/services'
import { RogueAPDetectionContextType, RogueAPDetectionUrls, RogueAPRule, RogueVenue } from '@acx-ui/rc/utils'
import { Provider, store }                                                            from '@acx-ui/store'
import { mockServer, render, screen }                                                 from '@acx-ui/test-utils'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

import RogueAPDetectionForm from './RogueAPDetectionForm'
import userEvent from '@testing-library/user-event';


const policyListContent = {
  fields: null,
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'policyId1',
      name: 'test',
      description: '',
      numOfRules: 1,
      lastModifier: 'FisrtName 1649 LastName 1649',
      lastUpdTime: 1664790827392,
      numOfActiveVenues: 0,
      activeVenues: []
    },
    {
      id: 'be62604f39aa4bb8a9f9a0733ac07add',
      name: 'test6',
      description: '',
      numOfRules: 1,
      lastModifier: 'FisrtName 1649 LastName 1649',
      lastUpdTime: 1667215711375,
      numOfActiveVenues: 0,
      activeVenues: []
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
  name: 'policyName1',
  rules: [
    {
      name: 'SameNetworkRuleName1',
      type: 'SameNetworkRule',
      classification: 'Malicious',
      priority: 1
    },
    {
      name: 'SameNetworkRuleName2',
      type: 'SameNetworkRule',
      classification: 'Malicious',
      priority: 2
    }
  ],
  id: 'policyId1'
}

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
  venues: [] as RogueVenue[]
} as RogueAPDetectionContextType

describe('RogueAPDetectionForm', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(policyApi.util.resetApiState())
    })
  })

  it('should render RogueAPDetectionForm successfully', async () => {
    mockServer.use(rest.get(
      RogueAPDetectionUrls.getRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(detailContent)
      )
    ), rest.post(
      RogueAPDetectionUrls.getVenueRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(venueTable)
      )
    ), rest.post(
      RogueAPDetectionUrls.getRoguePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(policyListContent)
      )
    ))

    render(
      <RogueAPDetectionContext.Provider value={{
        state: initState,
        dispatch: setRogueAPConfigure
      }}>
        <RogueAPDetectionForm edit={false}/>
      </RogueAPDetectionContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getAllByText('Settings')).toBeTruthy()
    expect(screen.getAllByText('Scope')).toBeTruthy()
    expect(screen.getAllByText('Summary')).toBeTruthy()

    fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
      { target: { value: 'test' } })

    fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
      { target: { value: 'policyName11' } })

    fireEvent.change(screen.getByRole('textbox', { name: /tags/i }),
      { target: { value: 'a,b,c' } })

    fireEvent.click(screen.getByRole('button', {
      name: /add rule/i
    }))

    fireEvent.change(screen.getByRole('textbox', { name: /rule name/i }),
      { target: { value: 'rule1' } })

    fireEvent.click(screen.getByText('Add'))

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByText('test-venue2')

    expect(screen.getByText(
      'test-venue'
    )).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByText(/venues\(0\)/i)

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Summary', level: 3 })

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))
  })

  it('should render RogueAPDetectionForm with editMode successfully', async () => {
    mockServer.use(rest.get(
      RogueAPDetectionUrls.getRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(detailContent)
      )
    ), rest.post(
      RogueAPDetectionUrls.getVenueRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(venueTable)
      )
    ), rest.post(
      RogueAPDetectionUrls.getRoguePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(policyListContent)
      )
    ))

    render(
      <RogueAPDetectionContext.Provider value={{
        state: initState,
        dispatch: setRogueAPConfigure
      }}>
        <RogueAPDetectionForm edit={true}/>
      </RogueAPDetectionContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          params: { policyId: 'policyId1', tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getAllByText('Settings')).toBeTruthy()
    expect(screen.getAllByText('Scope')).toBeTruthy()

    await screen.findByRole('heading', { name: 'Settings', level: 3 })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByText('test-venue2')
  })
})
