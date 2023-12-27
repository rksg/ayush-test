import React from 'react'

import userEvent              from '@testing-library/user-event'
import { Form, FormInstance } from 'antd'
import { rest }               from 'msw'

import { EdgeLag, EdgeLagFixtures, EdgePortConfigFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                       from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  renderHook,
  screen,
  waitFor } from '@acx-ui/test-utils'

import { EdgePortTabEnum }                from '..'
import { EditContext as EdgeEditContext } from '../../EdgeEditContext'
import { EdgePortsDataContext }           from '../PortDataProvider'

import PortsGeneral from './'

const { mockEdgePortConfig, mockEdgePortConfigWithStatusIp } = EdgePortConfigFixtures
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

interface MockedPortsFormType {
  form: FormInstance,
  onValuesChange: (form: FormInstance, hasError: boolean) => void
  onFinish: () => void
  onCancel: () => void
}

const MockedPortsForm = (props: MockedPortsFormType) => {
  const onFormChange = () => {
    props.onValuesChange({
      getFieldsValue: () => {},
      resetFields: () => {}
    } as FormInstance, false)
  }

  return <Form data-testid='rc-EdgePortsGeneral' form={props.form}>
    <button onClick={onFormChange}>FormChange</button>
    <button onClick={props.onFinish}>Submit</button>
    <button onClick={props.onCancel}>Cancel</button>
  </Form>
}

jest.mock('../../EdgePortsGeneral', () => ({
  ...jest.requireActual('../../EdgePortsGeneral'),
  EdgePortsGeneral: (props: MockedPortsFormType) => {
    return <MockedPortsForm {...props}/>
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
  portData: mockEdgePortConfigWithStatusIp.ports,
  lagData: mockedEdgeLagList.content as EdgeLag[],
  isLoading: false,
  isFetching: false
}

describe('EditEdge ports - ports general', () => {
  const mockedUpdateReq = jest.fn()
  const mockedCancelFn = jest.fn()
  const mockedEdgeID = 'mocked_edge_id'

  beforeEach(() => {
    mockedContextSetActiveSubTab.mockClear()
    mockedSetFormControl.mockClear()
    mockedUpdateReq.mockClear()
    mockedCancelFn.mockClear()

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getPortConfig.url,
        (req, res, ctx) => res(ctx.json(mockEdgePortConfig))
      ),
      rest.patch(
        EdgeUrlsInfo.updatePortConfig.url,
        (req, res, ctx) => {
          mockedUpdateReq(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('value change should handle with edit form context', async () => {
    const user = userEvent.setup()
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

    render(
      <Provider>
        <EdgeEditContext.Provider
          value={contextData}
        >
          <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
            <PortsGeneral
              serialNumber={mockedEdgeID}
              onCancel={mockedCancelFn}
            />
          </EdgePortsDataContext.Provider>
        </EdgeEditContext.Provider>
      </Provider>)

    await screen.findByTestId('rc-EdgePortsGeneral')
    await user.click(await screen.findByRole('button', { name: 'FormChange' }))
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
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
            <PortsGeneral
              serialNumber={mockedEdgeID}
              onCancel={mockedCancelFn}
            />
          </EdgePortsDataContext.Provider>
        </EdgeEditContext.Provider>
      </Provider>)

    await screen.findByTestId('rc-EdgePortsGeneral')
    await userEvent.click(await screen.findByRole('button', { name: 'Submit' }))
    expect(mockedSetFormControl).toHaveBeenCalledTimes(1)
  })

  it('cancel and go back to edge list', async () => {
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
            <PortsGeneral
              serialNumber={mockedEdgeID}
              onCancel={mockedCancelFn}
            />
          </EdgePortsDataContext.Provider>
        </EdgeEditContext.Provider>
      </Provider>)

    await screen.findByTestId('rc-EdgePortsGeneral')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedCancelFn).toBeCalled()
  })
})