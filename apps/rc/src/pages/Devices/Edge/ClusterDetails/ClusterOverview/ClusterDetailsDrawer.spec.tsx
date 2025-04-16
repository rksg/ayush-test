import userEvent from '@testing-library/user-event'

import { ClusterHighAvailabilityModeEnum } from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { render, screen }                  from '@acx-ui/test-utils'

import { EdgeClusterDetailsDrawer } from './ClusterDetailsDrawer'

const params = {
  clusterId: '1234567890'
}
describe('EdgeClusterDetailsDrawer', () => {
  const mockSetVisible = jest.fn()
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the correct title', () => {
    render(
      <Provider>
        <EdgeClusterDetailsDrawer
          visible={true}
          setVisible={mockSetVisible}
          currentCluster={{
            venueId: '1',
            venueName: 'Test Venue',
            description: 'Test description',
            edgeList: [],
            clusterStatus: 'ACTIVE',
            highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY,
            firmwareVersion: '1.0.0'
          }}
        />
      </Provider>, { route: { params } }
    )
    expect(screen.getByText('Cluster Details')).toBeInTheDocument()
  })

  it('renders the correct venue link', () => {
    render(
      <Provider>
        <EdgeClusterDetailsDrawer
          visible={true}
          setVisible={mockSetVisible}
          currentCluster={{
            venueId: '1',
            venueName: 'Test Venue',
            description: 'Test description',
            edgeList: [],
            clusterStatus: 'ACTIVE',
            highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY,
            firmwareVersion: '1.0.0'
          }}
        />
      </Provider>, { route: { params } }
    )
    expect(screen.getByText('Test Venue')).toBeInTheDocument()
  })

  it('renders the correct description', () => {
    render(
      <Provider>
        <EdgeClusterDetailsDrawer
          visible={true}
          setVisible={mockSetVisible}
          currentCluster={{
            venueId: '1',
            venueName: 'Test Venue',
            description: 'Test description',
            edgeList: [],
            clusterStatus: 'ACTIVE',
            highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY,
            firmwareVersion: '1.0.0'
          }}
        />
      </Provider>, { route: { params } }
    )
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('handles empty state gracefully', () => {
    render(<Provider>
      <EdgeClusterDetailsDrawer
        visible={true}
        setVisible={mockSetVisible}
        currentCluster={undefined}
      />
    </Provider>, { route: { params } })

    expect(screen.getByText('Cluster Details')).toBeInTheDocument()
    expect(screen.queryByText('Test Venue')).not.toBeInTheDocument()
  })

  it('calls setVisible when the drawer is closed', async () => {
    render(
      <Provider>
        <EdgeClusterDetailsDrawer
          visible={true}
          setVisible={mockSetVisible}
          currentCluster={{
            venueId: '1',
            venueName: 'Test Venue',
            description: 'Test description',
            edgeList: [],
            clusterStatus: 'ACTIVE',
            highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY,
            firmwareVersion: '1.0.0'
          }}
        />
      </Provider>, { route: { params } }
    )

    await userEvent.click(screen.getByLabelText('Close'))
    expect(mockSetVisible).toHaveBeenCalledWith(false)
  })
})