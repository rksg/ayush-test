import { render, screen, waitFor } from '@testing-library/react'
import userEvent                   from '@testing-library/user-event'
import { Form }                    from 'antd'
import { MemoryRouter }            from 'react-router-dom'

import { EdgeMvSdLanViewData, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { EdgeSdLanSelectOptionL2greContent } from './EdgeSdLanSelectOptionL2greContent'

// Mock all required dependencies
jest.mock('@acx-ui/edge/components', () => ({
  useGetAvailableTunnelProfile: jest.fn(() => ({
    isDataLoading: false,
    availableTunnelProfiles: [
      { id: 'tunnel1', name: 'Tunnel 1', tunnelType: 'VXLAN_GPE',
        destinationEdgeClusterId: 'edgeClusterId1' },
      { id: 'tunnel2', name: 'Tunnel 2', tunnelType: 'VXLAN_GPE' ,
        destinationEdgeClusterId: 'edgeClusterId2' },
      { id: 'tunnel3', name: 'Tunnel 3', tunnelType: 'L2GRE' ,
        destinationIpAddress: '10.206.11.11' }
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

jest.mock('react-intl', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })

  return {
    ...reactIntl,
    useIntl: () => intl
  }
})

describe('EdgeSdLanSelectOptionL2greContent', () => {
  const defaultProps = {
    venueSdLan: {
      id: 'sdlan1',
      name: 'Test Sdlan',
      edgeClusterId: 'edgeClusterId1',
      tunnelProfileId: 'profile1',
      tunnelProfileName: 'Test Profile',
      tunneledWlans: []
    } as EdgeMvSdLanViewData | undefined,
    networkType: NetworkTypeEnum.CAPTIVEPORTAL,
    hasVlanPool: false
  }

  const renderComponent = (props = defaultProps) => {
    return render(
      <MemoryRouter>
        <Form>
          <EdgeSdLanSelectOptionL2greContent {...props} />
        </Form>
      </MemoryRouter>
    )
  }

  it('should render with existing venue SD-LAN', () => {
    renderComponent()

    expect(screen.getByText('Test Sdlan')).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByText('Test Profile')).toBeInTheDocument()
    expect(screen.getByText('Tunnel the traffic to a central location')).toBeInTheDocument()
  })

  it('should render help link when venue SD-LAN does not exist', () => {
    renderComponent({
      ...defaultProps,
      venueSdLan: undefined
    })

    expect(screen.getByText('See more information')).toBeInTheDocument()
  })

  it('should filter out VXLAN-GPE options for non-CAPTIVEPORTAL networks', async () => {
    renderComponent({
      ...defaultProps,
      networkType: NetworkTypeEnum.DPSK
    })

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    await userEvent.click(select)
    // Should only see GRE option and Core Port
    expect(screen.getByText('Tunnel 3')).toBeInTheDocument()
    expect(screen.queryByText('Tunnel 2')).not.toBeInTheDocument()
  })

  it('should has VXLAN-GPE options for CAPTIVEPORTAL networks', async () => {
    renderComponent({
      ...defaultProps,
      networkType: NetworkTypeEnum.CAPTIVEPORTAL
    })

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    await userEvent.click(select)
    expect(screen.getByText('Tunnel 1')).toBeInTheDocument()
    expect(screen.getByText('Tunnel 2')).toBeInTheDocument()
  })

  it('should filter out L2GRE options when firmware version is lower than required', async () => {
    const originalMock =jest.requireMock('@acx-ui/rc/services').useGetEdgeClusterListQuery
    jest.requireMock('@acx-ui/rc/services').useGetEdgeClusterListQuery = jest.fn(() => ({
      associatedEdgeClusters: [{
        clusterId: 'edgeClusterId1',
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

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    await userEvent.click(select)

    expect(screen.getByText('Tunnel 1')).toBeInTheDocument()
    expect(screen.getByText('Tunnel 2')).toBeInTheDocument()
    expect(screen.queryByText('Tunnel 3')).not.toBeInTheDocument()
    jest.requireMock('@acx-ui/rc/services').useGetEdgeClusterListQuery = originalMock
  })

  it('should display error message when selecting tunnel option without Core Port', async () => {
    renderComponent({
      ...defaultProps,
      networkType: NetworkTypeEnum.CAPTIVEPORTAL
    })

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    await userEvent.click(select)

    const tunnel2Option = screen.getByText('Tunnel 2')
    expect(tunnel2Option).toBeInTheDocument()
    await userEvent.click(tunnel2Option)

    await waitFor(() => {
      expect(screen.getByText(/To use the SD-LAN service/i)).toBeInTheDocument()
    })
  })

})