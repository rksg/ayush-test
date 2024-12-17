import { rest } from 'msw'

import { StepsForm }   from '@acx-ui/components'
import { firmwareApi } from '@acx-ui/rc/services'
import {
  EdgeGeneralFixtures,
  FirmwareUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'


import { ArpTerminationFormItem } from '.'

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
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

const { mockedVenueFirmwareList } = EdgeGeneralFixtures

describe('Edge Cluster Network Control Tab > ARP Termination', () => {
  let params: { tenantId: string, clusterId: string, activeTab: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: 'testClusterId',
      activeTab: 'networkControl'
    }
    store.dispatch(firmwareApi.util.resetApiState())
    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getVenueEdgeFirmwareList.url,
        (req, res, ctx) => res(ctx.json(mockedVenueFirmwareList))
      )
    )
  })

  it('renders correctly when isArpControllable is true', () => {
    const mockVenueId = 'mock_venue_3'
    const mockClusterId= params.clusterId
    const props = {
      currentClusterStatus: {
        clusterId: mockClusterId,
        venueId: mockVenueId
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
    const mockVenueId = 'mock_venue_2'
    const mockClusterId= params.clusterId
    const props = {
      currentClusterStatus: {
        clusterId: mockClusterId,
        venueId: mockVenueId
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