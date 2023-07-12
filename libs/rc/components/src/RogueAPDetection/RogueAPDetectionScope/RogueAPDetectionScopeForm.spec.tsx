import React from 'react'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { RogueAPDetectionScopeForm } from './RogueAPDetectionScopeForm'

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

jest.mock('./RogueVenueTable', () => ({
  ...jest.requireActual('./RogueVenueTable'),
  RogueVenueTable: () => <div data-testid='RogueVenueTable' />
}))

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

    expect(await screen.findByTestId('RogueVenueTable')).toBeVisible()

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

    expect(await screen.findByTestId('RogueVenueTable')).toBeVisible()
  })
})
