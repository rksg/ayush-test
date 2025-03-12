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

import { mock_payload }   from './__test__/WlanDetailStepFixtures'
import { WlanDetailStep } from './WlanDetailStep'


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => jest.fn()
}))
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
        <Form form={formRef.current}>
          <WlanDetailStep
            showAlert={false}
            payload={mock_payload}
            sessionId='session-id'
            formInstance={formRef.current}
            isRegenWlan={false}
            setIsRegenWlan={jest.fn()}
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
        <Form form={formRef.current}>
          <WlanDetailStep
            showAlert={true}
            payload={mock_payload}
            sessionId='session-id'
            formInstance={formRef.current}
            isRegenWlan={false}
            setIsRegenWlan={jest.fn()}
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
        <Form form={formRef.current}>
          <WlanDetailStep
            showAlert={false}
            payload={mock_payload}
            sessionId='session-id'
            formInstance={formRef.current}
            isRegenWlan={false}
            setIsRegenWlan={jest.fn()}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Recommended Network Configuration')).toBeVisible()
    await userEvent.click(screen.getByTestId('wlan-configuration-0'))
  })

  it('should validate wlan configuration correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <WlanDetailStep
            showAlert={false}
            payload={mock_payload}
            sessionId='session-id'
            formInstance={formRef.current}
            isRegenWlan={false}
            setIsRegenWlan={jest.fn()}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Recommended Network Configuration')).toBeVisible()
    formRef.current.validateFields()
    // eslint-disable-next-line max-len
    const warningMsg = await screen.findAllByText('This configuration is not yet set. Please complete it to ensure proper functionality.')
    expect(warningMsg).toHaveLength(2)

  })
})
