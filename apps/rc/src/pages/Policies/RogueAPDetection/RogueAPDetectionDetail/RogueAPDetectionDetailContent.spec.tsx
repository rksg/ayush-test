import React from 'react'

import { act }  from '@testing-library/react'
import { rest } from 'msw'

import { policyApi }                  from '@acx-ui/rc/services'
import { RogueAPDetectionUrls }       from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import RogueAPDetectionDetailContent from './RogueAPDetectionDetailContent'


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
      name: 'Same Network Rule',
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

describe('RogueVenueTable', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(policyApi.util.resetApiState())
    })
  })

  it('should render RogueVenueTable successfully', async () => {
    mockServer.use(rest.get(
      RogueAPDetectionUrls.getRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(detailContent)
      )
    ))

    render(
      <RogueAPDetectionDetailContent />
      , {
        wrapper: wrapper,
        route: {
          params: { policyId: 'policyId1', tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByRole('heading', {
      name: /classification rules/i
    })

    expect(screen.getByRole('heading', {
      name: /tags/i
    })).toBeTruthy()
    expect(screen.getByText('1')).toBeTruthy()
  })
  it('should render RogueVenueTable failed', async () => {
    mockServer.use(rest.get(
      RogueAPDetectionUrls.getRoguePolicy.url,
      (_, res, ctx) => res(
        ctx.json(detailContent)
      )
    ))

    render(
      <RogueAPDetectionDetailContent />
      , {
        wrapper: wrapper,
        route: {
          params: { policyId: 'policyId1-failed', tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getByText(/Detail content Error/i)).toBeTruthy()
  })
})
