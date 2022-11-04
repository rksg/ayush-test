import React from 'react'

import { act }  from '@testing-library/react'
import { rest } from 'msw'

import { policyApi }                                                                  from '@acx-ui/rc/services'
import { RogueAPDetectionContextType, RogueAPDetectionUrls, RogueAPRule, RogueVenue } from '@acx-ui/rc/utils'
import { Provider, store }                                                            from '@acx-ui/store'
import { mockServer, render, screen }                                                 from '@acx-ui/test-utils'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

import RogueAPDetectionSettingForm from './RogueAPDetectionSettingForm'


const policyListContent = {
  fields: null,
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'policyId',
      name: 'policyName1',
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
  name: 'Default profile',
  rules: [
    {
      name: 'SameNetworkRuleName',
      type: 'SameNetworkRule',
      classification: 'Malicious',
      priority: 1
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
      RogueAPDetectionUrls.getRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(detailContent)
      )
    ))

    render(
      <RogueAPDetectionContext.Provider value={{
        state: initState,
        dispatch: setRogueAPConfigure
      }}>
        <RogueAPDetectionSettingForm edit={false}/>
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
      name: /ruletype/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /category/i
    })).toBeTruthy()
  })

  it('should render RogueAPDetectionSettingForm with editMode successfully', async () => {
    mockServer.use(rest.get(
      RogueAPDetectionUrls.getRoguePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(policyListContent)
      )
    ))

    render(
      <RogueAPDetectionContext.Provider value={{
        state: initStateEditMode,
        dispatch: setRogueAPConfigure
      }}>
        <RogueAPDetectionSettingForm edit={true}/>
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
      name: /ruletype/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /category/i
    })).toBeTruthy()
  })
})
