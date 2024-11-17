import { Form } from 'antd'
import { rest } from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }      from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mock_payload, mock_description } from './__test__/WlanStepFixtures'
import { WlanStep }                       from './WlanStep'

describe('WlanStep', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })
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
