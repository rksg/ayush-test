import React from 'react'

import { rest } from 'msw'

import { edgeApi }                                               from '@acx-ui/rc/services'
import { EdgeGeneralFixtures, EdgeUrlsInfo }                     from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import EdgeClusterDetails from './'

const { mockEdgeClusterList } = EdgeGeneralFixtures

jest.mock('./ClusterOverview', () => ({
  EdgeClusterOverview: () => <div data-testid='EdgeClusterOverview' />
}))
jest.mock('./PageHeader', () => ({
  EdgeClusterDetailsPageHeader: () => <div data-testid='EdgeClusterDetailsPageHeader' />
}))

describe('EdgeClusterDetails', () => {
  const params = {
    tenantId: 'mock-tenant-id',
    clusterId: 'test-cluster-id',
    activeTab: 'overview'
  }

  beforeEach(() => {
    store.dispatch(edgeApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => {
          return res(ctx.json(mockEdgeClusterList))
        }
      )
    )
  })

  it('renders with valid activeTab and clusterId', async () => {
    render(<Provider>
      <EdgeClusterDetails />
    </Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByTestId('EdgeClusterDetailsPageHeader')).toBeInTheDocument()
    expect(screen.getByTestId('EdgeClusterOverview')).toBeInTheDocument()
  })
})