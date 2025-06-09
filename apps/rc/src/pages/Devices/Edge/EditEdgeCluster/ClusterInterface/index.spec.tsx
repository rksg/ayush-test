/* eslint-disable max-len */

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { EdgeClusterTableDataType, EdgeGeneralFixtures, EdgePortConfigFixtures } from '@acx-ui/rc/utils'
import { Provider }                                                              from '@acx-ui/store'
import { render, renderHook, screen, waitFor }                                   from '@acx-ui/test-utils'

import { ClusterInterface } from '.'

const mockedUpdateApi = jest.fn()
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useClusterInterfaceActions: () => ({
    allInterfaceData: mockClusterInterfaceOptionData,
    isInterfaceDataLoading: false,
    updateClusterInterface: mockedUpdateApi
  })
}))

jest.mock('./EditClusterInterfaceDrawer', () => ({
  EditClusterInterfaceDrawer: () => <div data-testid='edit-cluster-interface-drawer' />
}))
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockClusterInterfaceOptionData } = EdgePortConfigFixtures

describe('Edit Edge Cluster - ClusterInterface', () => {
  let params: { tenantId: string, clusterId: string, activeTab: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: 'testClusterId',
      activeTab: 'cluster-interface'
    }
  })

  it('should render ClusterInterface successfully', async () => {
    render(
      <Provider>
        <ClusterInterface
          currentClusterStatus={mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType}
        />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    expect(screen.getByText('Cluster interface will be used as a communication channel between RUCKUS Edges. Please select the cluster interfaces for all RUCKUS Edges in this cluster:')).toBeVisible()
    expect(await screen.findByRole('row', { name: /Smart Edge 1 Lag0 192.168.11.136 255.255.255.0/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /Smart Edge 2 Lag0 192.168.12.136 255.255.255.0/i })).toBeVisible()
    expect(screen.getByTestId('edit-cluster-interface-drawer')).toBeVisible()
  })

  it('should apply static ip subnet successfully', async () => {
    const { result } = renderHook(() => Form.useForm())
    jest.spyOn(Form, 'useForm').mockImplementation(() => result.current)
    render(
      <Provider>
        <ClusterInterface
          currentClusterStatus={mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType}
        />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    expect(await screen.findByRole('row', { name: /Smart Edge 1 Lag0 192.168.11.136 255.255.255.0/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /Smart Edge 2 Lag0 192.168.12.136 255.255.255.0/i })).toBeVisible()
    const mockedClusterInterfaceData = [
      {
        nodeName: 'Smart Edge 1',
        serialNumber: 'serialNumber-1',
        interfaceName: 'port3',
        ip: '192.168.14.135',
        subnet: '255.255.255.0',
        ipMode: 'STATIC'
      },
      {
        nodeName: 'Smart Edge 2',
        serialNumber: 'serialNumber-2',
        interfaceName: 'port3',
        ip: '192.168.14.12',
        subnet: '255.255.255.0',
        ipMode: 'STATIC'
      }
    ]
    result.current[0].setFieldsValue({
      clusterData: mockedClusterInterfaceData
    })
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(mockedUpdateApi).toBeCalledWith(mockedClusterInterfaceData))
  })

  it('should apply one static one dhcp successfully', async () => {
    const { result } = renderHook(() => Form.useForm())
    jest.spyOn(Form, 'useForm').mockImplementation(() => result.current)
    render(
      <Provider>
        <ClusterInterface
          currentClusterStatus={mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType}
        />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    expect(await screen.findByRole('row', { name: /Smart Edge 1 Lag0 192.168.11.136 255.255.255.0/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /Smart Edge 2 Lag0 192.168.12.136 255.255.255.0/i })).toBeVisible()
    const mockedClusterInterfaceData = [
      {
        nodeName: 'Smart Edge 1',
        serialNumber: 'serialNumber-1',
        interfaceName: 'port3',
        ip: '192.168.14.135',
        subnet: '255.255.255.0',
        ipMode: 'STATIC'
      },
      {
        nodeName: 'Smart Edge 2',
        serialNumber: 'serialNumber-2',
        interfaceName: 'port3',
        ipMode: 'DHCP'
      }
    ]
    result.current[0].setFieldsValue({
      clusterData: mockedClusterInterfaceData
    })
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(mockedUpdateApi).toBeCalledWith(mockedClusterInterfaceData))
  })

  it('should be blocked when the interface type is different', async () => {
    const { result } = renderHook(() => Form.useForm())
    jest.spyOn(Form, 'useForm').mockImplementation(() => result.current)
    render(
      <Provider>
        <ClusterInterface
          currentClusterStatus={mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType}
        />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    expect(await screen.findByRole('row', { name: /Smart Edge 1 Lag0 192.168.11.136 255.255.255.0/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /Smart Edge 2 Lag0 192.168.12.136 255.255.255.0/i })).toBeVisible()
    result.current[0].setFieldsValue({
      clusterData: [
        {
          nodeName: 'Smart Edge 1',
          serialNumber: 'serialNumber-1',
          interfaceName: 'lag0',
          ip: '192.168.11.136',
          subnet: '255.255.255.0',
          ipMode: 'STATIC'
        },
        {
          nodeName: 'Smart Edge 2',
          serialNumber: 'serialNumber-2',
          interfaceName: 'port3',
          ip: '192.168.9.135',
          subnet: '255.255.255.0',
          ipMode: 'STATIC'
        }
      ]
    })
    expect(await screen.findByRole('row', { name: /Smart Edge 2 Port3 192.168.9.135 255.255.255.0/i })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(await screen.findByText('Make sure you select the same interface type (physical port or LAG) as that of another node in this cluster.')).toBeVisible()
  })

  it('should be blocked by different subnet range', async () => {
    const { result } = renderHook(() => Form.useForm())
    jest.spyOn(Form, 'useForm').mockImplementation(() => result.current)
    render(
      <Provider>
        <ClusterInterface
          currentClusterStatus={mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType}
        />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    expect(await screen.findByRole('row', { name: /Smart Edge 1 Lag0 192.168.11.136 255.255.255.0/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /Smart Edge 2 Lag0 192.168.12.136 255.255.255.0/i })).toBeVisible()
    result.current[0].setFieldsValue({
      clusterData: [
        {
          nodeName: 'Smart Edge 1',
          serialNumber: 'serialNumber-1',
          interfaceName: 'port3',
          ip: '192.168.11.136',
          subnet: '255.255.255.0',
          ipMode: 'STATIC'
        },
        {
          nodeName: 'Smart Edge 2',
          serialNumber: 'serialNumber-2',
          interfaceName: 'port3',
          ip: '192.168.9.135',
          subnet: '255.255.255.0',
          ipMode: 'STATIC'
        }
      ]
    })
    expect(await screen.findByRole('row', { name: /Smart Edge 2 Port3 192.168.9.135 255.255.255.0/i })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(await screen.findByText('Make sure that each node is within the same subnet range.')).toBeVisible()
  })

  it('should back to list page when clicking cancel button', async () => {
    render(
      <Provider>
        <ClusterInterface
          currentClusterStatus={mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType}
        />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: '/ecc2d7cf9d2342fdb31ae0e24958fcac/t/devices/edge',
      search: ''
    })
  })
})