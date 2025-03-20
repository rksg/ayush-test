import React from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { policyApi }                                       from '@acx-ui/rc/services'
import {
  RogueAPDetectionContextType,
  RogueApUrls,
  RogueAPRule,
  RogueVenue,
  PoliciesConfigTemplateUrlsInfo, ConfigTemplateContext
} from '@acx-ui/rc/utils'
import { Provider, store }                         from '@acx-ui/store'
import { act, mockServer, render, screen, within } from '@acx-ui/test-utils'

import { detailContent, mockedRogueApPolicyRbac } from '../__tests__/fixtures'
import RogueAPDetectionContext                    from '../RogueAPDetectionContext'

import RuleTable from './RuleTable'


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
    mockServer.use(
      rest.get(RogueApUrls.getRoguePolicy.url,
        (_, res, ctx) => res(ctx.json(detailContent))
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
    mockServer.use(
      rest.get(RogueApUrls.getRoguePolicy.url,
        (_, res, ctx) => res(ctx.json(detailContent))
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

    await userEvent.click(screen.getByRole('button', {
      name: /edit/i
    }))

    const dialog = screen.getByRole('dialog')

    await userEvent.click(within(dialog).getByText(/cancel/i))

    expect(dialog).not.toBeVisible()

  })

  it('should render RuleTable with editMode delete successfully', async () => {
    mockServer.use(
      rest.get(RogueApUrls.getRoguePolicy.url,
        (_, res, ctx) => res(ctx.json(detailContent))
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

    await userEvent.click(screen.getByRole('button', {
      name: /delete/i
    }))

    await screen.findByText(/delete \"samenetworkrulename1\"?/i)

    await userEvent.click(screen.getByText(/delete \"samenetworkrulename1\"?/i))

    expect(await screen.findByText(/are you sure you want to delete this rule\?/i)).toBeVisible()
  })

  it('should render RuleTable successfully with RBAC turned on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)

    mockServer.use(
      rest.get(RogueApUrls.getRoguePolicyRbac.url,
        (_, res, ctx) => res(ctx.json(mockedRogueApPolicyRbac))
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

  // eslint-disable-next-line max-len
  it('should render RuleTable successfully with RBAC_CONFIG_TEMPLATE_TOGGLE turned on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_CONFIG_TEMPLATE_TOGGLE)

    mockServer.use(
      rest.get(PoliciesConfigTemplateUrlsInfo.getRoguePolicyRbac.url,
        (_, res, ctx) => res(ctx.json(mockedRogueApPolicyRbac))
      ))

    render(
      <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
        <RogueAPDetectionContext.Provider value={{
          state: initState,
          dispatch: setRogueAPConfigure
        }}>
          <RuleTable edit={false}/>
        </RogueAPDetectionContext.Provider>
      </ConfigTemplateContext.Provider>
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

})
