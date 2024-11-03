import { Form } from 'antd'

import { Provider  } from '@acx-ui/store'
import {
  render,
  screen,
  renderHook
} from '@acx-ui/test-utils'

import { VlanStep } from './VlanStep'

describe('VlanStep', () => {
  it('should display VlanStep page correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form>
          <VlanStep
            payload={''}
            sessionId='session-id'
            formInstance={formRef.current}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Add VLAN')).toBeVisible()
  })
})