import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { rbacApi }                                               from '@acx-ui/analytics/services'
import { Provider, rbacApiURL, store }                           from '@acx-ui/store'
import { render, screen, mockServer, waitFor, mockRestApiQuery } from '@acx-ui/test-utils'

import { Settings } from './Settings'

const components = require('@acx-ui/components')
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))
describe('IntentAI Settings', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(`${rbacApiURL}/tenantSettings`, (_req, res, ctx) => res(ctx.text('Updated')))
    )
  })
  afterEach(() => {
    store.dispatch(rbacApi.util.resetApiState())
    components.showToast.mockClear()
  })
  it('should render Settings and about intents drawer', async () => {
    const settings = JSON.stringify(['Energy Saving'])
    render(<Settings settings={settings}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    const intentSubscriptions = await screen.findByText('Intent Subscriptions (1)')
    expect(intentSubscriptions).toBeVisible()
    await userEvent.click(intentSubscriptions)
    expect(await screen.findByText('Available Intents')).toBeVisible()
    expect(await screen.findByText('Notifications')).toBeVisible()
    const aboutIntents = await screen.findByTestId('about-intents')
    await userEvent.click(aboutIntents)
    const closeButtons = await screen.findAllByTestId('CloseSymbol')
    await userEvent.click(closeButtons.at(1)!)
    await userEvent.click(closeButtons.at(0)!)
    expect(intentSubscriptions).toBeVisible()
  })
  it('should save settings', async () => {
    const settings = JSON.stringify(['Energy Saving'])
    render(<Settings settings={settings}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    const intentSubscriptions = await screen.findByText('Intent Subscriptions (1)')
    expect(intentSubscriptions).toBeVisible()
    await userEvent.click(await screen.findByTestId('intent-subscriptions'))
    expect(await screen.findByText('Available Intents')).toBeVisible()
    expect(await screen.findByText('Notifications')).toBeVisible()
    const applyBtn = await screen.findByRole('button', { name: 'Save' })
    expect(applyBtn).toBeVisible()

    const item = screen.getByText('Energy Saving')
    await userEvent.click(item)
    const addButton = screen.getByRole('button', {
      name: /remove/i
    })
    expect(addButton).toBeTruthy()
    await userEvent.click(addButton)
    const checkbox = await screen.findByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    await userEvent.click(checkbox)

    await userEvent.click(applyBtn)
    await waitFor(() => {
      expect(components.showToast)
        .toHaveBeenLastCalledWith({
          type: 'success',
          content: 'Subscriptions saved successfully!'
        })
    })
  })
  it('should handle error on save settings', async () => {
    const error = 'server error'
    mockRestApiQuery(`${rbacApiURL}/tenantSettings`, 'post', { error }, false, true)
    const settings = JSON.stringify(['Energy Saving'])
    render(<Settings settings={settings}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    const intentSubscriptions = await screen.findByText('Intent Subscriptions (1)')
    expect(intentSubscriptions).toBeVisible()
    await userEvent.click(await screen.findByTestId('intent-subscriptions'))
    expect(await screen.findByText('Available Intents')).toBeVisible()
    expect(await screen.findByText('Notifications')).toBeVisible()
    const applyBtn = await screen.findByRole('button', { name: 'Save' })
    expect(applyBtn).toBeVisible()
    await userEvent.click(applyBtn)
    await waitFor(() => {
      expect(components.showToast)
        .toHaveBeenLastCalledWith({
          type: 'error',
          content: JSON.stringify({
            status: 500,
            data: JSON.stringify({ error })
          })
        })
    })
  })
})
