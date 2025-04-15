
import { ClusterHighAvailabilityModeEnum } from '@acx-ui/rc/utils'
import { render, screen }                  from '@acx-ui/test-utils'

import { EdgeClusterDetailsDrawer } from './ClusterDetailsDrawer'

describe('EdgeClusterDetailsDrawer', () => {
  it('renders the correct title', () => {
    render(
      <EdgeClusterDetailsDrawer
        visible={true}
        setVisible={() => {}}
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
    )
    expect(screen.getByText('Cluster Details')).toBeInTheDocument()
  })

  it('renders the correct venue link', () => {
    render(
      <EdgeClusterDetailsDrawer
        visible={true}
        setVisible={() => {}}
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
    )
    expect(screen.getByText('Test Venue')).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByText('Test Venue')).toHaveAttribute('href', '/venues/1/venue-details/overview')
  })

  it('renders the correct description', () => {
    render(
      <EdgeClusterDetailsDrawer
        visible={true}
        setVisible={() => {}}
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
    )
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })
})