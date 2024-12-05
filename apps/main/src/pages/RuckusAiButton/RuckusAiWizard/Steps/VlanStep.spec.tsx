import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { ruckusAssistantApi }           from '@acx-ui/rc/services'
import { RuckusAssistantUrlInfo, Vlan } from '@acx-ui/rc/utils'
import { Provider, store  }             from '@acx-ui/store'
import {
  render,
  screen,
  renderHook,
  mockServer
} from '@acx-ui/test-utils'

import { mock_response, mock_payload, mock_vlan } from './__test__/VlanStepFixtures'
import { VlanStep }                               from './VlanStep'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  VlanSettingDrawer: (props: { setVlan: (data: Vlan) => void }) => {
    const { setVlan } = props
    return (
      <div>
        <h2>Vlan Setting Drawer</h2>
        <button onClick={() => setVlan(mock_vlan as Vlan)}>Apply</button>
      </div>
    )
  }
}))

describe('VlanStep', () => {
  const updateFn = jest.fn()
  const createFn = jest.fn()
  const getFn = jest.fn()
  beforeEach(() => {
    store.dispatch(ruckusAssistantApi.util.resetApiState())
    mockServer.use(
      rest.put(
        RuckusAssistantUrlInfo.updateOnboardConfigs.url,
        (_req, res, ctx) => {
          updateFn()
          return res(ctx.json(mock_response))}
      ),
      rest.post(
        RuckusAssistantUrlInfo.createOnboardConfigs.url,
        (_req, res, ctx) => {
          createFn()
          return res(ctx.json(mock_response))}
      ),
      rest.get(
        RuckusAssistantUrlInfo.getOnboardConfigs.url,
        (_req, res, ctx) => {
          getFn()
          return res(ctx.json(mock_response))}
      )
    )
  })
  afterEach(() => jest.restoreAllMocks())
  it('should display VlanStep page correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <VlanStep
            showAlert={true}
            payload={mock_payload}
            sessionId='session-id'
            description='description'
            formInstance={formRef.current}
          />
        </Form>
      </Provider>)
    //Add new VLAN
    expect(await screen.findByText('Add VLAN')).toBeVisible()
    userEvent.click(screen.getByRole('button', { name: /Add VLAN/i }))
    expect(await screen.findByText('5')).toBeVisible()
    await userEvent.type(screen.getByTestId('vlan-id-input-4'), '99')
    expect(screen.getByTestId('vlan-id-input-4')).toHaveValue(99)
    expect(screen.getByTestId('vlan-configuration-4')).toBeVisible()
    // Add new VLAN configuration
    await userEvent.click(screen.getByTestId('vlan-configuration-4'))
    expect(await screen.findByText('Vlan Setting Drawer')).toBeVisible()
    await userEvent.click(screen.getByText('Apply'))
    expect(createFn).toBeCalled()
  })

  it('should add and edit vlan configuration correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <VlanStep
            showAlert={false}
            payload={mock_payload}
            sessionId='session-id'
            description='description'
            formInstance={formRef.current}
          />
        </Form>
      </Provider>)
    // update
    expect(await screen.findByText('Add VLAN')).toBeVisible()
    await userEvent.click(screen.getByTestId('vlan-configuration-0'))
    expect(await screen.findByText('Vlan Setting Drawer')).toBeVisible()
    await userEvent.click(screen.getByText('Apply'))
    expect(updateFn).toBeCalled()

    // change id
    await userEvent.clear(screen.getByTestId('vlan-id-input-0'))
    await userEvent.type(screen.getByTestId('vlan-id-input-0'), '93')
    expect(screen.getByTestId('vlan-id-input-0')).toHaveValue(93)

    await userEvent.clear(screen.getByTestId('vlan-id-input-1'))
    await userEvent.type(screen.getByTestId('vlan-id-input-1'), '93')
    expect(screen.getByTestId('vlan-id-input-1')).toHaveValue(93)
    screen.getByTestId('vlan-id-input-1').blur()

    //duplicate id
    const duplicateAlerts = await screen.findAllByText('This VLAN ID is duplicated.')
    expect(duplicateAlerts.length).toBeGreaterThan(0)
    await userEvent.clear(screen.getByTestId('vlan-id-input-1'))
    await userEvent.type(screen.getByTestId('vlan-id-input-1'), '100')
    expect(screen.getByTestId('vlan-id-input-1')).toHaveValue(100)

    // change vlan name
    await userEvent.clear(screen.getByTestId('vlan-name-input-0'))
    await userEvent.type(screen.getByTestId('vlan-name-input-0'), 'vlan-93')
    expect(screen.getByTestId('vlan-name-input-0')).toHaveValue('vlan-93')

    // change checkbox
    const checkboxes = await screen.findAllByRole('checkbox')
    await userEvent.click(checkboxes[2])
    expect(checkboxes[2]).not.toBeChecked()

    // edit
    await userEvent.click(screen.getByTestId('vlan-configuration-0'))
    expect(await screen.findByText('Vlan Setting Drawer')).toBeVisible()
    expect(getFn).toBeCalled()
    await userEvent.click(screen.getByText('Apply'))
    expect(updateFn).toBeCalled()

  })

})
