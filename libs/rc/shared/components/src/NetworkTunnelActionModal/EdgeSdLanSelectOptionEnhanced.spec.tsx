import { Form } from 'antd'
import { rest } from 'msw'

import { EdgeSdLanFixtures, EdgeSdLanUrls, NetworkTypeEnum }                 from '@acx-ui/rc/utils'
import { Provider }                                                          from '@acx-ui/store'
import {  render, screen, waitFor, mockServer, MockSelect, MockSelectProps } from '@acx-ui/test-utils'

import { EdgeSdLanSelectOptionEnhanced } from './EdgeSdLanSelectOptionEnhanced'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures

// Mock all required dependencies
jest.mock('@acx-ui/edge/components', () => ({
  useGetAvailableTunnelProfile: jest.fn(() => ({
    isDataLoading: false,
    availableTunnelProfiles: [
      // eslint-disable-next-line max-len
      { id: mockedMvSdLanDataList[0].tunnelProfileId!, name: mockedMvSdLanDataList[0].tunnelProfileName!, tunnelType: 'VXLAN_GPE',
        destinationEdgeClusterId: 'edgeClusterId1', type: 'VLAN_VXLAN', mtuType: 'MANUAL',
        natTraversalEnabled: false },
      { id: 'tunnel2', name: 'Tunnel 2', tunnelType: 'VXLAN_GPE' ,
        destinationEdgeClusterId: 'edgeClusterId2', type: 'VLAN_VXLAN', mtuType: 'MANUAL',
        natTraversalEnabled: false },
      { id: 'tunnel3', name: 'Tunnel 3', tunnelType: 'L2GRE' ,
        destinationIpAddress: '10.206.11.11', type: 'VLAN_VXLAN' }
    ]
  })),
  transToOptions: jest.fn((profiles) =>
    profiles.map((p: { name: string; id: string }) => ({ label: p.name, value: p.id }))
  )
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetEdgeFeatureSetsQuery: jest.fn(() => ({
    requiredFw: '2.4.0',
    isFeatureSetsLoading: false
  })),
  useGetEdgeClusterListQuery: jest.fn(() => ({
    associatedEdgeClusters: [{
      clusterId: 'edgeClusterId1',
      hasCorePort: true,
      edgeList: [{
        serialNumber: 'edgeId1',
        firmwareVersion: '2.4.0'
      }]
    },{
      clusterId: 'edgeClusterId2',
      hasCorePort: false
    }],
    isEdgeClustersLoading: false
  }))
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  getServiceDetailsLink: jest.fn(() => '/service-details'),
  getPolicyDetailsLink: jest.fn(() => '/policy-details'),
  getServiceRoutePath: jest.fn(() => '/service-path'),
  useHelpPageLink: jest.fn(() => '/help-page')
}))

jest.mock('./EdgeSdLanFwdDestination', () => ({
  EdgeSdLanFwdDestination: jest.fn().mockImplementation(() =>
    <div data-testid='EdgeSdLanFwdDestination'></div>)
}))

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Select: (props: MockSelectProps) => <MockSelect {...props}/>
}))

const params = {
  tenantId: 'tenant1',
  venueId: 'venue1'
}

describe('EdgeSdLanSelectOption by drawer', () => {
  const sdLanVenueId = mockedMvSdLanDataList[0].venueId!
  const defaultProps = {
    venueId: sdLanVenueId,
    networkType: NetworkTypeEnum.CAPTIVEPORTAL,
    hasVlanPool: false
  }

  const renderComponent = (props = defaultProps) => {
    return render(<Provider>
      <Form>
        <EdgeSdLanSelectOptionEnhanced {...props} />
      </Form>
    </Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })
  }

  const mockSdLanFn = jest.fn()
  beforeEach(() => {
    mockSdLanFn.mockClear()

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => {
          mockSdLanFn()
          return res(ctx.json({ data: mockedMvSdLanDataList }))
        }
      )
    )
  })

  it('should render with existing venue SD-LAN', async () => {
    renderComponent()

    expect(screen.getByText('Mocked_SDLAN_1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
    screen.getByText('Destination Cluster')
    expect(screen.getByText('SE_Cluster 0')).toBeInTheDocument()
    expect(screen.getByText('Mocked_tunnel-1')).toBeInTheDocument()
    screen.getByTestId('EdgeSdLanFwdDestination')
  })

  it('should render when venue does not associate with any SD-LAN', async () => {
    renderComponent({
      ...defaultProps,
      venueId: 'mocked-venue-id'
    })

    await checkLoaded()
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
    expect(screen.getByText('No SD-LAN set for this venue yet')).toBeInTheDocument()
  })

  const checkLoaded = async () => {
    await waitFor(() => expect(mockSdLanFn).toBeCalled())
  }
})