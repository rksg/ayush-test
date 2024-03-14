import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeApi }                                                                                                         from '@acx-ui/rc/services'
import { EdgeClusterStatus, EdgeGeneralFixtures, EdgeLagFixtures, EdgePortConfigFixtures, EdgePortTypeEnum, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                 from '@acx-ui/store'
import { mockServer, renderHook, screen, waitFor, within }                                                                 from '@acx-ui/test-utils'

import { useClusterInterfaceActions } from './useClusterInterfaceActions'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockClusterInterfaceOptionData, mockEdgePortConfig } = EdgePortConfigFixtures
const{ mockedEdgeLagListWithClusterType } = EdgeLagFixtures

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetAllInterfacesByTypeQuery: () => ({
    data: mockClusterInterfaceOptionData,
    isLoading: false
  })
}))

const mockedUpdateApi = jest.fn()

describe('useEdgeClusterActions', () => {
  beforeEach(() => {
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

  it('should update cluster interface successfully', async () => {
    const { result } = renderHook(() =>
      useClusterInterfaceActions(mockEdgeClusterList.data[0] as EdgeClusterStatus), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    result.current.updateClusterInterface(
      [
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
    )

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
})