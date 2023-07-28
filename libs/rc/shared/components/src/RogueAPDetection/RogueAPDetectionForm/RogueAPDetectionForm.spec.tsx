import React from 'react'

import { fireEvent } from '@testing-library/react'
import userEvent     from '@testing-library/user-event'
import { Form }      from 'antd'
import { rest }      from 'msw'

import {
  RogueAPDetectionContextType,
  RogueAPRule,
  RogueApUrls,
  RogueCategory,
  RogueRuleType,
  RogueVenue
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

import { RogueAPDetectionForm } from './RogueAPDetectionForm'


const policyResponse = {
  requestId: '360cf6c7-b2c6-4973-b4c0-a6be63adaac0'
}

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
    },
    {
      name: 'SameNetworkRuleName2',
      type: RogueRuleType.CUSTOM_SNR_RULE,
      moreInfo: 88,
      classification: 'Malicious',
      priority: 2
    },
    {
      name: 'SameNetworkRuleName3',
      type: RogueRuleType.CUSTOM_SSID_RULE,
      moreInfo: 'ssidInMoreInfo',
      classification: 'Malicious',
      priority: 3
    },
    {
      name: 'SameNetworkRuleName4',
      type: RogueRuleType.CUSTOM_MAC_OUI_RULE,
      moreInfo: '11:22:33',
      classification: 'Malicious',
      priority: 4
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

const rogueRuleActionMap = {
  [RogueRuleType.CUSTOM_SNR_RULE]: { name: /signal threshold/i, value: '8' },
  [RogueRuleType.CUSTOM_SSID_RULE]: { name: /ssid/i, value: 'ssid123' },
  [RogueRuleType.CUSTOM_MAC_OUI_RULE]: { name: /mac oui/i, value: '11:22:33' }
}

const addRule = async (ruleName: string, type: RogueRuleType, classification: RogueCategory) => {
  await userEvent.click(screen.getByRole('button', {
    name: /add rule/i
  }))

  await screen.findByText(/add classification rule/i)

  await userEvent.type(screen.getByRole('textbox', { name: /rule name/i }), ruleName)

  fireEvent.change(screen.getByTestId('selectRogueRule'), {
    target: { value: type }
  })

  if (type === RogueRuleType.CUSTOM_SNR_RULE
    || type === RogueRuleType.CUSTOM_SSID_RULE
    || type === RogueRuleType.CUSTOM_MAC_OUI_RULE) {
    await userEvent.type(await screen.findByRole('textbox', {
      name: new RegExp(rogueRuleActionMap[type].name)
    }), rogueRuleActionMap[type].value)
  }

  fireEvent.change(screen.getByTestId('selectRogueCategory'), {
    target: { value: classification }
  })

  await userEvent.click(screen.getByText('Add'))

  await userEvent.click(await screen.findByRole('cell', {
    name: `${ruleName}`
  }))

  await userEvent.click(screen.getByRole('button', {
    name: /edit/i
  }))

  // edit the rule and modify the specific field value in CUSTOM_SNR_RULE, CUSTOM_SSID_RULE and CUSTOM_MAC_OUI_RULE
  if (type === RogueRuleType.CUSTOM_SNR_RULE) {
    await userEvent.type(await screen.findByRole('textbox', {
      name: new RegExp(rogueRuleActionMap[type].name)
    }), '8')

    await userEvent.click(screen.getByText('Save'))
  } else if (type === RogueRuleType.CUSTOM_SSID_RULE) {
    await userEvent.type(await screen.findByRole('textbox', {
      name: new RegExp(rogueRuleActionMap[type].name)
    }), 'modify')

    await userEvent.click(screen.getByText('Save'))
  } else if (type === RogueRuleType.CUSTOM_MAC_OUI_RULE) {
    await userEvent.clear(await screen.findByRole('textbox', {
      name: new RegExp(rogueRuleActionMap[type].name)
    }))

    await userEvent.type(screen.getByRole('textbox', {
      name: new RegExp(rogueRuleActionMap[type].name)
    }), '11:22:55')

    await userEvent.click(screen.getByText('Save'))
  } else {
    await userEvent.click(screen.getAllByRole('button', { name: 'Cancel' })[1])
  }
}

const addRuleWithoutEdit = async (
  ruleName: string, type: RogueRuleType, classification: RogueCategory
) => {
  await userEvent.click(screen.getByRole('button', {
    name: /add rule/i
  }))

  await screen.findByText(/add classification rule/i)

  await userEvent.type(screen.getByRole('textbox', { name: /rule name/i }), ruleName)

  fireEvent.change(screen.getByTestId('selectRogueRule'), {
    target: { value: type }
  })

  if (type === RogueRuleType.CUSTOM_SNR_RULE
    || type === RogueRuleType.CUSTOM_SSID_RULE
    || type === RogueRuleType.CUSTOM_MAC_OUI_RULE) {
    await userEvent.type(await screen.findByRole('textbox', {
      name: new RegExp(rogueRuleActionMap[type].name)
    }), rogueRuleActionMap[type].value)
  }

  fireEvent.change(screen.getByTestId('selectRogueCategory'), {
    target: { value: classification }
  })

  await userEvent.click(screen.getByText('Add'))

  await userEvent.click(screen.getAllByRole('button', { name: 'Cancel' })[1])
}

describe('RogueAPDetectionForm', () => {
  it('should render RogueAPDetectionForm successfully and edit rule', async () => {
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
    ), rest.post(
      RogueApUrls.addRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(policyResponse)
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
      { target: { value: '' } })

    fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
      { target: { value: 'policyTestName-modify' } })

    fireEvent.change(screen.getByRole('textbox', { name: /description/i }),
      { target: { value: 'desc1' } })

    await addRule('rule1', RogueRuleType.CTS_ABUSE_RULE, RogueCategory.MALICIOUS)

    await userEvent.click(await screen.findByText('rule1'))

    await userEvent.click(screen.getByRole('button', {
      name: /edit/i
    }))

    await userEvent.click(screen.getAllByRole('button', { name: 'Cancel' })[1])

    await screen.findByText('rule1')
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
    ), rest.post(
      RogueApUrls.addRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(policyResponse)
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
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getAllByText('Settings')).toBeTruthy()
    expect(screen.getAllByText('Scope')).toBeTruthy()
    expect(screen.getAllByText('Summary')).toBeTruthy()

    fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
      { target: { value: 'policyTestName-modify' } })

    await addRuleWithoutEdit('rule1', RogueRuleType.CTS_ABUSE_RULE, RogueCategory.MALICIOUS)

    await screen.findByText('rule1')

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { name: 'Scope', level: 3 })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByText(/venues \(0\)/i)

    await screen.findByRole('heading', { name: 'Summary', level: 3 })

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
  })

  it('should render RogueAPDetectionForm successfully with mac oui rule', async () => {
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
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByRole('heading', { name: 'Settings', level: 3 })

    await addRule('rule4', RogueRuleType.CUSTOM_MAC_OUI_RULE, RogueCategory.IGNORED)

    await screen.findByText('rule4')
  })

  it('should render RogueAPDetectionForm successfully with ssid rule', async () => {
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
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByRole('heading', { name: 'Settings', level: 3 })

    await addRule('rule3', RogueRuleType.CUSTOM_SSID_RULE, RogueCategory.KNOWN)

    await screen.findByText('rule3')
  })

  it.skip('should render RogueAPDetectionForm successfully with snr rule', async () => {
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
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByRole('heading', { name: 'Settings', level: 3 })

    await addRule('rule2', RogueRuleType.CUSTOM_SNR_RULE, RogueCategory.UNCLASSIFIED)

    await screen.findByText('rule2')
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
    ), rest.put(
      RogueApUrls.updateRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(policyResponse)
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
      { target: { value: 'test-modify' } })

    await userEvent.click(screen.getByRole('button', {
      name: /add rule/i
    }))

    fireEvent.change(screen.getByRole('textbox', { name: /rule name/i }),
      { target: { value: 'rule1' } })

    await userEvent.click(screen.getByText('Add'))

    fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
      { target: { value: 'test' } })

    fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
      { target: { value: 'anotherPolicyName' } })

    await userEvent.click(screen.getByRole('button', {
      name: /add rule/i
    }))

    await screen.findByText(/add classification rule/i)

    await userEvent.click(screen.getAllByRole('button', { name: 'Cancel' })[1])

    await userEvent.click(screen.getByText('Scope'))

    await screen.findByRole('heading', { name: 'Scope', level: 3 })

    await screen.findByText('test-venue2')

    const applyBtn = await screen.findByRole('button', { name: 'Apply' })

    await userEvent.click(applyBtn)
  })
})
