/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }            from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { fakeWebhooks } from './__tests__/fixtures'

import R1Webhooks from './index'

const services = require('@acx-ui/rc/services')

describe('R1Webhooks', () => {
  let params: { tenantId: string }
  const mockReqAdminsData = jest.fn()

  beforeEach(() => {
    mockReqAdminsData.mockReset()
    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }
    services.useGetWebhooksQuery = jest.fn().mockImplementation(() => {
      return { data: fakeWebhooks }
    })
    jest.spyOn(services, 'useDeleteWebhookMutation')
    mockServer.use(
      rest.delete(
        AdministrationUrlsInfo.deleteWebhook.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.get(
        MspUrlsInfo.getMspProfile.url,
        (req, res, ctx) => res(ctx.json({
          msp_external_id: '0000A000001234YFFOO',
          msp_label: '',
          msp_tenant_name: ''
        }))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <R1Webhooks setTitleCount={jest.fn()} />
      </Provider>, {
        route: { params }
      })

    const table = await screen.findByTestId('WebhooksTable')
    expect(table).toHaveTextContent(/Name/i)
    expect(table).toHaveTextContent(/URL/i)
    expect(table).toHaveTextContent(/Payload/i)
    expect(table).toHaveTextContent(/Status/i)
    expect(screen.getByPlaceholderText('Search Name, URL, Payload')).toBeVisible()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Create Webhook' })).toBeInTheDocument()
  })
  it('should delete selected row', async () => {
    render(
      <Provider>
        <R1Webhooks setTitleCount={jest.fn()} />
      </Provider>, {
        route: { params }
      })
    const row = await screen.findByRole('row', { name: /commscope/i })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "commscope"?')
    const submitBtn = screen.getByRole('button', { name: 'OK' })
    await userEvent.click(submitBtn)
    await waitFor(() => {
      expect(submitBtn).not.toBeVisible()
    })

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]
    await waitFor(() => {
      expect(services.useDeleteWebhookMutation).toHaveLastReturnedWith(value)
    })
  })
  it('should open drawer on edit selected row', async () => {
    render(
      <Provider>
        <R1Webhooks setTitleCount={jest.fn()} />
      </Provider>, {
        route: { params }
      })

    const row = await screen.findByRole('row', { name: /commscope/i })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))

    expect(await screen.findByRole('dialog')).toBeVisible()
  })
  it('should open drawer on create button clicked', async () => {
    render(
      <Provider>
        <R1Webhooks setTitleCount={jest.fn()} />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Create Webhook' }))
    expect(await screen.findByRole('dialog')).toBeVisible()
  })
})

