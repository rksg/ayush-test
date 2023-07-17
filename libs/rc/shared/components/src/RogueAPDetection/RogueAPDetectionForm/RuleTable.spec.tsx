import React from 'react'

import { act, fireEvent, within } from '@testing-library/react'
import userEvent                  from '@testing-library/user-event'
import { rest }                   from 'msw'

import { policyApi }                                                         from '@acx-ui/rc/services'
import { RogueAPDetectionContextType, RogueApUrls, RogueAPRule, RogueVenue } from '@acx-ui/rc/utils'
import { Provider, store }                                                   from '@acx-ui/store'
import { mockServer, render, screen }                                        from '@acx-ui/test-utils'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

import RuleTable from './RuleTable'

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

const initStateEditMode = {
  policyName: 'Default Profile',
  tags: [],
  description: '',
  rules: [{
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
  }] as RogueAPRule[],
  venues: [] as RogueVenue[]
} as RogueAPDetectionContextType

describe('RuleTable', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(policyApi.util.resetApiState())
    })
  })

  it('should render RuleTable successfully', async () => {
    mockServer.use(rest.get(
      RogueApUrls.getRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(detailContent)
      )
    ))

    render(
      <RogueAPDetectionContext.Provider value={{
        state: initState,
        dispatch: setRogueAPConfigure
      }}>
        <RuleTable edit={false}/>
      </RogueAPDetectionContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getByRole('columnheader', {
      name: /priority/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /rule name/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /rule type/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /category/i
    })).toBeTruthy()
  })

  it('should render RuleTable with editMode successfully', async () => {
    mockServer.use(rest.get(
      RogueApUrls.getRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(detailContent)
      )
    ))

    render(
      <RogueAPDetectionContext.Provider value={{
        state: initStateEditMode,
        dispatch: setRogueAPConfigure
      }}>
        <RuleTable edit={true}/>
      </RogueAPDetectionContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          params: { policyId: 'policyId1', tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getByRole('columnheader', {
      name: /priority/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /rule name/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /rule type/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /category/i
    })).toBeTruthy()

    await screen.findByText(/sameNetworkRuleName2/i)

    screen.getByText('SameNetworkRuleName1')

    await userEvent.click(screen.getByText(/sameNetworkRuleName1/i))

    fireEvent.click(screen.getByRole('button', {
      name: /edit/i
    }))

    const dialog = screen.getByRole('dialog')

    fireEvent.click(within(dialog).getByText(/cancel/i))

    expect(dialog).not.toBeVisible()

  })

  it('should render RuleTable with editMode delete successfully', async () => {
    mockServer.use(rest.get(
      RogueApUrls.getRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(detailContent)
      )
    ))

    render(
      <RogueAPDetectionContext.Provider value={{
        state: initStateEditMode,
        dispatch: setRogueAPConfigure
      }}>
        <RuleTable edit={true}/>
      </RogueAPDetectionContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          params: { policyId: 'policyId1', tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByText(/sameNetworkRuleName2/i)

    screen.getByText('SameNetworkRuleName1')

    await userEvent.click(screen.getByText(/sameNetworkRuleName1/i))

    await screen.findByText(/1 selected/i)

    fireEvent.click(screen.getByRole('button', {
      name: /delete/i
    }))

    await screen.findByText(/delete \"samenetworkrulename1\"?/i)

    fireEvent.click(screen.getByText(/delete \"samenetworkrulename1\"?/i))
  })
})
