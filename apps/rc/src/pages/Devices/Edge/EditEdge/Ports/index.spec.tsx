import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import _         from 'lodash'
import { rest }  from 'msw'

import { EdgeEditContext, EditEdgeContextType, EditEdgeFormControlType }                                                                                            from '@acx-ui/rc/components'
import { edgeSdLanApi }                                                                                                                                             from '@acx-ui/rc/services'
import { EdgeGeneralFixtures, EdgeIpModeEnum, EdgeLagFixtures, EdgePort, EdgePortConfigFixtures, EdgePortTypeEnum, EdgeSdLanFixtures, EdgeSdLanUrls, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                                                          from '@acx-ui/store'
import { act, mockServer, render, renderHook, screen, waitFor }                                                                                                     from '@acx-ui/test-utils'

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

const updateRequestSpy = jest.fn()

interface MockedPortsFormProps {
  activeTab?: string
}
const MockedPortsForm = (props: MockedPortsFormProps) => {
  return <div data-testid='rc-EdgePortsGeneralBase'>
    <span>activeTab:{props.activeTab}</span>
    <Form.List name={'port1'}>
      {(fields) => fields.map(
        ({ key }) => <React.Fragment key={key}>
          <Form.Item name={[0, 'name']}
            label='Mocked Description'
            rules={[{ required: true, message: 'Please input the description' }]}
          >
            <input type='text' />
          </Form.Item>
          <Form.Item name={[0, 'portType']} label='Mocked Port Type'>
            <input type='text' />
          </Form.Item>
        </React.Fragment>
      )}
    </Form.List>
  </div>
}

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgePortsGeneralBase: (props: MockedPortsFormProps) => {
    return <MockedPortsForm {...props} />
  }
}))

