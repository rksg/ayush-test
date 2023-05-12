import React from 'react'

import { RogueAPDetectionScopeForm } from '@acx-ui/rc/components'
import { Provider }                  from '@acx-ui/store'
import { render, screen }            from '@acx-ui/test-utils'


const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}


describe('RogueAPDetectionScopeForm', () => {
  it('should render RogueAPDetectionScopeForm successfully', async () => {

    render(
      <RogueAPDetectionScopeForm />
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
      <RogueAPDetectionScopeForm />
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
