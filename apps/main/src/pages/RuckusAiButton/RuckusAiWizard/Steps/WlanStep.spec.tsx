import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CommonUrlsInfo, RuckusAssistantUrlInfo } from '@acx-ui/rc/utils'
import { Provider  }                              from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { mock_payload, mock_description, mock_addwlan_response } from './__test__/WlanStepFixtures'
import { WlanStep }                                              from './WlanStep'

describe('WlanStep', () => {
  const createFn = jest.fn()
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json({ data: [{ name: 'wlan1' }] }))
      ),
      rest.post(
        RuckusAssistantUrlInfo.createOnboardConfigs.url,
        (_req, res, ctx) => {
          createFn()
          return res(ctx.json(mock_addwlan_response))}
      )
    )
  })
  afterEach(() => jest.restoreAllMocks())

  it('should display WlanStep page and add correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <WlanStep
            sessionId={'sessionId'}
            showAlert={false}
            payload={mock_payload}
            formInstance={formRef.current}
            description={mock_description}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Add Network Profile')).toBeVisible()
    userEvent.click(screen.getByRole('button', { name: /Add Network Profile/i }))
    await waitFor(() => expect(createFn).toHaveBeenCalledTimes(1))
    expect(await screen.findByText('3')).toBeVisible()
    await userEvent.click(screen.getByTestId('wlan-checkbox-0'))
    await userEvent.type(screen.getByTestId('wlan-name-input-2'), 'wlan1')
    expect(screen.getByTestId('wlan-name-input-2')).toHaveValue('wlan1')
    screen.getByTestId('wlan-name-input-2').blur()
    expect(await screen.findByText('Network with that name already exists')).toBeInTheDocument()
    await userEvent.type(screen.getByTestId('wlan-name-input-2'), 'wlan3')
    expect(screen.getByTestId('wlan-name-input-2')).toHaveValue('wlan1wlan3')
  })

  it('should validate when user unselect all', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <WlanStep
            sessionId={'sessionId'}
            showAlert={true}
            payload={mock_payload}
            formInstance={formRef.current}
            description={mock_description}
          />
        </Form>
      </Provider>)
    const checkboxes = await screen.findAllByRole('checkbox')
    await userEvent.click(checkboxes[0])
    expect(checkboxes[0]).not.toBeChecked()
    await userEvent.click(checkboxes[1])
    expect(checkboxes[1]).not.toBeChecked()
    formRef.current.validateFields()
    expect(await screen.findByText('Select at least one network profile')).toBeInTheDocument()
  })
})
