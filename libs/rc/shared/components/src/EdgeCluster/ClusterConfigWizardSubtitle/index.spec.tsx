import { render, screen } from '@testing-library/react'
import { IntlProvider }   from 'react-intl'

import { EdgeClusterStatus } from '@acx-ui/rc/utils'

import { ClusterConfigWizardSubtitle } from './'

describe('ClusterConfigWizardSubtitle', () => {
  const renderComponent = (clusterInfo: EdgeClusterStatus | undefined) => {
    return render(
      <IntlProvider locale='en'>
        <ClusterConfigWizardSubtitle clusterInfo={clusterInfo} />
      </IntlProvider>
    )
  }

  it('should render AA cluster subtitle correctly', () => {
    const clusterInfo = {
      name: 'Test Cluster',
      highAvailabilityMode: 'ACTIVE_ACTIVE'
    } as EdgeClusterStatus

    renderComponent(clusterInfo)

    expect(screen.getByText('Cluster:')).toBeInTheDocument()
    expect(screen.getByText('Test Cluster (Active-Active HA mode)')).toBeInTheDocument()
  })

  it('should render AB cluster subtitle correctly', () => {
    const clusterInfo = {
      name: 'Test Cluster',
      highAvailabilityMode: 'ACTIVE_STANDBY'
    } as EdgeClusterStatus

    renderComponent(clusterInfo)

    expect(screen.getByText('Cluster:')).toBeInTheDocument()
    expect(screen.getByText('Test Cluster (Active-Standby HA mode)')).toBeInTheDocument()
  })
})