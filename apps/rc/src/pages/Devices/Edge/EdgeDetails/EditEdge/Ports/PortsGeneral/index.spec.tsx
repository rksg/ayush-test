import React from 'react'

import userEvent              from '@testing-library/user-event'
import { Form, FormInstance } from 'antd'
import { rest }               from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  renderHook,
  screen,
  waitFor } from '@acx-ui/test-utils'

import { EdgeEditContext }                                    from '../..'
import { mockEdgePortConfig, mockEdgePortConfigWithStatusIp } from '../../../../__tests__/fixtures'

import PortsGeneral from './'

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

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgePortsGeneral: (props: MockedPortsFormType) => {
    return <MockedPortsForm {...props}/>
  }
}))

const mockedUsedNavigate = jest.fn()
const mockedContextSetActiveSubTab = jest.fn()
const mockedSetFormControl = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const defaultContextData = {
  activeSubTab: {
    key: 'ports-general',
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

describe('EditEdge ports - ports general', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  const mockedUpdateReq = jest.fn()

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: 'ports-general'
    }

    mockedContextSetActiveSubTab.mockClear()
    mockedSetFormControl.mockClear()
    mockedUpdateReq.mockClear()

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
        discardFn: () => {},
        applyFn: () => {}
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
          <PortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

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
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <PortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

    await screen.findByTestId('rc-EdgePortsGeneral')
    await user.click(await screen.findByRole('button', { name: 'Submit' }))
    expect(mockedSetFormControl).toHaveBeenCalledTimes(1)
  })

  it('cancel and go back to edge list', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <PortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

    await screen.findByTestId('rc-EdgePortsGeneral')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge`,
      hash: '',
      search: ''
    })
  })
})