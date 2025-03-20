import React from 'react'

import { Form } from 'antd'
import { rest } from 'msw'

import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { policyApi }                from '@acx-ui/rc/services'
import {
  ConfigTemplateContext,
  RogueAPDetectionContextType,
  RogueApUrls,
  RogueAPRule,
  RogueVenue,
  PoliciesConfigTemplateUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                          from '@acx-ui/store'
import { act, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  detailContent,
  mockedRogueApPoliciesList,
  mockedRogueApPoliciesListRbac,
  mockedRogueApPolicyRbac,
  policyListContent
} from '../__tests__/fixtures'
import RogueAPDetectionContext from '../RogueAPDetectionContext'

import { RogueAPDetectionForm }        from './RogueAPDetectionForm'
import { RogueAPDetectionSettingForm } from './RogueAPDetectionSettingForm'


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
  policyName: '',
  tags: [],
  description: '',
  rules: [] as RogueAPRule[],
  venues: [] as RogueVenue[]
} as RogueAPDetectionContextType

describe('RogueAPDetectionSettingForm', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(policyApi.util.resetApiState())
    })
  })

  it('should render RogueAPDetectionSettingForm successfully', async () => {
    mockServer.use(rest.get(
      RogueApUrls.getRoguePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(policyListContent)
      )
    ), rest.post(
      RogueApUrls.getEnhancedRoguePolicyList.url,
      (req, res, ctx) => res(ctx.json(mockedRogueApPoliciesList))
    ))

    render(
      <RogueAPDetectionContext.Provider value={{
        state: initState,
        dispatch: setRogueAPConfigure
      }}>
        <Form>
          <RogueAPDetectionSettingForm edit={false}/>
        </Form>
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
  })

  it('should render RogueAPDetectionSettingForm with editMode successfully', async () => {
    const mockGetRoguePolicy = jest.fn()
    mockServer.use(rest.get(
      RogueApUrls.getRoguePolicy.url,
      (_, res, ctx) => {
        mockGetRoguePolicy()
        return res(ctx.json(detailContent))
      }
    ), rest.get(
      RogueApUrls.getRoguePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(policyListContent)
      )
    ), rest.post(
      RogueApUrls.getEnhancedRoguePolicyList.url,
      (req, res, ctx) => res(ctx.json(mockedRogueApPoliciesList))
    ))

    render(
      <RogueAPDetectionContext.Provider value={{
        state: initStateEditMode,
        dispatch: setRogueAPConfigure
      }}>
        <RogueAPDetectionForm edit={true}/>
      </RogueAPDetectionContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          path: '/policies/rogueAp/:policyId/edit',
          params: { policyId: 'policyId1', tenantId: 'tenantId1' }
        }
      }
    )

    await waitFor(() => expect(mockGetRoguePolicy).toBeCalled())

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

    await waitFor(async () => {
      expect(await screen.findByLabelText(/Policy Name/i)).toHaveValue(detailContent.name)
    })
  })

  it('updates state correctly when enableRbac is true', async () => {
    const mockGetRoguePolicy = jest.fn()
    const mockGetRoguePolicyList = jest.fn()
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)

    mockServer.use(rest.get(
      RogueApUrls.getRoguePolicyRbac.url,
      (_, res, ctx) => res(
        mockGetRoguePolicy(),
        ctx.json(mockedRogueApPolicyRbac)
      )
    ), rest.post(
      RogueApUrls.getRoguePolicyListRbac.url,
      (req, res, ctx) => res(
        mockGetRoguePolicyList(),
        ctx.json(mockedRogueApPoliciesListRbac))
    ))

    render(
      <RogueAPDetectionContext.Provider value={{
        state: initStateEditMode,
        dispatch: setRogueAPConfigure
      }}>
        <Form>
          <RogueAPDetectionSettingForm edit={true} />
        </Form>
      </RogueAPDetectionContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          path: '/policies/rogueAp/:policyId/edit',
          params: { policyId: 'policyId1', tenantId: 'tenantId1' }
        }
      }
    )

    await waitFor(() => expect(mockGetRoguePolicy).toBeCalled())
    await waitFor(() => expect(mockGetRoguePolicyList).toBeCalled())

    const inputElement = screen.getByRole('textbox', { name: /Policy Name/i })

    await waitFor(() => {
      expect(inputElement).toHaveValue('adhoc-10')
    })

    expect(setRogueAPConfigure).toHaveBeenCalledWith({
      type: 'UPDATE_ENTIRE_RULE',
      payload: {
        rules: [{
          classification: 'Malicious',
          name: '123123',
          priority: 1,
          type: 'AdhocRule'
        }
        ] }
    })

    expect(setRogueAPConfigure).nthCalledWith(2, {
      type: 'UPDATE_STATE',
      payload: {
        state: {
          ...initStateEditMode,
          id: '4eaaf341d6c34a41a80d7fd34a152126',
          description: 'test description',
          policyName: 'adhoc-10',
          rules: [
            {
              name: '123123',
              type: 'AdhocRule',
              classification: 'Malicious',
              priority: 1
            }
          ],
          // eslint-disable-next-line max-len
          venues: [{ id: '42cccf1501114082bd92c8e1cbfae7e4', name: '' }, { id: '78bda4899092461998c0be6a3a325936', name: '' }],
          // eslint-disable-next-line max-len
          oldVenues: [{ id: '42cccf1501114082bd92c8e1cbfae7e4', name: '' }, { id: '78bda4899092461998c0be6a3a325936', name: '' }],
          defaultPolicyId: 'c7a0b3746503419a83237fcbe8680792'
        }
      }
    })
  })

  it('updates state correctly when RBAC_CONFIG_TEMPLATE_TOGGLE is true', async () => {
    const mockGetRoguePolicy = jest.fn()
    const mockGetRoguePolicyList = jest.fn()
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_CONFIG_TEMPLATE_TOGGLE)

    mockServer.use(rest.get(
      PoliciesConfigTemplateUrlsInfo.getRoguePolicyRbac.url,
      (_, res, ctx) => res(
        mockGetRoguePolicy(),
        ctx.json(mockedRogueApPolicyRbac)
      )
    ), rest.post(
      PoliciesConfigTemplateUrlsInfo.getRoguePolicyListRbac.url,
      (req, res, ctx) => res(
        mockGetRoguePolicyList(),
        ctx.json(mockedRogueApPoliciesListRbac))
    ))

    render(
      <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
        <RogueAPDetectionContext.Provider value={{
          state: initStateEditMode,
          dispatch: setRogueAPConfigure
        }}>
          <Form>
            <RogueAPDetectionSettingForm edit={true} />
          </Form>
        </RogueAPDetectionContext.Provider>
      </ConfigTemplateContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          path: '/policies/rogueAp/:policyId/edit',
          params: { policyId: 'policyId1', tenantId: 'tenantId1' }
        }
      }
    )

    await waitFor(() => expect(mockGetRoguePolicy).toBeCalled())
    await waitFor(() => expect(mockGetRoguePolicyList).toBeCalled())

    const inputElement = screen.getByRole('textbox', { name: /Policy Name/i })

    await waitFor(() => {
      expect(inputElement).toHaveValue('adhoc-10')
    })

    expect(setRogueAPConfigure).toHaveBeenCalledWith({
      type: 'UPDATE_ENTIRE_RULE',
      payload: {
        rules: [{
          classification: 'Malicious',
          name: '123123',
          priority: 1,
          type: 'AdhocRule'
        }
        ] }
    })

    expect(setRogueAPConfigure).nthCalledWith(2, {
      type: 'UPDATE_STATE',
      payload: {
        state: {
          ...initStateEditMode,
          id: '4eaaf341d6c34a41a80d7fd34a152126',
          description: 'test description',
          policyName: 'adhoc-10',
          rules: [
            {
              name: '123123',
              type: 'AdhocRule',
              classification: 'Malicious',
              priority: 1
            }
          ],
          // eslint-disable-next-line max-len
          venues: [{ id: '42cccf1501114082bd92c8e1cbfae7e4', name: '' }, { id: '78bda4899092461998c0be6a3a325936', name: '' }],
          // eslint-disable-next-line max-len
          oldVenues: [{ id: '42cccf1501114082bd92c8e1cbfae7e4', name: '' }, { id: '78bda4899092461998c0be6a3a325936', name: '' }],
          defaultPolicyId: 'c7a0b3746503419a83237fcbe8680792'
        }
      }
    })
  })
})
