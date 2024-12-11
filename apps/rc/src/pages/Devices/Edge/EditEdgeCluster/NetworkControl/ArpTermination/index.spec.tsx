
import { StepsForm } from '@acx-ui/components'
import {
  EdgeStatus
} from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ArpTerminationFormItem } from '.'

jest.mock('@acx-ui/rc/services', () => ({
  useGetEdgeFeatureSetsQuery: jest.fn(() => ({
    data: {
      featureSets: [{
        featureName: 'ARP_TERMINATION',
        requiredFw: '2.3.0'
      }]
    }
  })),
  useGetEdgeClusterArpTerminationSettingsQuery: jest.fn(() => ({
    data: {
      enabled: true,
      agingTimerEnabled: true,
      agingTimeSec: 600
    }
  }))
}))

describe('Edge Cluster Network Control Tab > ARP Termination', () => {
  const mockVenueId = 'mock_venue_1'
  const mockClusterId= 'mock_cluster_2'
  let params: { tenantId: string, clusterId: string, activeTab?: string } = {
    tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
    clusterId: mockClusterId,
    activeTab: 'networkControl'
  }

  it('renders correctly when isArpControllable is true', () => {
    const props = {
      currentClusterStatus: {
        clusterId: mockClusterId,
        venueId: mockVenueId,
        edgeList: [{ firmwareVersion: '2.3.0' }] as EdgeStatus[]
      },
      setEdgeFeatureName: jest.fn()
    }

    render(<Provider>
      <StepsForm>
        <StepsForm.StepForm>
          <ArpTerminationFormItem
            currentClusterStatus={props.currentClusterStatus}
            setEdgeFeatureName={jest.fn()}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
      }
    })

    expect(screen.getByText('ARP Termination')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'ARP Termination' })).toBeChecked()
    expect(screen.getByText('ARP Termination Aging Timer')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'ARP Termination Aging Timer' })).toBeChecked()
    expect(screen.getByRole('spinbutton')).toHaveValue('600')
  })

  it('renders correctly when isArpControllable is false', () => {
    const props = {
      currentClusterStatus: {
        clusterId: mockClusterId,
        venueId: mockVenueId,
        edgeList: [
          { firmwareVersion: '2.3.0' },
          { firmwareVersion: '2.2.0' }
        ] as EdgeStatus[]
      },
      setEdgeFeatureName: jest.fn()
    }

    render(<Provider>
      <StepsForm>
        <StepsForm.StepForm>
          <ArpTerminationFormItem
            currentClusterStatus={props.currentClusterStatus}
            setEdgeFeatureName={jest.fn()}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
      }
    })

    expect(screen.getByText('ARP Termination')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'ARP Termination' })).toBeDisabled()
  })

})