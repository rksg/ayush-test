import React from 'react'

import { act } from '@testing-library/react'

import { policyApi }       from '@acx-ui/rc/services'
import { Provider, store } from '@acx-ui/store'
import { render, screen }  from '@acx-ui/test-utils'

import RogueAPDetectionDetailView from './RogueAPDetectionDetailView'

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

describe('RogueAPDetectionDetailView', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(policyApi.util.resetApiState())
    })
  })

  it('should render RogueAPDetectionDetailView successfully', async () => {
    render(
      <RogueAPDetectionDetailView />
      , {
        wrapper: wrapper,
        route: {
          params: { policyId: 'policyId1', tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getByText(/venue name/i)).toBeTruthy()
  })
})
