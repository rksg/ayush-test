/* eslint-disable max-len */
import { Provider  } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import  EdgeClusterDetailsTabs from './ClusterDetailsTabs'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge Cluster Details Tabs', () => {
  const params: { tenantId: string, clusterId: string } =
  { tenantId: 'mock-tenant-id', clusterId: 'mock-cluster-id' }

  it('should render correctly', async () => {
    render(<Provider>
      <EdgeClusterDetailsTabs
        isOperational={true} />
    </Provider>, { route: { params } })

    expect(await screen.findByText('Overview')).toBeVisible()
    expect(await screen.findByRole('tab', { name: 'Overview' })).toBeVisible()
  })
})