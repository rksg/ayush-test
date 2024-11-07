import { Form } from 'antd'

import { Provider  } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { mock_payload, mock_description } from './__test__/WlanStepFixtures'
import { WlanStep }                       from './WlanStep'

describe('WlanStep', () => {
  it('should display WlanStep page correctly', async () => {

    render(
      <Provider>
        <Form>
          <WlanStep
            payload={mock_payload}
            description={mock_description}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Add Network Profile')).toBeVisible()
  })
})
