import userEvent       from '@testing-library/user-event'
import { Form, Input } from 'antd'

import {
  getServiceRoutePath,
  ServiceOperation,
  ServiceType,
  EdgeSdLanFixtures
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

import EdgeSdLanForm from '.'

const { mockedSdLanService } = EdgeSdLanFixtures

const { click } = userEvent

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))

const MockedStep1 = () => <div data-testid='rc-SettingsForm'>
  <Form.Item name='name' initialValue={'mockedServiceName'}>
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
const { result } = renderHook(() => Form.useForm())

describe('SD-LAN form', () => {
  beforeEach(() => {
    mockedFinishFn.mockClear()
  })

  it('should navigate to service list when click cancel', async () => {
    render(<EdgeSdLanForm
      form={result.current[0]}
      steps={addSteps}
      onFinish={mockedFinishFn}
    />, {
      wrapper: Provider,
      route: {
        path: '/:tenantId/t/services/cf/create',
        params: { tenantId: 't-id' }
      }
    })

    const targetPath = getServiceRoutePath({
      type: ServiceType.EDGE_SD_LAN,
      oper: ServiceOperation.LIST
    })

    const form = within(await screen.findByTestId('steps-form'))
    within(await form.findByTestId('steps-form-body'))
    const actions = within(await form.findByTestId('steps-form-actions'))
    await click(await actions.findByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledWith({
        hash: '',
        pathname: '/t-id/t/'+targetPath,
        search: ''
      })
    })
  })

  describe('Add', () => {
    it('should submit with correct data', async () => {
      render(<EdgeSdLanForm
        form={result.current[0]}
        steps={addSteps}
        onFinish={mockedFinishFn}
      />, {
        wrapper: Provider,
        route: { params: { tenantId: 't-id' } }
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
        expect(mockedFinishFn).toBeCalledWith({ name: 'mockedServiceName' })
      })
    })
  })

  describe('Edit', () => {
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
      const formRef = result.current[0]
      render(<EdgeSdLanForm
        form={formRef}
        steps={editSteps}
        onFinish={mockedFinishFn}
        editData={mockedSdLanService}
      />, {
        wrapper: Provider,
        route: { params: { tenantId: 't-id', serviceId: 'mock-id' } }
      })

      const form = within(await screen.findByTestId('steps-form'))
      const body = within(form.getByTestId('steps-form-body'))
      const actions = within(form.getByTestId('steps-form-actions'))
      expect(await body.findByTestId('rc-SettingsForm')).toBeVisible()
      await click(actions.getByRole('button', { name: 'Apply' }))

      await waitFor(() => {
        expect(mockedFinishFn).toBeCalledWith({
          ...mockedSdLanService,
          activatedNetworks: mockedSdLanService.networkIds.map(id => ({ id }))
        })
      })
    })
  })
})
