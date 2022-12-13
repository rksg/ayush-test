import React from 'react'

import { act, fireEvent } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import { Form }           from 'antd'
import { rest }           from 'msw'

import { policyApi }                                                         from '@acx-ui/rc/services'
import { RogueAPDetectionContextType, RogueApUrls, RogueAPRule, RogueVenue } from '@acx-ui/rc/utils'
import { Provider, store }                                                   from '@acx-ui/store'
import { mockServer, render, screen }                                        from '@acx-ui/test-utils'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

import RogueAPDetectionForm from './RogueAPDetectionForm'


const policyListContent = [
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

const detailContent = {
  venues: [
    {
      id: '4ca20c8311024ac5956d366f15d96e0c',
      name: 'test-venue'
    }
  ],
  name: 'test',
  rules: [
    {
      name: 'SameNetworkRuleName1',
      type: 'SameNetworkRule',
      classification: 'Malicious',
      priority: 1
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

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: jest.fn(),
  useTenantLink: jest.fn()
}))

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) =>
    <select
      role='combobox'
      onChange={e => onChange(e.target.value)}
      {...otherProps}>
      {children}
    </select>

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) =>
    <option role='option' {...otherProps}>{children}</option>

  return { ...antd, Select }
})

describe('RogueAPDetectionForm', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(policyApi.util.resetApiState())
    })
  })

  it('should render RogueAPDetectionForm successfully', async () => {
    mockServer.use(rest.post(
      RogueApUrls.getVenueRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(venueTable)
      )
    ), rest.get(
      RogueApUrls.getRoguePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(policyListContent)
      )
    ))

    render(
      <RogueAPDetectionContext.Provider value={{
        state: initState,
        dispatch: setRogueAPConfigure
      }}>
        <Form>
          <RogueAPDetectionForm edit={false}/>
        </Form>
      </RogueAPDetectionContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          path: '/policies/rogueAp/create',
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getAllByText('Settings')).toBeTruthy()
    expect(screen.getAllByText('Scope')).toBeTruthy()
    expect(screen.getAllByText('Summary')).toBeTruthy()

    await screen.findByRole('heading', { name: 'Settings', level: 3 })

    fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
      { target: { value: 'test' } })

    fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
      { target: { value: 'policyTestName' } })

    fireEvent.change(screen.getByRole('textbox', { name: /tags/i }),
      { target: { value: 'a,b,c' } })

    fireEvent.click(screen.getByRole('button', {
      name: /add rule/i
    }))

    fireEvent.change(screen.getByRole('textbox', { name: /rule name/i }),
      { target: { value: 'rule1' } })

    fireEvent.change(screen.getByTestId('selectRogueRule'), {
      target: { value: 'CTSAbuseRule' }
    })

    fireEvent.change(screen.getByTestId('selectRogueCategory'), {
      target: { value: 'Unclassified' }
    })

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText('rule1')

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Scope', level: 3 })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByText(/venues \(0\)/i)

    await screen.findByRole('heading', { name: 'Summary', level: 3 })

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))
  })

  it('should render RogueAPDetectionForm with editMode successfully', async () => {
    mockServer.use(rest.get(
      RogueApUrls.getRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(detailContent)
      )
    ), rest.post(
      RogueApUrls.getVenueRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(venueTable)
      )
    ), rest.get(
      RogueApUrls.getRoguePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(policyListContent)
      )
    ))

    render(
      <RogueAPDetectionContext.Provider value={{
        state: initState,
        dispatch: setRogueAPConfigure
      }}>
        <Form>
          <RogueAPDetectionForm edit={true}/>
        </Form>
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

    fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
      { target: { value: 'test6' } })

    fireEvent.click(screen.getByRole('button', {
      name: /add rule/i
    }))

    fireEvent.change(screen.getByRole('textbox', { name: /rule name/i }),
      { target: { value: 'rule1' } })

    await userEvent.click(screen.getByText('Add'))

    fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
      { target: { value: 'test' } })

    fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
      { target: { value: 'anotherPolicyName' } })


    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Scope', level: 3 })

    await screen.findByText('test-venue2')

    const finishBtn = await screen.findByRole('button', { name: 'Finish' })

    await userEvent.click(finishBtn)
  })
})
