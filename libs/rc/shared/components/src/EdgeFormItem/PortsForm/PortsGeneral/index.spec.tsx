import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import _         from 'lodash'
import { rest }  from 'msw'

import {
  EdgeIpModeEnum,
  EdgeLag,
  EdgeLagFixtures,
  EdgePort,
  EdgePortConfigFixtures,
  EdgePortInfo,
  EdgePortTypeEnum,
  EdgeSdLanUrls,
  EdgeUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  renderHook,
  screen,
  waitFor } from '@acx-ui/test-utils'

import { EdgePortTabEnum }                                                              from '..'
import { EditContext as EdgeEditContext, EditEdgeContextType, EditEdgeFormControlType } from '../../EdgeEditContext'
import { EdgePortsDataContext, EdgePortsDataContextType }                               from '../PortDataProvider'

import PortsGeneral from './'

const { mockEdgePortConfig, mockPortInfo } = EdgePortConfigFixtures
const { mockedEdgeLagList } = EdgeLagFixtures


jest.mock('@acx-ui/utils', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })
  return {
    ...jest.requireActual('@acx-ui/utils'),
    getIntl: () => intl
  }
})

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

jest.mock('../../EdgePortsGeneralBase', () => ({
  ...jest.requireActual('../../EdgePortsGeneralBase'),
  EdgePortsGeneralBase: (props: MockedPortsFormProps) => {
    return <MockedPortsForm {...props} />
  }
}))

const mockedContextSetActiveSubTab = jest.fn()
const mockedSetFormControl = jest.fn()

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
  setActiveSubTab: mockedContextSetActiveSubTab,
  setFormControl: mockedSetFormControl
}
const defaultPortsContextdata = {
  portData: mockEdgePortConfig.ports as EdgePort[],
  portStatus: mockPortInfo as EdgePortInfo[],
  lagData: mockedEdgeLagList.content as EdgeLag[],
  isLoading: false,
  isFetching: false
}

let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
describe('EditEdge ports - ports general', () => {
  const mockedEdgeID = 'mocked_edge_id'

  const mockedUpdateReq = jest.fn()
  const mockedCancelFn = jest.fn()

  const MockedComponent = (props:
    {
      cxtData?: EditEdgeContextType,
      portsContextdata?: EdgePortsDataContextType,
      buttonLabel?: {
        submit?: string;
        cancel?: string;
      }
    }) => {
    return <Provider>
      <EdgeEditContext.Provider
        value={props.cxtData ?? defaultContextData}
      >
        <EdgePortsDataContext.Provider value={props.portsContextdata ?? defaultPortsContextdata}>
          <PortsGeneral
            clusterId='mock-cluster'
            serialNumber={mockedEdgeID}
            onCancel={mockedCancelFn}
            buttonLabel={props.buttonLabel}
          />
        </EdgePortsDataContext.Provider>
      </EdgeEditContext.Provider>
    </Provider>
  }

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: EdgePortTabEnum.PORTS_GENERAL
    }

    mockedContextSetActiveSubTab.mockClear()
    mockedSetFormControl.mockClear()
    mockedUpdateReq.mockClear()
    mockedCancelFn.mockClear()

    mockServer.use(
      rest.patch(
        EdgeUrlsInfo.updatePortConfig.url,
        (req, res, ctx) => {
          mockedUpdateReq(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('should change ip mode into STATIC when choose LAN port', async () => {
    const mockData = _.cloneDeep(mockEdgePortConfig)
    mockData.ports[0].ipMode = EdgeIpModeEnum.DHCP

    const portCtxData = _.cloneDeep(defaultPortsContextdata)
    portCtxData.portData = mockData.ports

    render(<MockedComponent portsContextdata={portCtxData} />, {
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
    await waitFor(() => expect(mockedUpdateReq).toBeCalledWith(expectResult))
  })

  it('should change natEnabled when choose WAN port', async () => {
    const mockLanData = _.cloneDeep(mockEdgePortConfig)
    mockLanData.ports[0].portType = EdgePortTypeEnum.LAN

    const portCtxData = _.cloneDeep(defaultPortsContextdata)
    portCtxData.portData = mockLanData.ports

    render(<MockedComponent portsContextdata={portCtxData} />, {
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
    await waitFor(() => expect(mockedUpdateReq).toBeCalledWith(expectResult))
  })

  it('value change should handle with edit form context', async () => {
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
      setFormControl: formControlRef.current.setData
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
      expect(mockedUpdateReq).toHaveBeenCalledTimes(1)
    })
  })

  it('should correctly handle with form finished', async () => {
    render(<MockedComponent />, {
      route: {
        params,
        path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
      }
    })

    await screen.findByTestId('rc-EdgePortsGeneralBase')
    await userEvent.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
    await waitFor(() => expect(mockedUpdateReq).toBeCalled())
    await waitFor(() => expect(mockedSetFormControl).toHaveBeenCalledTimes(1))
  })

  it('should activate the validation failed tab', async () => {
    const mockData = _.cloneDeep(mockEdgePortConfig)
    mockData.ports[0].portType = EdgePortTypeEnum.LAN
    mockData.ports[0].name = ''

    const portCtxData = _.cloneDeep(defaultPortsContextdata)
    portCtxData.portData = mockData.ports

    render(<MockedComponent portsContextdata={portCtxData} />, {
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

  it('cancel and go back to edge list', async () => {
    render(<MockedComponent />, {
      route: {
        params,
        path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
      }
    })

    await screen.findByTestId('rc-EdgePortsGeneralBase')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedCancelFn).toBeCalled()
  })

  it('no data to display', async () => {
    const portCtxData = _.cloneDeep(defaultPortsContextdata)
    portCtxData.portData = [] as EdgePort[]
    render(<MockedComponent portsContextdata={portCtxData} />, {
      route: {
        params,
        path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
      }
    })

    expect(screen.queryByTestId('rc-EdgePortsGeneralBase')).toBeNull()
    screen.getByText('No data to display')
  })

  describe('api fail', () => {
    const consoleLogFn = jest.fn()
    jest.spyOn(console, 'log').mockImplementationOnce(consoleLogFn)

    beforeEach(() => {
      params = {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
        serialNumber: '000000000000',
        activeTab: 'ports',
        activeSubTab: EdgePortTabEnum.PORTS_GENERAL
      }

      mockServer.use(
        rest.patch(
          EdgeUrlsInfo.updatePortConfig.url,
          (_req, res, ctx) => res(ctx.status(500))
        )
      )
    })

    it('should update failed', async () => {
      render(<MockedComponent buttonLabel={{
        submit: 'Submit',
        cancel: 'Cancel'
      }}/>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

      await screen.findByTestId('rc-EdgePortsGeneralBase')
      await userEvent.click(await screen.findByRole('button', { name: 'Submit' }))
      await waitFor(() => expect(consoleLogFn).toBeCalled())
    })
  })
})