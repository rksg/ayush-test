/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { fakeWebhooks } from './__tests__/fixtures'
import { WebhookForm }  from './WebhookForm'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const mockedSetVisible = jest.fn()
const services = require('@acx-ui/rc/services')

describe('WebhookForm', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }
    jest.spyOn(services, 'useAddWebhookMutation')
    jest.spyOn(services, 'useUpdateWebhookMutation')
    jest.spyOn(services, 'useWebhookSendSampleEventMutation')
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.addWebhook.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'add' }))
      ),
      rest.put(
        AdministrationUrlsInfo.updateWebhook.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'update' }))
      ),
      rest.post(
        AdministrationUrlsInfo.webhookSendSampleEvent.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <WebhookForm visible={true} setVisible={mockedSetVisible} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByRole('tab', { name: 'Settings' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Incidents' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Activities' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Events' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Create' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(screen.getByRole('switch', { name: 'Enabled' })).toBeVisible()
  })
  it('should save correctly', async () => {
    render(
      <Provider>
        <WebhookForm visible={true}
          setVisible={mockedSetVisible}
          selected={fakeWebhooks.data[0]} />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(screen.getByRole('tab', { name: 'Incidents' }))
    expect(await screen.findByText('Severity')).toBeVisible()
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.click(document.querySelector('.ant-tree-checkbox') as HTMLDivElement)
    await userEvent.click(screen.getByRole('tab', { name: 'Activities' }))
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.click(document.querySelector('.ant-tree-checkbox') as HTMLDivElement)
    await userEvent.click(screen.getByRole('tab', { name: 'Events' }))
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.click(document.querySelector('.ant-tree-checkbox') as HTMLDivElement)
    await userEvent.click(screen.getByRole('tab', { name: 'Activities' }))
    await userEvent.click(screen.getByRole('switch', { name: 'Enabled' }))
    expect(await screen.findByRole('switch', { name: 'Disabled' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: 'update' },
      status: 'fulfilled'
    })]
    await waitFor(() => {
      expect(services.useUpdateWebhookMutation).toHaveLastReturnedWith(value)
    })
  })
  it('settings tab should load edit values correctly', async () => {
    render(
      <Provider>
        <WebhookForm visible={true}
          setVisible={mockedSetVisible}
          selected={fakeWebhooks.data[0]} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByRole('tab', { name: 'Settings' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Webhook URL' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Test' })).toBeEnabled()
    expect(screen.getByRole('combobox', { name: 'Payload' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('commscope')).toBeVisible()
    expect(screen.getByDisplayValue('http://www.commscope.com')).toBeVisible()
    expect(screen.getByText('RUCKUS One')).toBeVisible()
    await userEvent.click(screen.getByLabelText('eye-invisible'))
    expect(await screen.findByDisplayValue('secret123')).toBeVisible()
  })
  it('settings tab should validate input values correctly', async () => {
    render(
      <Provider>
        <WebhookForm visible={true}
          setVisible={mockedSetVisible} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByRole('button', { name: 'Test' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    // Assert error messages are shown
    expect(await screen.findByText('Please enter Name')).toBeVisible()
    expect(await screen.findByText('Please enter Webhook URL')).toBeVisible()
    expect(await screen.findByText('Please enter Payload')).toBeVisible()

    // Input valid values
    fireEvent.change(screen.getByRole('textbox', { name: 'Webhook URL' }), { target: { value: 'https://test.com' } })
    // eslint-disable-next-line testing-library/no-node-access
    const secret = document.querySelector('input[type=password]')! as Element
    fireEvent.change(secret, { target: { value: 'secret123' } })
    await userEvent.click(screen.getByRole('combobox', { name: 'Payload' }))
    await userEvent.click(screen.getByRole('combobox', { name: 'Payload' }))
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'DataDog' })).toBeVisible()
    })
    fireEvent.click(screen.getAllByText('DataDog')[1])

    // Assert correct values are displayed and Test button is enabled
    expect(screen.getByDisplayValue('https://test.com')).toBeVisible()
    await userEvent.click(screen.getByLabelText('eye-invisible'))
    expect(await screen.findByDisplayValue('secret123')).toBeVisible()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Test' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Test' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]
    await waitFor(() => {
      expect(services.useWebhookSendSampleEventMutation).toHaveLastReturnedWith(value)
    })

    // fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'test' } })
  })
})

