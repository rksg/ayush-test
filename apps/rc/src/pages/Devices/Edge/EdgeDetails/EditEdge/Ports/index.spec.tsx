import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { EdgeEditContext, EdgePortTabEnum }                                                                             from '@acx-ui/rc/components'
import { edgeSdLanApi }                                                                                                 from '@acx-ui/rc/services'
import { EdgeGeneralFixtures, EdgeLagFixtures, EdgePortConfigFixtures, EdgeSdLanFixtures, EdgeSdLanUrls, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                              from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor }                                                              from '@acx-ui/test-utils'

import { EditEdgeDataContext, EditEdgeDataContextType } from '../EditEdgeDataProvider'

import Ports from './index'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockEdgePortConfig, mockEdgePortStatus } = EdgePortConfigFixtures
const { mockedEdgeLagList } = EdgeLagFixtures
const { mockedSdLanDataList } = EdgeSdLanFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('../ClusterNavigateWarning', () => ({
  ...jest.requireActual('../ClusterNavigateWarning'),
  ClusterNavigateWarning: () => <div data-testid='ClusterNavigateWarning' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgePortsGeneralBase: () => <div data-testid='EdgePortsGeneralBase' />
}))
const updateRequestSpy = jest.fn()

const defaultContextData = {
  activeSubTab: {
    key: EdgePortTabEnum.PORTS_GENERAL,
    title: 'Ports General'
  },
  formControl: {
    isDirty: false,
    hasError: false,
    applyFn: jest.fn()
  },
  setActiveSubTab: jest.fn(),
  setFormControl: jest.fn()
}

describe('EditEdge - Ports', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab:string }

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '0000000030',
      activeTab: 'ports',
      activeSubTab: EdgePortTabEnum.PORTS_GENERAL
    }
    store.dispatch(edgeSdLanApi.util.resetApiState())
    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataList }))
      ),
      rest.patch(
        EdgeUrlsInfo.updatePortConfig.url,
        (_, res, ctx) => {
          updateRequestSpy()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should render successfully', async () => {
    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <EditEdgeDataContext.Provider
            value={{
              clusterInfo: mockEdgeClusterList.data[0],
              portData: mockEdgePortConfig.ports,
              portStatus: mockEdgePortStatus,
              lagData: mockedEdgeLagList.content,
              isFetching: false,
              isCluster: true
            } as unknown as EditEdgeDataContextType}
          >
            <Ports />
          </EditEdgeDataContext.Provider>
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    expect(screen.getByTestId('ClusterNavigateWarning')).toBeVisible()
    expect(screen.getByTestId('EdgePortsGeneralBase')).toBeVisible()
  })

  it('should submit successfully', async () => {
    const { result } = renderHook(() => Form.useForm())
    jest.spyOn(Form, 'useForm').mockImplementation(() => result.current)
    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <EditEdgeDataContext.Provider
            value={{
              clusterInfo: mockEdgeClusterList.data[0],
              portData: mockEdgePortConfig.ports,
              portStatus: mockEdgePortStatus,
              lagData: mockedEdgeLagList.content,
              isFetching: false,
              isCluster: false
            } as unknown as EditEdgeDataContextType}
          >
            <Ports />
          </EditEdgeDataContext.Provider>
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    expect(screen.queryByTestId('ClusterNavigateWarning')).toBe(null)
    expect(screen.getByTestId('EdgePortsGeneralBase')).toBeVisible()
    result.current[0].setFieldsValue({
      port1: [mockEdgePortConfig.ports[0]],
      port2: [mockEdgePortConfig.ports[1]],
      port3: [mockEdgePortConfig.ports[2]]
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
    await waitFor(() => expect(updateRequestSpy).toHaveBeenCalledTimes(1))
  })

  it('should navigate to edge list when cancel', async () => {
    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <EditEdgeDataContext.Provider
            value={{
              clusterInfo: mockEdgeClusterList.data[0],
              portData: mockEdgePortConfig.ports,
              portStatus: mockEdgePortStatus,
              lagData: mockedEdgeLagList.content,
              isFetching: false,
              isCluster: false
            } as unknown as EditEdgeDataContextType}
          >
            <Ports />
          </EditEdgeDataContext.Provider>
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge`,
      hash: '',
      search: ''
    })
  })
})