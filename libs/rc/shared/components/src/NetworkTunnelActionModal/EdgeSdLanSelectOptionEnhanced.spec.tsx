import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { EdgeSdLanFixtures, EdgeSdLanUrls, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { Provider }                                          from '@acx-ui/store'
import {  render, screen, waitFor, mockServer }              from '@acx-ui/test-utils'

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
type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown, disabled: boolean }>
  loading?: boolean
  dropdownClassName?: string
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  // eslint-disable-next-line max-len
  const Select = ({ loading, children, onChange, options, dropdownClassName, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {options?.map((option, index) => (
        <option key={`option-${index}`}
          value={option.value as string}
          disabled={option.disabled}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

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

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedMvSdLanDataList }))
      )
    )
  })

  it('should render with existing venue SD-LAN', () => {
    renderComponent()

    expect(screen.getByText('Mocked_SDLAN_1')).toBeInTheDocument()
    expect(screen.getByText('Mocked_tunnel-1')).toBeInTheDocument()
    expect(screen.getByText('Tunnel the traffic to a central location')).toBeInTheDocument()
  })

  it('should render help link when venue SD-LAN does not exist', async () => {
    renderComponent({
      ...defaultProps,
      venueId: 'mocked-venue-id'
    })

    const sdLanProfileSelect = screen.getByRole('combobox', { name: 'SD-LAN Profile' })
    expect(sdLanProfileSelect).toBeInTheDocument()
    await userEvent.selectOptions(sdLanProfileSelect, mockedMvSdLanDataList[1].name!)

    const fwdDestinationSelect = screen.getByRole('combobox', { name: 'Forwarding Destination' })
    expect(fwdDestinationSelect).toBeInTheDocument()
    await userEvent.selectOptions(fwdDestinationSelect, 'Tunnel 2')
    expect(await screen.findByText('See more information')).toBeInTheDocument()
  })

  it('should filter out VXLAN-GPE options for non-CAPTIVEPORTAL networks', async () => {
    renderComponent({
      ...defaultProps,
      venueId: 'mocked-venue-id',
      networkType: NetworkTypeEnum.DPSK
    })

    const sdLanProfileSelect = screen.getByRole('combobox', { name: 'SD-LAN Profile' })
    expect(sdLanProfileSelect).toBeInTheDocument()
    await userEvent.selectOptions(sdLanProfileSelect, mockedMvSdLanDataList[0].name!)

    const fwdDestinationSelect = screen.getByRole('combobox', { name: 'Forwarding Destination' })
    expect(fwdDestinationSelect).toBeInTheDocument()
    await userEvent.click(fwdDestinationSelect)

    // Should only see GRE option and Core Port
    expect(screen.getByText('Tunnel 3')).toBeInTheDocument()
    expect(screen.queryByText('Tunnel 2')).not.toBeInTheDocument()
  })

  it('should has VXLAN-GPE options for CAPTIVEPORTAL networks', async () => {
    renderComponent({
      ...defaultProps,
      networkType: NetworkTypeEnum.CAPTIVEPORTAL
    })

    const sdLanProfileSelect = screen.getByRole('combobox', { name: 'SD-LAN Profile' })
    expect(sdLanProfileSelect).toBeInTheDocument()
    await userEvent.selectOptions(sdLanProfileSelect, mockedMvSdLanDataList[0].name!)

    const fwdDestinationSelect = screen.getByRole('combobox', { name: 'Forwarding Destination' })
    expect(fwdDestinationSelect).toBeInTheDocument()
    await userEvent.click(fwdDestinationSelect)

    expect(screen.getByText('Tunnel 2')).toBeInTheDocument()
  })

  it('should filter out L2GRE options when firmware version is lower than required', async () => {
    const originalMock =jest.requireMock('@acx-ui/rc/services').useGetEdgeClusterListQuery
    jest.requireMock('@acx-ui/rc/services').useGetEdgeClusterListQuery = jest.fn(() => ({
      associatedEdgeClusters: [{
        clusterId: mockedMvSdLanDataList[0].edgeClusterId,
        hasCorePort: true,
        edgeList: [{
          serialNumber: 'edgeId1',
          firmwareVersion: '2.3.0'
        }]
      },{
        clusterId: 'edgeClusterId2',
        hasCorePort: false
      }],
      isEdgeClustersLoading: false
    }))

    renderComponent({
      ...defaultProps,
      networkType: NetworkTypeEnum.CAPTIVEPORTAL
    })

    const sdLanProfileSelect = screen.getByRole('combobox', { name: 'SD-LAN Profile' })
    expect(sdLanProfileSelect).toBeInTheDocument()
    await userEvent.selectOptions(sdLanProfileSelect, mockedMvSdLanDataList[0].name!)

    const fwdDestinationSelect = screen.getByRole('combobox', { name: 'Forwarding Destination' })
    expect(fwdDestinationSelect).toBeInTheDocument()
    await userEvent.click(fwdDestinationSelect)

    expect(screen.getByText(mockedMvSdLanDataList[0].tunnelProfileName!)).toBeInTheDocument()
    expect(screen.getByText('Tunnel 2')).toBeInTheDocument()
    expect(screen.queryByText('Tunnel 3')).not.toBeInTheDocument()
    jest.requireMock('@acx-ui/rc/services').useGetEdgeClusterListQuery = originalMock
  })

  it('should display error message when selecting tunnel option without Core Port', async () => {
    renderComponent({
      ...defaultProps,
      networkType: NetworkTypeEnum.CAPTIVEPORTAL
    })
    const sdLanProfileSelect = screen.getByRole('combobox', { name: 'SD-LAN Profile' })
    expect(sdLanProfileSelect).toBeInTheDocument()
    await userEvent.selectOptions(sdLanProfileSelect, mockedMvSdLanDataList[0].name!)

    const fwdDestinationSelect = screen.getByRole('combobox', { name: 'Forwarding Destination' })
    expect(fwdDestinationSelect).toBeInTheDocument()
    await userEvent.selectOptions(fwdDestinationSelect, 'Tunnel 2')

    await waitFor(() => {
      expect(screen.getByText(/To use the SD-LAN service/i)).toBeInTheDocument()
    })
  })

})