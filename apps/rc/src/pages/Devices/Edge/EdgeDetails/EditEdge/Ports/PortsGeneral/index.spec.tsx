import userEvent        from '@testing-library/user-event'
import { FormInstance } from 'antd'
import { rest }         from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen } from '@acx-ui/test-utils'

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

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgePortsGeneral: (props:{
    onValuesChange: (form: FormInstance, hasError: boolean) => void
    onFinish: () => void
    onCancel: () => void }) => {

    const onFormChange = () => {
      props.onValuesChange({
        getFieldsValue: () => {},
        resetFields: () => {}
      } as FormInstance, false)
    }

    return <div data-testid='rc-EdgePortsGeneral'>
      <button onClick={onFormChange}>FormChange</button>
      <button onClick={props.onFinish}>Submit</button>
      <button onClick={props.onCancel}>Cancel</button>
    </div>
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

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: 'ports-general'
    }

    mockedContextSetActiveSubTab.mockClear()
    mockedSetFormControl.mockClear()

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getPortConfig.url,
        (req, res, ctx) => res(ctx.json(mockEdgePortConfig))
      )
    )
  })

  it('value change should handle with edit form context', async () => {
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
    await user.click(await screen.findByRole('button', { name: 'FormChange' }))
    expect(mockedContextSetActiveSubTab).toHaveBeenCalledTimes(1)
    expect(mockedSetFormControl).toHaveBeenCalledTimes(1)
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