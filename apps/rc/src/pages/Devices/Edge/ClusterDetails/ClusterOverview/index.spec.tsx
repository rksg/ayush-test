import * as services      from '@acx-ui/rc/services'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { EdgeClusterDetailsDataContext } from '../EdgeClusterDetailsDataProvider'

import { EdgeClusterOverview } from './index'

// Mock the components used
jest.mock('./EdgeClusterInfoWidget', () => ({
  EdgeClusterInfoWidget: () => <div data-testid='cluster-info-widget'>EdgeClusterInfoWidget</div>
}))

jest.mock('./MonitorTab', () => ({
  MonitorTab: () => <div data-testid='monitor-tab'>MonitorTab</div>
}))

jest.mock('./PortsTab', () => ({
  PortsTab: () => <div data-testid='ports-tab'>PortsTab</div>
}))

jest.mock('./LagsTab', () => ({
  LagsTab: () => <div data-testid='lags-tab'>LagsTab</div>
}))

jest.mock('@acx-ui/rc/services', () => ({
  useGetEdgeLagsStatusListQuery: jest.fn(),
  useGetEdgePortsStatusListQuery: jest.fn()
}))

// jest.mock('react-router-dom', () => ({
//   useParams: jest.fn(() => ({ activeSubTab: null }))
// }))

const params = {
  clusterId: 'test-cluster-id'
}

describe('EdgeClusterOverview', () => {
  beforeEach(() => {
    jest.spyOn(services, 'useGetEdgeLagsStatusListQuery').mockReturnValue({
      lagStatusList: [],
      isLagListLoading: false
    })
    jest.spyOn(services, 'useGetEdgePortsStatusListQuery').mockReturnValue({
      portStatusList: [],
      isPortListLoading: false
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders tabs with correct labels', () => {
    const mockClusterInfo = {
      edgeList: [],
      clusterStatus: 'ACTIVE'
    }

    render(<Provider>
      <EdgeClusterDetailsDataContext.Provider
        value={{ clusterInfo: mockClusterInfo, isClusterLoading: false }}
      >
        <EdgeClusterOverview />
      </EdgeClusterDetailsDataContext.Provider>
    </Provider>, { route: { params } }
    )

    expect(screen.getByText('Monitor')).toBeInTheDocument()
    expect(screen.getByText('Ports')).toBeInTheDocument()
    expect(screen.getByText('LAGs')).toBeInTheDocument()
  })

  it('renders EdgeClusterInfoWidget with correct props', () => {
    const mockClusterInfo = {
      edgeList: [],
      clusterStatus: 'ACTIVE'
    }

    render(<Provider>
      <EdgeClusterDetailsDataContext.Provider
        value={{ clusterInfo: mockClusterInfo, isClusterLoading: false }}
      >
        <EdgeClusterOverview />
      </EdgeClusterDetailsDataContext.Provider>
    </Provider>, { route: { params } }
    )

    expect(screen.getByTestId('cluster-info-widget')).toBeInTheDocument()
  })
})
