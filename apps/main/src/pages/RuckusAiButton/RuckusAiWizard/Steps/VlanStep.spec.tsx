import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { ruckusAssistantApi }     from '@acx-ui/rc/services'
import { RuckusAssistantUrlInfo } from '@acx-ui/rc/utils'
import { Provider, store  }       from '@acx-ui/store'
import {
  render,
  screen,
  renderHook,
  mockServer
} from '@acx-ui/test-utils'

import { VlanStep } from './VlanStep'

const mock_response={
  id: 'c98bf7394bbb4d37a4e69affbfd959ea',
  name: '',
  type: 'VLAN',
  // eslint-disable-next-line max-len
  content: '{"vlanId":"30","vlanName":"Visitors","ipv4DhcpSnooping":false,"arpInspection":false,"igmpSnooping":"none","multicastVersion":null,"spanningTreeProtocol":"none","ports":0,"title":"","vlanConfigName":"","switchFamilyModels":[]}',
  sessionId: 'f4efa3ad8bee42b0bf6f97fbd09ffd7d',
  requiredFields: [],
  dispatchContent: {
    switchFamilyModels: [],
    vlanId: '30',
    vlanConfigName: '',
    spanningTreeProtocol: 'none',
    ipv4DhcpSnooping: false,
    multicastVersion: null,
    vlanName: '',
    ports: 0,
    title: '',
    igmpSnooping: 'none',
    arpInspection: false
  }
}
// eslint-disable-next-line max-len
const mock_payload= '[{"id":"fefa24af6b564a65a98b677e9c87ec18","VLAN Name":"Hotel Staff","VLAN ID":"10","Purpose":"This VLAN is dedicated to the hotel staff, allowing them to communicate and access internal resources securely without interference from guest traffic."},{"id":"e0c0def5df314e2aa949b53d2b22a1a8","VLAN Name":"Visitor Network","VLAN ID":"20","Purpose":"This VLAN is for guests visiting the hotel, providing them with internet access while keeping their devices separate from the hotel\'s internal network."},{"id":"94b257f47a4c4fb8b5cdca48f6956eb8","VLAN Name":"Premium Access","VLAN ID":"30","Purpose":"This VLAN is designed for guests who have paid for premium services, offering them higher bandwidth and priority access to the network."},{"id":"f5f2c71522d14e079c3a21b0168a3c96","VLAN Name":"Smart Devices","VLAN ID":"40","Purpose":"This VLAN is specifically for smart devices such as IoT devices in the hotel, ensuring they operate on a separate network for security and performance."}]'
describe('VlanStep', () => {
  const updateFn = jest.fn()
  beforeEach(() => {
    store.dispatch(ruckusAssistantApi.util.resetApiState())
    mockServer.use(
      rest.put(
        RuckusAssistantUrlInfo.updateOnboardConfigs.url,
        (_req, res, ctx) => {
          updateFn()
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
        <Form>
          <VlanStep
            payload={mock_payload}
            sessionId='session-id'
            formInstance={formRef.current}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Add VLAN')).toBeVisible()
    userEvent.click(screen.getByRole('button', { name: /Add VLAN/i }))
    expect(await screen.findByText('5')).toBeVisible()
    await userEvent.type(screen.getByTestId('vlan-id-input-4'), '99')
    expect(screen.getByTestId('vlan-id-input-4')).toHaveValue(99)
  })

  it('should click vlan configuration correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form>
          <VlanStep
            payload={mock_payload}
            sessionId='session-id'
            formInstance={formRef.current}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Add VLAN')).toBeVisible()
    await userEvent.click(screen.getByTestId('vlan-configuration-0'))
    expect(await screen.findByText('IPv4 DHCP Snooping')).toBeVisible()
    await userEvent.click(await screen.findByText('Add'))
    // await waitFor(() => expect(updateFn).toHaveBeenCalled()) TBC
  })

})