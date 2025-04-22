/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

import {  EdgeGeneralFixtures } from '@acx-ui/rc/utils'
import { Provider }             from '@acx-ui/store'
import {
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { EdgeClusterDetailsDataContext } from '../EdgeClusterDetailsDataProvider'

import { EdgeClusterDetailsPageHeader } from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const mockEdgeCluster = mockEdgeClusterList.data[0]

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true)
}))

describe('Edge Cluster Detail Page Header', () => {
  const params: { tenantId: string, clusterId: string } =
  { tenantId: 'mock-tenant-id', clusterId: 'mock-cluster-id' }

  beforeEach(() => {
    mockedUsedNavigate.mockClear()
  })

  it('should redirect to edge cluster setting page after clicked configure', async () => {
    render(
      <Provider>
        <EdgeClusterDetailsDataContext.Provider
          value={{
            clusterInfo: mockEdgeCluster,
            isClusterLoading: false
          }}
        >
          <EdgeClusterDetailsPageHeader />
        </EdgeClusterDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    await userEvent.click(screen.getByText('Configure'))
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/t/devices/edge/cluster/${params.clusterId}/edit/cluster-details`,
        hash: '',
        search: ''
      })
    })
  })

})