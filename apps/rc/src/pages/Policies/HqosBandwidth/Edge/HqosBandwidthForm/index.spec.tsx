import userEvent       from '@testing-library/user-event'
import { Form, Input } from 'antd'

import {
  EdgeHqosProfileFixtures,
  getDefaultTrafficClassListData
} from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  render,
  renderHook,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import QosBandwidthForm from '.'
const { mockEdgeHqosProfileStatusList } = EdgeHqosProfileFixtures
const { click } = userEvent

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue('t-id')
}))

const MockedStep1 = () => <div data-testid='rc-SettingsForm'>
  <Form.Item name='name' initialValue={'Test-QoS-1'}>
    <Input />
  </Form.Item>
  <div onClick={() => {}}>Apply</div>
</div>
const MockedStep2 = () => <div data-testid='rc-ScopeForm'>
  <div onClick={() => {}}>Apply</div>
</div>
const MockedStep3 = () => <div data-testid='rc-SummaryForm'></div>
const addSteps = [{
  title: 'Settings',
  content: <MockedStep1 />
}, {
  title: 'Scope',
  content: <MockedStep2 />
}, {
  title: 'Summary',
  content: <MockedStep3 />
}]

const mockedFinishFn = jest.fn()

describe('Edge QoS form', () => {
  beforeEach(() => {
    mockedFinishFn.mockClear()
  })

  describe('Add', () => {
    const { result } = renderHook(() => Form.useForm())
    it('should submit with correct data', async () => {
      render(<QosBandwidthForm
        form={result.current[0]}
        steps={addSteps}
        onFinish={mockedFinishFn}
      />, {
        wrapper: Provider,
        route: {
          path: '/:tenantId/t/policies/hqosBandwidth/create',
          params: { tenantId: 't-id' } }
      })

      const form = within(await screen.findByTestId('steps-form'))
      const body = within(form.getByTestId('steps-form-body'))
      const actions = within(form.getByTestId('steps-form-actions'))

      // Step 1
      expect(await body.findByTestId('rc-SettingsForm')).toBeVisible()

      // Navigate to Step 2
      await click(actions.getByRole('button', { name: 'Next' }))
      expect(await body.findByTestId('rc-ScopeForm')).toBeVisible()

      // Navigate to Step 3
      await click(actions.getByRole('button', { name: 'Next' }))
      expect(await body.findByTestId('rc-SummaryForm')).toBeVisible()

      await click(actions.getByRole('button', { name: 'Add' }))

      await waitFor(() => {
        const call = mockedFinishFn.mock.calls[0]
        expect(call[0]).toStrictEqual({
          trafficClassSettings: getDefaultTrafficClassListData(),
          name: 'Test-QoS-1',
          activateChangedClusters: undefined
        })
      })
    })
  })

  describe('Edit', () => {
    const { result } = renderHook(() => Form.useForm())

    const MockedEditFormStep1 = () => <div data-testid='rc-SettingsForm'>
      <Form.Item name='name'>
        <Input />
      </Form.Item>
      <div onClick={() => {}}>Apply</div>
    </div>
    const editSteps = addSteps.slice(1, 2)
    editSteps.unshift({
      title: 'Settings',
      content: <MockedEditFormStep1 />
    })

    it('should correctly edit profile', async () => {
      const mockData = mockEdgeHqosProfileStatusList.data[1]
      const editData = {
        name: mockData.name,
        description: mockData.description,
        trafficClassSettings: mockData.trafficClassSettings
      }
      const formRef = result.current[0]
      render(<QosBandwidthForm
        form={formRef}
        steps={editSteps}
        onFinish={mockedFinishFn}
        editData={editData}
      />, {
        wrapper: Provider,
        route: { params: { tenantId: 't-id', policyId: 'mock-id' } }
      })

      const form = within(await screen.findByTestId('steps-form'))
      const body = within(form.getByTestId('steps-form-body'))
      const actions = within(form.getByTestId('steps-form-actions'))
      expect(await body.findByTestId('rc-SettingsForm')).toBeVisible()
      await click(actions.getByRole('button', { name: 'Apply' }))

      await waitFor(() => {
        const call = mockedFinishFn.mock.calls[0]
        expect(call[0]).toStrictEqual({
          ...editData,
          activateChangedClusters: undefined
        })
      })
    })
  })
})