const defaultContextData = {
  activeSubTab: {
    key: EdgeEditContext.EdgePortTabEnum.PORTS_GENERAL,
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

const defaultEditEdgeDataContextData = {
  clusterInfo: mockEdgeClusterList.data[0],
  portData: mockEdgePortConfig.ports,
  portStatus: mockEdgePortStatus,
  lagData: mockedEdgeLagList.content,
  isFetching: false,
  isCluster: false
} as unknown as EditEdgeDataContextType

const MockedComponent = (props: {
  cxtData?: EditEdgeContextType,
  editEdgeDataContextdata?: EditEdgeDataContextType
}) => {
  return <Provider>
    <EdgeEditContext.EditContext.Provider
      value={props.cxtData ?? defaultContextData}
    >
      <EditEdgeDataContext.Provider
        value={props.editEdgeDataContextdata ?? defaultEditEdgeDataContextData}
      >
        <Ports />
      </EditEdgeDataContext.Provider>
    </EdgeEditContext.EditContext.Provider>
  </Provider>
}

let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab:string }

describe('EditEdge - Ports', () => {
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '0000000030',
      activeTab: 'ports',
      activeSubTab: EdgeEditContext.EdgePortTabEnum.PORTS_GENERAL
    }
    store.dispatch(edgeSdLanApi.util.resetApiState())
    updateRequestSpy.mockClear()

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataList }))
      ),
      rest.patch(
        EdgeUrlsInfo.updatePortConfig.url,
        (req, res, ctx) => {
          updateRequestSpy(req.body)
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
    expect(screen.getByTestId('rc-EdgePortsGeneralBase')).toBeVisible()
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
    expect(screen.getByTestId('rc-EdgePortsGeneralBase')).toBeVisible()
    result.current[0].setFieldsValue({
      port1: [mockEdgePortConfig.ports[0]],
      port2: [mockEdgePortConfig.ports[1]],
      port3: [mockEdgePortConfig.ports[2]]
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
    await waitFor(() => expect(updateRequestSpy).toHaveBeenCalledTimes(1))
  })

  it('should change ip mode into STATIC when choose LAN port', async () => {
    const mockData = _.cloneDeep(mockEdgePortConfig)
    mockData.ports[0].ipMode = EdgeIpModeEnum.DHCP

    const portCtxData = _.cloneDeep(defaultEditEdgeDataContextData)
    portCtxData.portData = mockData.ports

    render(<MockedComponent editEdgeDataContextdata={portCtxData} />, {
      route: {
        params,
        path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
      }
    })

    const portType = await screen.findByRole('textbox', { name: 'Mocked Port Type' })
    await userEvent.clear(portType)
    await userEvent.type(portType, EdgePortTypeEnum.LAN)
    await userEvent.click(screen.getByRole('button', { name: 'Apply Ports General' }))
    const expectResult = _.cloneDeep(mockEdgePortConfig)
    expectResult.ports[0].portType = EdgePortTypeEnum.LAN
    expectResult.ports[0].ipMode = EdgeIpModeEnum.STATIC
    expectResult.ports[0].gateway = ''
    expectResult.ports[4].natEnabled = false
    await waitFor(() => expect(updateRequestSpy).toBeCalledWith(expectResult))
  })

  it('should change natEnabled when choose WAN port', async () => {
    const mockLanData = _.cloneDeep(mockEdgePortConfig)
    mockLanData.ports[0].portType = EdgePortTypeEnum.LAN

    const portCtxData = _.cloneDeep(defaultEditEdgeDataContextData)
    portCtxData.portData = mockLanData.ports

    render(<MockedComponent editEdgeDataContextdata={portCtxData} />, {
      route: {
        params,
        path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
      }
    })

    const portType = await screen.findByRole('textbox', { name: 'Mocked Port Type' })
    await userEvent.clear(portType)
    await userEvent.type(portType, EdgePortTypeEnum.WAN)
    await userEvent.click(screen.getByRole('button', { name: 'Apply Ports General' }))
    const expectResult = _.cloneDeep(mockEdgePortConfig)
    expectResult.ports[0].portType = EdgePortTypeEnum.WAN
    expectResult.ports[0].natEnabled = true
    expectResult.ports[4].natEnabled = false
    await waitFor(() => expect(updateRequestSpy).toBeCalledWith(expectResult))
  })

  it('value change should handle with edit form context', async () => {
    const mockedContextSetActiveSubTab = jest.fn()
    const { result: formControlRef } = renderHook(() => {
      const [data, setData] = React.useState({
        isDirty: false,
        hasError: false,
        discardFn: jest.fn(),
        applyFn: jest.fn()
      } as EditEdgeFormControlType)
      return { data, setData }
    })

    const contextData = {
      ...defaultContextData,
      formControl: formControlRef.current.data,
      setFormControl: formControlRef.current.setData,
      setActiveSubTab: mockedContextSetActiveSubTab
    }

    render(<MockedComponent cxtData={contextData} />, {
      route: {
        params,
        path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
      }
    })

    await screen.findByTestId('rc-EdgePortsGeneralBase')
    const descriptionInput = await screen.findByRole('textbox', { name: 'Mocked Description' })
    await waitFor(() => expect(descriptionInput).toHaveValue('port0'))
    await userEvent.type(descriptionInput, 'test')
    expect(mockedContextSetActiveSubTab).toHaveBeenCalled()
    act(() => {
      formControlRef.current.data.applyFn?.()
      formControlRef.current.data.discardFn?.()
    })
    await waitFor(() => {
      expect(updateRequestSpy).toHaveBeenCalledTimes(1)
    })
  })

  it('should correctly handle with form finished', async () => {
    const mockedSetFormControl = jest.fn()
    const contextData = {
      ...defaultContextData,
      setFormControl: mockedSetFormControl
    }
    render(<MockedComponent cxtData={contextData}/>, {
      route: {
        params,
        path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
      }
    })

    await screen.findByTestId('rc-EdgePortsGeneralBase')
    await userEvent.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
    await waitFor(() => expect(updateRequestSpy).toBeCalled())
    await waitFor(() => expect(mockedSetFormControl).toHaveBeenCalledTimes(1))
  })

  it('should activate the validation failed tab', async () => {
    const mockData = _.cloneDeep(mockEdgePortConfig)
    mockData.ports[0].portType = EdgePortTypeEnum.LAN
    mockData.ports[0].name = ''

    const portCtxData = _.cloneDeep(defaultEditEdgeDataContextData)
    portCtxData.portData = mockData.ports

    render(<MockedComponent editEdgeDataContextdata={portCtxData} />, {
      route: {
        params,
        path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
      }
    })

    await screen.findByTestId('rc-EdgePortsGeneralBase')
    const descriptionInput = await screen.findByRole('textbox', { name: 'Mocked Description' })
    await waitFor(() => expect(descriptionInput).toHaveValue(''))
    await userEvent.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
    await screen.findByText('activeTab:port1')
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

  it('no data to display', async () => {
    const portCtxData = _.cloneDeep(defaultEditEdgeDataContextData)
    portCtxData.portData = [] as EdgePort[]
    render(<MockedComponent editEdgeDataContextdata={portCtxData} />, {
      route: {
        params,
        path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
      }
    })

    expect(screen.queryByTestId('rc-EdgePortsGeneralBase')).toBeNull()
    screen.getByText('No data to display')
  })
})

describe('api fail', () => {
  const consoleLogFn = jest.fn()
  jest.spyOn(console, 'log').mockImplementationOnce(consoleLogFn)

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: EdgeEditContext.EdgePortTabEnum.PORTS_GENERAL
    }

    mockServer.use(
      rest.patch(
        EdgeUrlsInfo.updatePortConfig.url,
        (_req, res, ctx) => res(ctx.status(500))
      )
    )
  })

  it('should update failed', async () => {
    render(<MockedComponent />, {
      route: {
        params,
        path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
      }
    })

    await screen.findByTestId('rc-EdgePortsGeneralBase')
    await userEvent.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
    await waitFor(() => expect(consoleLogFn).toBeCalled())
  })
})