/* eslint-disable max-len */

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { edgeApi }                                                                                                                from '@acx-ui/rc/services'
import { EdgeClusterTableDataType, EdgeGeneralFixtures, EdgeLagFixtures, EdgePortConfigFixtures, EdgePortTypeEnum, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                        from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor, within }                                                                from '@acx-ui/test-utils'

import { ClusterInterface } from '.'

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetAllInterfacesByTypeQuery: () => ({
    data: mockClusterInterfaceOptionData,
    isLoading: false
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
const mockedUpdateApi = jest.fn()

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockClusterInterfaceOptionData, mockEdgePortConfig } = EdgePortConfigFixtures
const{ mockedEdgeLagListWithClusterType } = EdgeLagFixtures

describe('Edit Edge Cluster - ClusterInterface', () => {
  let params: { tenantId: string, clusterId: string, activeTab: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: 'testClusterId',
      activeTab: 'cluster-interface'
    }
    store.dispatch(edgeApi.util.resetApiState())
    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getPortConfig.url,
        (_req, res, ctx) => res(ctx.json(mockEdgePortConfig))
      ),
      rest.get(
        EdgeUrlsInfo.getEdgeLagList.url,
        (_req, res, ctx) => res(ctx.json(mockedEdgeLagListWithClusterType))
      ),
      rest.patch(
        EdgeUrlsInfo.patchEdgeClusterNetworkSettings.url,
        (_req, res, ctx) => {
          mockedUpdateApi(_req.body)
          return res(ctx.status(202))
        }
      )
    )
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
    expect(screen.getByText('Cluster interface will be used as a communication channel between SmartEdges. Please select the cluster interfaces for all SmartEdges in this cluster:')).toBeVisible()
    expect(await screen.findByRole('row', { name: /Smart Edge 1 Lag0 192.168.11.136 255.255.255.0/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /Smart Edge 2 Lag0 192.168.12.136 255.255.255.0/i })).toBeVisible()
    expect(screen.getByTestId('edit-cluster-interface-drawer')).toBeVisible()
  })

  it('should apply successfully', async () => {
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
          ip: '192.168.14.135',
          subnet: '255.255.255.0'
        },
        {
          nodeName: 'Smart Edge 2',
          serialNumber: 'serialNumber-2',
          interfaceName: 'port3',
          ip: '192.168.9.135',
          subnet: '255.255.255.0'
        }
      ]
    })
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Are you sure you want to change the cluster')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Change' }))

    const expectedResult = {
      lagSettings: [
        {
          serialNumber: 'serialNumber-1',
          lags: mockedEdgeLagListWithClusterType.content.map(item => ({
            ...item,
            lagEnabled: item.id === 0 ? false : item.lagEnabled
          }))
        },
        {
          serialNumber: 'serialNumber-2',
          lags: mockedEdgeLagListWithClusterType.content.map(item => ({
            ...item,
            lagEnabled: item.id === 0 ? false : item.lagEnabled
          }))
        }
      ],
      portSettings: [
        {
          serialNumber: 'serialNumber-1',
          ports: mockEdgePortConfig.ports.map(item => ({
            ...item,
            portType: item.interfaceName === 'port3' ? EdgePortTypeEnum.CLUSTER : item.portType,
            ip: item.interfaceName === 'port3' ? '192.168.14.135' : item.ip,
            subnet: item.interfaceName === 'port3' ? '255.255.255.0' : item.subnet,
            enabled: item.interfaceName === 'port3' ? true : item.enabled
          }))
        },
        {
          serialNumber: 'serialNumber-2',
          ports: mockEdgePortConfig.ports.map(item => ({
            ...item,
            portType: item.interfaceName === 'port3' ? EdgePortTypeEnum.CLUSTER : item.portType,
            ip: item.interfaceName === 'port3' ? '192.168.9.135' : item.ip,
            subnet: item.interfaceName === 'port3' ? '255.255.255.0' : item.subnet,
            enabled: item.interfaceName === 'port3' ? true : item.enabled
          }))
        }
      ]
    }
    await waitFor(() => expect(mockedUpdateApi).toBeCalledWith(expectedResult))
    await waitFor(() => expect(dialog).not.toBeVisible())
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
          subnet: '255.255.255.0'
        },
        {
          nodeName: 'Smart Edge 2',
          serialNumber: 'serialNumber-2',
          interfaceName: 'port3',
          ip: '192.168.9.135',
          subnet: '255.255.255.0'
        }
      ]
    })
    expect(await screen.findByRole('row', { name: /Smart Edge 2 Port3 192.168.9.135 255.255.255.0/i })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(await screen.findByText('Make sure you select the same interface type (physical port or LAG) as that of another node in this cluster.')).toBeVisible()
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