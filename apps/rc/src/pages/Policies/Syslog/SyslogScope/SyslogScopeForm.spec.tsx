import React from 'react'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import SyslogScopeForm from './SyslogScopeForm'

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}


describe('SyslogScopeForm', () => {
  it('should render SyslogScopeForm successfully', async () => {

    render(
      <SyslogScopeForm edit={false}/>
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
  it('should render SyslogScopeForm with editMode successfully', async () => {

    render(
      <SyslogScopeForm edit={true}/>
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
