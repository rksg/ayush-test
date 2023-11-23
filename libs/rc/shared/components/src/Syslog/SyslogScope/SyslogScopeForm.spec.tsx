import React from 'react'

import { rest } from 'msw'

import { CommonUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import SyslogScopeForm from './SyslogScopeForm'

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}
const mockVenueData = {
  fields: ['name', 'id'],
  totalCount: 3,
  page: 1,
  data: [
    { id: 'mock_venue_1', name: 'Mock Venue 1' },
    { id: 'mock_venue_2', name: 'Mock Venue 2' },
    { id: 'mock_venue_3', name: 'Mock Venue 3' }
  ]
}

describe('SyslogScopeForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      )
    )
  })

  it('should render SyslogScopeForm successfully', async () => {

    render(
      <SyslogScopeForm/>
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
      <SyslogScopeForm/>
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
