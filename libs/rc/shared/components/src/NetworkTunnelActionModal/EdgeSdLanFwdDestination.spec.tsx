import userEvent              from '@testing-library/user-event'
import { Form, FormInstance } from 'antd'
import { cloneDeep }          from 'lodash'

import { EdgeSdLanFixtures, NetworkTypeEnum, TunnelTypeEnum }      from '@acx-ui/rc/utils'
import { MockSelect, MockSelectProps, render, renderHook, screen } from '@acx-ui/test-utils'


import { EdgeSdLanFwdDestination, EdgeSdLanFwdDestinationProps } from './EdgeSdLanFwdDestination'

const mockedMvSdLanDataList = cloneDeep(EdgeSdLanFixtures.mockedMvSdLanDataList)
const mockedEdgeClusterList = [{
  clusterId: 'edgeClusterId1',
  hasCorePort: true,
  edgeList: [{
    serialNumber: 'edgeId1',
    firmwareVersion: '2.4.0'
  }]
},{
  clusterId: 'edgeClusterId2',
  hasCorePort: false
},{
  clusterId: 'edgeClusterId3',
  hasCorePort: true,
  edgeList: [{
    serialNumber: 'edgeId3',
    firmwareVersion: '2.4.0'
  }]
}]
mockedMvSdLanDataList[0].edgeClusterId = mockedEdgeClusterList[0].clusterId

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Select: (props: MockSelectProps) => <MockSelect {...props}/>
}))

jest.mock('@acx-ui/edge/components', () => ({
  useGetAvailableTunnelProfile: jest.fn(() => ({
    isDataLoading: false,
    availableTunnelProfiles: [
      { id: 'tunnel1', name: 'Tunnel 1', tunnelType: 'VXLAN_GPE',
        destinationEdgeClusterId: 'edgeClusterId1', type: 'VLAN_VXLAN', mtuType: 'MANUAL',
        natTraversalEnabled: false },
      { id: 'tunnel2', name: 'Tunnel 2', tunnelType: 'VXLAN_GPE' ,
        destinationEdgeClusterId: 'edgeClusterId2', type: 'VLAN_VXLAN', mtuType: 'MANUAL',
        natTraversalEnabled: false },
      { id: 'tunnel3', name: 'Tunnel 3', tunnelType: 'L2GRE' ,
        destinationEdgeClusterId: 'edgeClusterId3', type: 'VLAN_VXLAN',
        destinationIpAddress: '10.206.11.11'
      }
    ]
  })),
  transToOptions: jest.fn((profiles) =>
    profiles.map((p: { name: string; id: string }) => ({ label: p.name, value: p.id }))
  )
}))

jest.mock('@acx-ui/rc/services', () => ({
  useGetEdgeClusterListQuery: jest.fn(() => ({
    associatedEdgeClusters: mockedEdgeClusterList,
    isEdgeClustersLoading: false
  }))
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useHelpPageLink: jest.fn(() => '/help-page')
}))

const params = {
  tenantId: 'tenant1',
  venueId: 'venue1'
}

