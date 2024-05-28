import React from 'react'

import { Form } from 'antd'
import { rest } from 'msw'

import { policyApi }                                                         from '@acx-ui/rc/services'
import { RogueAPDetectionContextType, RogueApUrls, RogueAPRule, RogueVenue } from '@acx-ui/rc/utils'
import { Provider, store }                                                   from '@acx-ui/store'
import { act, mockServer, render, screen, waitFor }                          from '@acx-ui/test-utils'

import { detailContent, mockedRogueApPoliciesList, policyListContent } from '../__tests__/fixtures'
import RogueAPDetectionContext                                         from '../RogueAPDetectionContext'

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
})
