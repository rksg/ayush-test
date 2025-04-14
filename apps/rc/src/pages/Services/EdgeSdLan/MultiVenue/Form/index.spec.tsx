import userEvent       from '@testing-library/user-event'
import { Form, Input } from 'antd'
import { transform }   from 'lodash'
import { rest }        from 'msw'

import { edgeSdLanApi } from '@acx-ui/rc/services'
import {
  EdgeSdLanUrls,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType,
  EdgeSdLanFixtures,
  EdgeMvSdLanFormNetwork,
  EdgePinUrls,
  EdgePinFixtures
} from '@acx-ui/rc/utils'
import {
  Provider, store
} from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { EdgeSdLanFormContainer, EdgeSdLanFormProps } from '.'

const { mockedMvSdLanService, mockedMvSdLanDataList } = EdgeSdLanFixtures
const { mockPinStatsList } = EdgePinFixtures

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
  content: MockedStep1
}, {
  title: 'Scope',
  content: MockedStep2
}, {
  title: 'Summary',
  content: MockedStep3
}]

const MockedTargetComponent = (props: EdgeSdLanFormProps) => {
  return <Provider>
    <EdgeSdLanFormContainer
      {...props}
    />
  </Provider>
}

const mockedFinishFn = jest.fn()

describe('multi-venue SD-LAN form', () => {
  beforeEach(() => {
    mockedFinishFn.mockClear()
    store.dispatch(edgeSdLanApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedMvSdLanDataList }))
      ),
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        (_, res, ctx) => res(ctx.json({ data: mockPinStatsList }))
      )
    )
  })

  it('should navigate to service list when click cancel', async () => {
    const { result } = renderHook(() => Form.useForm())
    render(<MockedTargetComponent
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
    const { result } = renderHook(() => Form.useForm())

    it('should submit with correct data', async () => {
      render(<MockedTargetComponent
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
        const call = mockedFinishFn.mock.calls[0]
        expect(call[0]).toStrictEqual({
          name: 'mockedServiceName',
          tunnelProfileId: 'SLt-id',
          tunnelProfileName: 'Default tunnel profile (SD-LAN)',
          activatedNetworks: {},
          activatedGuestNetworks: {},
          isGuestTunnelEnabled: false
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
      content: MockedEditFormStep1
    })

    it('should correctly edit profile', async () => {
      const formRef = result.current[0]
      render(<MockedTargetComponent
        form={formRef}
        steps={editSteps}
        onFinish={mockedFinishFn}
        editData={mockedMvSdLanService}
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
        const call = mockedFinishFn.mock.calls[0]
        expect(call[0]).toStrictEqual({
          ...mockedMvSdLanService,
          activatedNetworks: transform(mockedMvSdLanService.networks, (result, value, key) => {
            result[key] = value.map(id => ({ id, name: undefined }))
          }, {} as EdgeMvSdLanFormNetwork),
          activatedGuestNetworks: {}
        })
      })
    })
  })
})
