import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import _         from 'lodash'
import { rest }  from 'msw'

import {
  EdgeLag,
  EdgeLagFixtures,
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

import { EdgePortTabEnum }                                     from '..'
import { EditContext as EdgeEditContext, EditEdgeContextType } from '../../EdgeEditContext'
import { EdgePortsDataContext, EdgePortsDataContextType }      from '../PortDataProvider'

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


const MockedPortsForm = () => {
  return <div data-testid='rc-EdgePortsGeneralBase'>
    <Form.List name={'port1'}>
      {(fields) => fields.map(
        ({ key }) => <Form.Item key={key} name='name' label='Mocked Description'>
          <input type='text' />
        </Form.Item>
      )}
    </Form.List>
  </div>
}

jest.mock('../../EdgePortsGeneralBase', () => ({
  ...jest.requireActual('../../EdgePortsGeneralBase'),
  EdgePortsGeneralBase: () => {
    return <MockedPortsForm />
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
  portData: mockEdgePortConfig.ports,
  portStatus: mockPortInfo as EdgePortInfo[],
  lagData: mockedEdgeLagList.content as EdgeLag[],
  isLoading: false,
  isFetching: false
}

let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
describe('EditEdge ports - ports general', () => {
  const mockedEdgeID = 'mocked_edge_id'

  const mockedUpdateReq = jest.fn()
  const mockedGetSdLanReq = jest.fn()
  const mockedCancelFn = jest.fn()
  const mockedSubmitFn = jest.fn()
  const mockedOnValueChange = jest.fn()

  const MockedComponent = (props:
    { cxtData?: EditEdgeContextType, portsContextdata?: EdgePortsDataContextType }) => {
    return <Provider>
      <EdgeEditContext.Provider
        value={props.cxtData ?? defaultContextData}
      >
        <EdgePortsDataContext.Provider value={props.portsContextdata ?? defaultPortsContextdata}>
          <PortsGeneral
            clusterId='mock-cluster'
            serialNumber={mockedEdgeID}
            onCancel={mockedCancelFn}
            onFinish={mockedSubmitFn}
            onValuesChange={mockedOnValueChange}
            buttonLabel={{
              submit: 'Submit',
              cancel: 'Cancel'
            }}
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
    mockedSubmitFn.mockClear()
    mockedGetSdLanReq.mockClear()
    mockedOnValueChange.mockClear()

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getPortConfig.url,
        (_req, res, ctx) => res(ctx.json(mockEdgePortConfig))
      ),
      rest.patch(
        EdgeUrlsInfo.updatePortConfig.url,
        (req, res, ctx) => {
          mockedUpdateReq(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_req, res, ctx) => {
          mockedGetSdLanReq()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should gateway still being to its origin data', async () => {
    mockedOnValueChange.mockReturnValue({ port1: [{ portType: EdgePortTypeEnum.LAN }] })
    render(<MockedComponent />, {
      route: {
        params,
        path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
      }
    })

    await userEvent.type(await screen.findByRole('textbox', { name: 'Mocked Description' }), 'test')
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    const expectResult = _.cloneDeep(mockEdgePortConfig)
    expectResult.ports[4].natEnabled = false
    await waitFor(() => expect(mockedUpdateReq).toBeCalledWith(expectResult))
  })

  it.skip('value change should handle with edit form context', async () => {
    const { result: formControlRef } = renderHook(() => {
      const [data, setData] = React.useState({
        isDirty: false,
        hasError: false,
        discardFn: jest.fn(),
        applyFn: jest.fn()
      })
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
    await userEvent.type(await screen.findByRole('textbox', { name: 'Mocked Description' }), 'test')
    expect(mockedContextSetActiveSubTab).toHaveBeenCalledTimes(1)
    act(() => {
      formControlRef.current.data.applyFn()
      formControlRef.current.data.discardFn()
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
    await userEvent.click(await screen.findByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(mockedUpdateReq).toBeCalled())
    await waitFor(() => expect(mockedSetFormControl).toHaveBeenCalledTimes(1))
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
      render(<MockedComponent />, {
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