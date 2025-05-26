import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Provider, rbacApiURL }      from '@acx-ui/store'
import { render, screen, mockServer, within } from '@acx-ui/test-utils'
import { Settings } from './Settings'

describe('InentAI Settings', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(`${rbacApiURL}/tenantSettings`, (_req, res, ctx) => res(ctx.text('Updated')))
    )
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  it('should render Settings and about intents drawer', async () => {
    const settings = JSON.stringify(['Energy Saving'])
    render(<Settings settings={settings}/>,
    { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    const intentSubscriptions = await screen.findByText('Intent Subscriptions (1)')
    await userEvent.click(intentSubscriptions)
    expect(intentSubscriptions).toBeVisible()
    
    
    expect(await screen.findByText('Available Intents')).toBeVisible()
    
    expect(await screen.findByText('Notifications')).toBeVisible()
    const aboutIntents = await screen.findByTestId('about-intents')
    await userEvent.click(aboutIntents)
    
    const closeButtons = await screen.findAllByTestId('CloseSymbol')
    await userEvent.click(closeButtons.at(1)!)

    await userEvent.click(closeButtons.at(0)!)

  })
})
