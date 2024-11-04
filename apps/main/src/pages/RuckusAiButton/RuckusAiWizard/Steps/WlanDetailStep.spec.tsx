import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }      from '@acx-ui/store'
import {
  render,
  screen,
  renderHook,
  mockServer
} from '@acx-ui/test-utils'

import { WlanDetailStep } from './WlanDetailStep'



const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => jest.fn()
}))
// eslint-disable-next-line max-len
const mock_payload='[{"SSID Required":["portalServiceProfileId"],"SSID Type":"guest","SSID Objective":"Guest","SSID Name":"Visitors","Purpose":"This network allows visitors to connect to the internet while on campus, ensuring they can access necessary information without compromising the school\'s internal network.","id":"1c9b533dac0f4df9b0a91f88bdd3ddca"},{"SSID Required":["dpskServiceProfileId"],"SSID Type":"dpsk","SSID Objective":"Infrastructure","SSID Name":"Smart Devices","Purpose":"This network is dedicated to smart devices used within the school, such as security cameras and IoT devices, ensuring they operate efficiently without interfering with other networks.","id":"f25dccb970504194b95cd4cf1d2dc197"}]'
describe('WlanDetailStep', () => {

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )
  })
  it('should display WlanDetailStep page correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form>
          <WlanDetailStep
            payload={mock_payload}
            sessionId='session-id'
            formInstance={formRef.current}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Recommended Network Configuration')).toBeVisible()
  })
  it('should change ssid type correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form>
          <WlanDetailStep
            payload={mock_payload}
            sessionId='session-id'
            formInstance={formRef.current}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Recommended Network Configuration')).toBeVisible()

    const selectElement = await screen.findByText('Captive Portal')
    await userEvent.click(selectElement)
    await userEvent.click(await screen.findByText('Open Network'))
    expect(await screen.findByText('Open Network Configurations')).toBeVisible()
  })

  it('should click wlan configuration correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form>
          <WlanDetailStep
            payload={mock_payload}
            sessionId='session-id'
            formInstance={formRef.current}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Recommended Network Configuration')).toBeVisible()
    await userEvent.click(screen.getByTestId('wlan-configuration-0'))
  })
})