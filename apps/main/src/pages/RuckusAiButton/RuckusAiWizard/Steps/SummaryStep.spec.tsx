import { Form } from 'antd'

import { Provider  } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { mock_payload } from './__test__/SummaryStepFixtures'
import { SummaryStep }  from './SummaryStep'

describe('SummaryStep', () => {
  it('should display SummaryStep page correctly', async () => {
    render(
      <Provider>
        <Form>
          <SummaryStep
            payload={mock_payload}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Wireless Networks')).toBeVisible()
  })
})
