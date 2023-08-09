import { Form } from 'antd'

import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { PhoneInput } from '.'
describe('PhoneInput', () => {
  it('should render correctly', async () => {
    render(
      <Provider>
        <Form>
          <Form.Item
            name='test'
            label='Test'
          >
            <PhoneInput name='test' callback={jest.fn()} onTop={false} />
          </Form.Item>
        </Form>
      </Provider>
    )
    fireEvent.change(await screen.findByLabelText('Test'), { target: { value: '+12015550123' } })
  })
  it('should render ontop correctly', async () => {
    render(
      <Provider>
        <Form>
          <Form.Item
            name='test'
            label='Test'
            initialValue={'+12015554321'}
          >
            <PhoneInput name='test' callback={jest.fn()} onTop={true} />
          </Form.Item>
        </Form>
      </Provider>
    )
    fireEvent.change(await screen.findByLabelText('Test'), { target: { value: '+12015550123' } })
  })
})