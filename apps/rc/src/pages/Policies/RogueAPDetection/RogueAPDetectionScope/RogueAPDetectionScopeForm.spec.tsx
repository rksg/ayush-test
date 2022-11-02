import React from 'react'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import RogueAPDetectionScopeForm from './RogueAPDetectionScopeForm'

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}


describe('RogueAPDetectionScopeForm', () => {
  it('should render RogueAPDetectionScopeForm successfully', async () => {

    render(
      <RogueAPDetectionScopeForm edit={false}/>
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
  })
  it('should render RogueAPDetectionScopeForm with editMode successfully', async () => {

    render(
      <RogueAPDetectionScopeForm edit={true}/>
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
  })
})
