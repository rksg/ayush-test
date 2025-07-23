import { Form } from 'antd'
import { rest } from 'msw'

import { RuckusAssistantUrlInfo }                   from '@acx-ui/rc/utils'
import { baseRuckusAssistantApi, Provider, store  } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockSwitchConfig1Data }          from './__test__/SwitchConfigurationSummaryFixtures'
import { SwitchConfigurationSummaryPage } from './SwitchConfigurationSummaryPage'


describe('SwitchConfigurationSummaryPage', () => {

  beforeEach(() => {
    store.dispatch(baseRuckusAssistantApi.util.resetApiState())
    mockServer.use(
      rest.get(RuckusAssistantUrlInfo.getOnboardConfigs.url,
        (_, res, ctx) => res(ctx.json(mockSwitchConfig1Data))
      )
    )
  })

  it('should display Switch Configuration Summary page correctly', async () => {
    render(
      <Provider>
        <Form>
          <SwitchConfigurationSummaryPage
            summaryId={'summary-id'}
            summaryTitle={'switchConfig1 @ VLAN 10'}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('switchConfig1 @ VLAN 10')).toBeVisible()
    expect(await screen.findByText('ICX7150-24')).toBeVisible()
    expect(await screen.findByText('ICX7550-24')).toBeVisible()
    expect(await screen.findByText('ICX7650-48P')).toBeVisible()
  })
})
