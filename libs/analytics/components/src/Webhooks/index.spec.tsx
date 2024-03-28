import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { get }                                                                      from '@acx-ui/config'
import { notificationApi, Provider, rbacApi, store }                                from '@acx-ui/store'
import { findTBody, mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { mockResourceGroups, webhooks, webhooksUrl } from './__fixtures__'
import { Webhook }                                   from './services'

import { WebhooksTable } from '.'

const { click } = userEvent

jest.mock('@acx-ui/config')
jest.mock('./WebhookForm', () => ({
  WebhookForm: (props: { webhook?: Webhook | null, onClose: () => void }) => {
    if (props.webhook === null) return null
    return <div
      data-testid='WebhookForm'
      onClick={props.onClose}
      children={props.webhook ? `Edit Webhook: ${props.webhook.name}` : 'Create Webhook'}
    />
  }
}))

const mockWebhooks = (data = webhooks, success = true) => rest.get(
  webhooksUrl(),
  (_, res, ctx) => res(ctx.json({ data, success }))
)

describe('WebhooksTable', () => {
  describe('R1', () => {
    beforeEach(() => {
      jest.resetModules()
      jest.mocked(get).mockReturnValue('true')

      mockServer.use(
        mockResourceGroups(),
        mockWebhooks()
      )
    })
    afterEach(() => {
      store.dispatch(rbacApi.util.resetApiState())
      store.dispatch(notificationApi.util.resetApiState())
    })
    it('renders table with data and correct columns', async () => {
      render(<WebhooksTable />, { wrapper: Provider })

      const tbody = within(await findTBody())
      expect(await tbody.findAllByRole('row')).toHaveLength(webhooks.length)
      expect(await screen
        .findAllByRole('columnheader', { name: name => Boolean(name) })).toHaveLength(4)
    })
    it('handle edit', async () => {
      render(<WebhooksTable />, { wrapper: Provider })

      const element = await findTBody()
      expect(element).toBeVisible()

      const tbody = within(element)
      const webhook = webhooks[4]
      const targetRow = await tbody.findByRole('row', { name: (row) => row.includes(webhook.name) })

      await click(targetRow)
      await click(await screen.findByRole('button', { name: 'Edit' }))

      const form = await screen.findByTestId('WebhookForm')
      expect(form).toBeVisible()
      expect(form).toHaveTextContent(`Edit Webhook: ${webhook.name}`)

      await click(form)

      expect(form).not.toBeInTheDocument()
    })
    it('handle create', async () => {
      render(<WebhooksTable />, { wrapper: Provider })

      expect(await findTBody()).toBeVisible()

      await click(await screen.findByRole('button', { name: 'Create Webhook' }))

      const form = await screen.findByTestId('WebhookForm')
      expect(form).toBeVisible()
      expect(form).toHaveTextContent('Create Webhook')

      await click(form)

      expect(form).not.toBeInTheDocument()
    })

    describe('delete', () => {
      const webhook = webhooks[4]
      const renderElements = async () => {
        render(<WebhooksTable />, { wrapper: Provider })

        const element = await findTBody()
        expect(element).toBeVisible()

        const tbody = within(element)
        const targetRow = await tbody
          .findByRole('row', { name: (row) => row.includes(webhook.name) })

        await click(targetRow)
        await click(await screen.findByRole('button', { name: 'Delete' }))

        const dialog = await screen.findByRole('dialog')
        expect(dialog).toBeVisible()
        expect(dialog).toHaveTextContent('Are you sure you want to delete this webhook?')

        return { dialog, targetRow }
      }
      it('handle delete', async () => {
        const { dialog, targetRow } = await renderElements()

        mockServer.use(
          rest.delete(webhooksUrl(webhook.id), (_, res, ctx) => res(ctx.json({ success: true }))),
          mockWebhooks(webhooks.filter(item => item.id !== webhook.id))
        )

        await click(await within(dialog).findByRole('button', { name: 'OK' }))

        await waitForElementToBeRemoved(targetRow)

        expect(await within(await findTBody()).findAllByRole('row'))
          .toHaveLength(webhooks.length - 1)

        expect(await screen.findByText('Webhook was deleted')).toBeVisible()
      })
      it('handle delete RTKQuery error', async () => {
        const { dialog } = await renderElements()

        mockServer.use(
          rest.delete(webhooksUrl(webhook.id), (_, res) => res.networkError('Failed to connect'))
        )

        await click(await within(dialog).findByRole('button', { name: 'OK' }))

        expect(await screen.findByText('Failed to delete webhook')).toBeVisible()
      })
      it('handle delete API error', async () => {
        const { dialog } = await renderElements()

        const [status, error] = [500, 'Error from API']
        mockServer.use(
          rest.delete(webhooksUrl(webhook.id), (_, res, ctx) => res(
            ctx.status(status),
            ctx.json({ error })
          ))
        )

        await click(await within(dialog).findByRole('button', { name: 'OK' }))

        expect(await screen.findByText(`Error: ${error}. (status code: ${status})`)).toBeVisible()
      })
    })
  })
  describe('RAI', () => {
    beforeEach(() => {
      jest.resetModules()
      jest.mocked(get).mockReturnValue('')

      mockServer.use(
        mockResourceGroups(),
        mockWebhooks()
      )
    })
    afterEach(() => {
      store.dispatch(rbacApi.util.resetApiState())
      store.dispatch(notificationApi.util.resetApiState())
    })
    it('renders table with data and correct columns', async () => {
      render(<WebhooksTable />, { wrapper: Provider })

      const tbody = within(await findTBody())
      expect(await tbody.findAllByRole('row')).toHaveLength(webhooks.length)
      expect(await screen
        .findAllByRole('columnheader', { name: name => Boolean(name) })).toHaveLength(3)
    })
  })
})
