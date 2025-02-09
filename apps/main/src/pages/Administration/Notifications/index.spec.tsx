/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { administrationApi }      from '@acx-ui/rc/services'
import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }        from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { fakeNotificationList, privilegeGroupList } from './__tests__/fixtures'
import { RecipientDialogProps }                     from './RecipientDialog'

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
const services = require('@acx-ui/msp/services')
const mspUtils = require('@acx-ui/msp/utils')
const rcServices = require('@acx-ui/rc/services')

jest.mock('./AINotificationDrawer', () => ({
  AINotificationDrawer: () => <div data-testid='AIDrawer'>AI Notification Drawer</div>
}))

describe('Notification List', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    services.useGetMspProfileQuery = jest.fn().mockReturnValue({ data: {} })
    services.useGetMspAggregationsQuery = jest.fn().mockReturnValue({ data: {} })
    rcServices.useGetPrivilegeGroupsQuery = jest.fn().mockImplementation(() => {
      return { data: privilegeGroupList }
    })
    store.dispatch(administrationApi.util.resetApiState())

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
    expect(await screen.findByTestId('rc-RecipientDialog')).toBeVisible()
  })

  it('should trigger add button', async () => {
    render(
      <Provider>
        <NotificationList />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(await screen.findByRole('button', { name: 'Add Recipient' }))
    expect(await screen.findByTestId('rc-RecipientDialog')).toBeVisible()
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
    await screen.findByText('Delete "testUser 1"?')
    const okBtn = screen.getByRole('button', { name: 'Delete Recipients' })
    await userEvent.click(okBtn)
    await waitFor(() => {
      expect(okBtn).not.toBeVisible()
    })
  })

  it('should delete selected row(multiple)', async () => {
    render(
      <Provider>
        <NotificationList />
      </Provider>, {
        route: { params }
      })

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /testUser 1/i })).toBeVisible()
    await userEvent.click(within(rows[1]).getByRole('checkbox')) //testUser 1
    expect(within(rows[2]).getByRole('cell', { name: /testUser 2/i })).toBeVisible()
    await userEvent.click(within(rows[2]).getByRole('checkbox')) //testUser 2
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "2 Recipients"?')
    const okBtn = screen.getByRole('button', { name: 'Delete Recipients' })
    await userEvent.click(okBtn)
    await waitFor(() => {
      expect(okBtn).not.toBeVisible()
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

  it('should show preferences button if feature flag on', async () => {
    jest.spyOn(mspUtils, 'MSPUtils').mockReturnValue({ isOnboardedMsp: () => true })
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MSP_AGGREGATE_NOTIFICATION_TOGGLE)
    render(
      <Provider>
        <NotificationList />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Preferences' }))
    expect(await screen.findByRole('dialog')).toBeVisible()
  })

  it('should show ai notification button if feature flag on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NOTIFICATION_CHANNEL_SELECTION_TOGGLE)
    render(
      <Provider>
        <NotificationList />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Notifications Preferences' }))
    expect(await screen.findByTestId('AIDrawer')).toBeVisible()
  })
})
