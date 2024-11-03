import { Form } from 'antd'

import { Provider  } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { WlanStep } from './WlanStep'

describe('WlanStep', () => {
  it('should display WlanStep page correctly', async () => {

    render(
      <Provider>
        <Form>
          <WlanStep
            payload={''}
            description={''}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Add Network Profile')).toBeVisible()
  })
})