import { Form } from 'antd'

import { Provider  } from '@acx-ui/store'
import {
  render,
  screen,
  renderHook
} from '@acx-ui/test-utils'

import { WlanDetailStep } from './WlanDetailStep'

describe('WlanDetailStep', () => {
  it('should display WlanDetailStep page correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form>
          <WlanDetailStep
            payload={''}
            sessionId='session-id'
            formInstance={formRef.current}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Recommended Network Configuration')).toBeVisible()
  })
})