describe('EdgeSdLanFwdDestination', () => {
  const defaultProps = {
    networkType: NetworkTypeEnum.CAPTIVEPORTAL,
    hasVlanPool: false,
    venueSdLan: mockedMvSdLanDataList[0],
    requiredFw: '2.4.0'
  } as EdgeSdLanFwdDestinationProps

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderComponent = (props = defaultProps, formRef?: FormInstance<any>) => {
    return render(<Form form={formRef}>
      <EdgeSdLanFwdDestination {...props} />
    </Form>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })
  }

  it('renders correctly with default props', () => {
    renderComponent()
    expect(screen.getByText('Forwarding Destination')).toBeInTheDocument()
  })

  it('renders correctly with a venueSdLan is undefined', () => {
    renderComponent({
      ...defaultProps,
      sdLanData: undefined
    })
    expect(screen.getByText('Forwarding Destination')).toBeInTheDocument()
    screen.getAllByRole('option')
  })

  it('renders correctly with a hasVlanPool prop', async () => {
    renderComponent({
      ...defaultProps,
      hasVlanPool: true
    })

    screen.getByRole('combobox', { name: 'Forwarding Destination' })
    const options = screen.getAllByRole('option')
    const target = options.filter(o => o.textContent === 'Tunnel 2')[0]
    expect(target).toBeDisabled()
    expect(target).toHaveAttribute('title', 'Cannot tunnel vlan pooling network to DMZ cluster.')
  })

  it('should filter out VXLAN-GPE options for non-CAPTIVEPORTAL networks', async () => {
    renderComponent({
      ...defaultProps,
      networkType: NetworkTypeEnum.DPSK
    })
    const selector = screen.getByRole('combobox', { name: 'Forwarding Destination' })
    expect(selector).toBeInTheDocument()
    await userEvent.click(selector)

    // Should only see GRE option and Core Port
    expect(screen.getByRole('option', { name: 'Core Port' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Tunnel 3' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Tunnel 2' })).toBeNull()
    expect(screen.queryByRole('option', { name: 'Tunnel 1' })).toBeNull()
  })

  it('should has VXLAN-GPE options for CAPTIVEPORTAL networks', async () => {
    renderComponent(defaultProps)

    const selector = screen.getByRole('combobox', { name: 'Forwarding Destination' })
    expect(selector).toBeInTheDocument()
    await userEvent.click(selector)

    expect(screen.getByRole('option', { name: 'Core Port' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Tunnel 1' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Tunnel 2' })).toBeInTheDocument()
  })

  it('should filter out L2GRE options when firmware version is lower than required', async () => {
    const originalMock =jest.requireMock('@acx-ui/rc/services').useGetEdgeClusterListQuery
    const mockClusters = cloneDeep(mockedEdgeClusterList)
    mockClusters[2].edgeList![0].firmwareVersion = '2.1.1'
    const mockSdLan = cloneDeep(mockedMvSdLanDataList[0])
    mockSdLan.edgeClusterId = mockClusters[2].clusterId

    jest.requireMock('@acx-ui/rc/services').useGetEdgeClusterListQuery = jest.fn(() => ({
      associatedEdgeClusters: mockClusters,
      isEdgeClustersLoading: false
    }))

    renderComponent({
      ...defaultProps,
      sdLanData: mockSdLan
    })

    const selector = screen.getByRole('combobox', { name: 'Forwarding Destination' })
    expect(selector).toBeInTheDocument()
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)

    await userEvent.click(selector)
    expect(screen.getByText('Core Port')).toBeInTheDocument()
    expect(screen.getByText('Tunnel 1')).toBeInTheDocument()
    expect(screen.getByText('Tunnel 2')).toBeInTheDocument()
    expect(screen.queryByText('Tunnel 3')).toBeNull()
    jest.requireMock('@acx-ui/rc/services').useGetEdgeClusterListQuery = originalMock
  })

  it('should filter out L2GRE options when required firmware version is undefined', async () => {
    renderComponent({
      ...defaultProps,
      requiredFw: undefined
    })
    const selector = screen.getByRole('combobox', { name: 'Forwarding Destination' })
    expect(selector).toBeInTheDocument()
    await userEvent.click(selector)
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)

    expect(screen.getByText('Core Port')).toBeInTheDocument()
    expect(screen.getByText('Tunnel 1')).toBeInTheDocument()
    expect(screen.getByText('Tunnel 2')).toBeInTheDocument()
    expect(screen.queryByText('Tunnel 3')).toBeNull()
  })

  it('renders correctly with a disabled prop', () => {
    renderComponent({
      ...defaultProps,
      disabled: true
    })
    const selector = screen.getByRole('combobox', { name: 'Forwarding Destination' })
    expect(selector).toBeDisabled()
  })

  it('should show core port not existed warning correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    jest.spyOn(formRef.current, 'setFieldValue')

    renderComponent(defaultProps, formRef.current)
    const selector = screen.getByRole('combobox', { name: 'Forwarding Destination' })
    await userEvent.selectOptions(selector, 'Tunnel 2')
    await screen.findByText('Tunnel 2')
    // eslint-disable-next-line max-len
    expect(formRef.current.setFieldValue).toBeCalledWith(['sdLan', 'forwardingTunnelType'], TunnelTypeEnum.VXLAN_GPE)
    expect(await screen.findByText(/must set up a Core port or Core LAG/)).toBeInTheDocument()
  })

  it('onChangeTunnel updates the form field correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    jest.spyOn(formRef.current, 'setFieldValue')

    renderComponent(defaultProps, formRef.current)
    const selector = screen.getByRole('combobox', { name: 'Forwarding Destination' })
    await userEvent.selectOptions(selector, 'tunnel1')
    await screen.findByText('Tunnel 1')
    // eslint-disable-next-line max-len
    expect(formRef.current.setFieldValue).toBeCalledWith(['sdLan', 'forwardingTunnelType'], TunnelTypeEnum.VXLAN_GPE)
  })
})