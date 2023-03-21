/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { fakeNotificationList } from './__tests__/fixtures'
import { RecipientDialogProps } from './RecipientDialog'

import NotificationList from './index'


const mockedRecipientDialog = jest.fn().mockImplementation((props: RecipientDialogProps) => {
  const { isDuplicated } = props
  const isEmailDuplicate = isDuplicated('EMAIL', 'test_user@gmail.com')
  const isPhoneDuplicate = isDuplicated('SMS', '+886987654321')
  const isUnknownTypeDuplicate = isDuplicated('Others', 'test_data')

  return (<div data-testid='rc-RecipientDialog' title='RecipientDialog'>
    <div data-testid='rc-RecipientDialog-email-check'>{''+isEmailDuplicate}</div>
    <div data-testid='rc-RecipientDialog-mobile-check'>{''+isPhoneDuplicate}</div>
    <div data-testid='rc-RecipientDialog-others-check'>{''+isUnknownTypeDuplicate}</div>
  </div>)
})
jest.mock('./RecipientDialog', () => ({
  ...jest.requireActual('./RecipientDialog'),
  __esModule: true,
  default: (props: RecipientDialogProps) => {
    return mockedRecipientDialog(props)
  }
}))
describe('Notification List', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getNotificationRecipients.url,
        (req, res, ctx) => res(ctx.json(fakeNotificationList))
      ),
      rest.delete(
        AdministrationUrlsInfo.deleteNotificationRecipient.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.delete(
        AdministrationUrlsInfo.deleteNotificationRecipients.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('should create notification recipient successfully', async () => {
    render(
      <Provider>
        <NotificationList />
      </Provider>, {
        route: { params }
      })
    const row = await screen.findAllByRole('row', { name: /testUser/i })
    expect(row.length).toBe(3)
  })

  it('should trigger edit button', async () => {
    render(
      <Provider>
        <NotificationList />
      </Provider>, {
        route: { params }
      })
    const row = await screen.findByRole('row', { name: /testUser 1/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
  })

  it('should trigger add button', async () => {
    render(
      <Provider>
        <NotificationList />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Add Recipient' }))
  })

  it('edit button will remove when select above 1 row', async () => {
    render(
      <Provider>
        <NotificationList />
      </Provider>, {
        route: { params }
      })
    const row = await screen.findAllByRole('row', { name: /testUser/i })
    await userEvent.click(within(row[0]).getByRole('checkbox'))
    await userEvent.click(within(row[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('should delete selected row', async () => {
    render(
      <Provider>
        <NotificationList />
      </Provider>, {
        route: { params }
      })
    const row = await screen.findByRole('row', { name: /testUser 1/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await screen.findByText('Delete "testUser 1"?')
    await userEvent.click(screen.getByRole('button', { name: 'Delete Recipients' }))
    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument()
    })
  })

  it('should delete selected row(multiple)', async () => {
    render(
      <Provider>
        <NotificationList />
      </Provider>, {
        route: { params }
      })

    const row1 = await screen.findByRole('row', { name: /testUser 1/i })
    const row2 = await screen.findByRole('row', { name: /testUser 2/i })
    await userEvent.click(within(row1).getByRole('checkbox'))
    await userEvent.click(within(row2).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await screen.findByText('Delete "2 Recipients"?')
    await userEvent.click(screen.getByRole('button', { name: 'Delete Recipients' }))
    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument()
    })
  })

  it('should check duplicate endpoint correctly', async () => {
    render(
      <Provider>
        <NotificationList />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByTestId('rc-RecipientDialog-email-check').textContent).toBe('false')
    expect(screen.getByTestId('rc-RecipientDialog-mobile-check').textContent).toBe('false')
    await screen.findByRole('row', { name: /testUser 1/i })
    expect(screen.getByTestId('rc-RecipientDialog-email-check').textContent).toBe('true')
    expect(screen.getByTestId('rc-RecipientDialog-mobile-check').textContent).toBe('true')
    expect(screen.getByTestId('rc-RecipientDialog-others-check').textContent).toBe('false')
  })
})