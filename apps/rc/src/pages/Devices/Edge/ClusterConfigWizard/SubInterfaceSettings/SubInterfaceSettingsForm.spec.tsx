import { Form } from 'antd'

import { EdgePortConfigFixtures } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import { render, screen, within } from '@acx-ui/test-utils'

import {
  SubInterfaceSettingsFormProps,
  SubInterfaceSettingsForm
} from './SubInterfaceSettingsForm'

const { mockEdgePortConfig } = EdgePortConfigFixtures
const { mockedPortsStatus } = EdgePortConfigFixtures
const { mockedLagStatus } = EdgePortConfigFixtures

const mockedSetFieldValue = jest.fn()
const mockedGetFieldValue = jest.fn()
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => ({
    form: {
      getFieldValue: mockedGetFieldValue,
      setFieldValue: mockedSetFieldValue,
      getFieldsValue: jest.fn()
    }
  })
}))

describe('EdgeSubInterfaceSettingForm', () => {
  const mockProps: SubInterfaceSettingsFormProps = {
    serialNumber: 'serialNumber-1',
    ports: [mockEdgePortConfig.ports[0], mockEdgePortConfig.ports[2]],
    portStatus: mockedPortsStatus['serialNumber-1'].slice(0, 2),
    lagStatus: mockedLagStatus['serialNumber-1']
  }

  it('should render port tab successfully', async () => {
    renderForm(mockProps)

    const tabs = await screen.findAllByRole('tab')
    expect(tabs.length).toBe(3)
    expect(within(tabs[0]).getByText('Port1')).toBeInTheDocument()
    expect(within(tabs[1]).getByText('Port2')).toBeInTheDocument()
    expect(within(tabs[2]).getByText('LAG 0')).toBeInTheDocument()
  })

  it('Lag member should be disabled', async () => {
    const mockPropsWithFirstPortBeingLagMember = {
      ...mockProps,
      portStatus: mockProps.portStatus.map((status, index) =>
        index === 0 ? { ...status, isLagMember: true } : status
      )
    }

    renderForm(mockPropsWithFirstPortBeingLagMember)

    const tabs = await screen.findAllByRole('tab')
    expect(tabs.length).toBe(3)

    expect(tabs[0].getAttribute('aria-disabled')).toBe('true')
    expect(tabs[0].getAttribute('aria-selected')).toBe('false')

    expect(tabs[1].getAttribute('aria-disabled')).toBe('false')
    expect(tabs[1].getAttribute('aria-selected')).toBe('true')

    expect(tabs[2].getAttribute('aria-disabled')).toBeNull()
    expect(tabs[2].getAttribute('aria-selected')).toBe('false')
  })

  const renderForm = (props: SubInterfaceSettingsFormProps) => {
    return render(
      <Provider>
        <Form>
          <SubInterfaceSettingsForm {...props} />
        </Form>
      </Provider>
    )
  }
})
