import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { getUserProfile, UserProfile }                                   from '@acx-ui/analytics/utils'
import { get }                                                           from '@acx-ui/config'
import { DateFormatEnum, formatter }                                     from '@acx-ui/formatter'
import { notificationApi, notificationApiURL, Provider, rbacApi, store } from '@acx-ui/store'
import { findTBody, mockServer, render, screen, waitFor, within }        from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions }                             from '@acx-ui/user'

import { mockedSubscriptions, mockedUserId, mockSubscriptionQuery } from './__fixtures__'
import { DataSubscription }                                         from './services'
import { DataSubscriptionsTable }                                   from './Table'

const { click } = userEvent
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn()
}))
const mockUserProfileRA = jest.mocked(getUserProfile)
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
const mockGet = get as jest.Mock

describe('DataSubscriptions table', () => {
  describe('RAI', () => {
    beforeEach(() => {
      setRaiPermissions({ WRITE_DATA_SUBSCRIPTIONS: true } as RaiPermissions)
      mockServer.use(
        mockSubscriptionQuery()
      )
      mockUserProfileRA.mockReturnValue({ userId: mockedUserId } as UserProfile)
      mockGet.mockReturnValue('true')
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.restoreAllMocks()
      store.dispatch(rbacApi.util.resetApiState())
      store.dispatch(notificationApi.util.resetApiState())
    })

    it('renders table with data and correct columns', async () => {
      render(<DataSubscriptionsTable isRAI />, { wrapper: Provider, route: {} })

      const tbody = within(await findTBody())
      expect(await tbody.findAllByRole('row')).toHaveLength(mockedSubscriptions.length)
      expect(await screen
        // column header count
        .findAllByRole('columnheader', { name: name => Boolean(name) })).toHaveLength(5)
      const firstRow = (await tbody.findAllByRole('row'))[0]
      const firstRowText = within(firstRow).getAllByRole('cell').map(cell =>
        cell.title)
      expect(firstRowText).toEqual([
        '', // checkbox
        mockedSubscriptions[0].name,
        mockedSubscriptions[0].userName,
        'Paused',
        mockedSubscriptions[0].frequency,
        formatter(DateFormatEnum.DateTimeFormat)(mockedSubscriptions[0].updatedAt),
        '' // settings
      ])
    })

    const findRowInTable = async (data: DataSubscription) => {
      render(<DataSubscriptionsTable isRAI />, { wrapper: Provider, route: {} })

      const element = await findTBody()
      expect(element).toBeVisible()

      const tbody = within(element)
      const targetRow = await tbody.findByRole('row',
        { name: (row) => row.includes(data.name) })
      return { targetRow }
    }

    const prepareResumeButton = async (dataSubscription: DataSubscription) => {
      const { targetRow } = await findRowInTable(dataSubscription)
      await click(targetRow)
      expect(await screen.findByRole('button', { name: 'Resume' })).toBeVisible()
    }

    it('handle resume', async () => {
      const patchFn = jest.fn()
      mockServer.use(
        rest.patch(
          `${notificationApiURL}/dataSubscriptions`,
          (req, res, ctx) => {
            patchFn(req.body)
            return res(ctx.json(null))
          })
      )

      const dataSubscription = mockedSubscriptions[0]
      await prepareResumeButton(dataSubscription)
      await click(await screen.findByRole('button', { name: 'Resume' }))

      await waitFor(() => {
        expect(patchFn).toBeCalledWith({
          dataSubscriptionIds: [dataSubscription.id],
          data: {
            status: true
          }
        })
      })
      expect(await screen.findByText(
        'The selected data subscription has been resumed successfully.')).toBeVisible()
    })

    it('handle resume RTKQuery error', async () => {
      mockServer.use(
        rest.patch(
          `${notificationApiURL}/dataSubscriptions`,
          (_, res) => res.networkError('Failed to connect'))
      )

      const dataSubscription = mockedSubscriptions[0]
      await prepareResumeButton(dataSubscription)
      await click(await screen.findByRole('button', { name: 'Resume' }))

      expect(await screen.findByText(
        'Failed to resume the selected data subscription.')).toBeVisible()
    })

    const preparePauseButton = async (dataSubscription: DataSubscription) => {
      const { targetRow } = await findRowInTable(dataSubscription)
      await click(targetRow)
      expect(await screen.findByRole('button', { name: 'Pause' })).toBeVisible()
    }

    it('handle pause', async () => {
      const patchFn = jest.fn()
      mockServer.use(
        rest.patch(
          `${notificationApiURL}/dataSubscriptions`,
          (req, res, ctx) => {
            patchFn(req.body)
            return res(ctx.json(null))
          })
      )

      const dataSubscription = mockedSubscriptions[1]
      await preparePauseButton(dataSubscription)
      await click(await screen.findByRole('button', { name: 'Pause' }))

      await waitFor(() => {
        expect(patchFn).toBeCalledWith({
          dataSubscriptionIds: [dataSubscription.id],
          data: {
            status: false
          }
        })
      })
      expect(await screen.findByText(
        'The selected data subscription has been paused successfully.')).toBeVisible()
    })

    it('handle pause RTKQuery error', async () => {
      mockServer.use(
        rest.patch(
          `${notificationApiURL}/dataSubscriptions`,
          (_, res) => res.networkError('Failed to connect'))
      )

      const dataSubscription = mockedSubscriptions[1]
      await preparePauseButton(dataSubscription)
      await click(await screen.findByRole('button', { name: 'Pause' }))

      expect(await screen.findByText(
        'Failed to pause the selected data subscription.')).toBeVisible()
    })

    it('handle edit', async () => {
      const dataSubscription = mockedSubscriptions[2]
      const { targetRow } = await findRowInTable(dataSubscription)

      await click(targetRow)
      expect(await screen.findByRole('button', { name: 'Edit' })).toBeVisible()

      await click(await screen.findByRole('button', { name: 'Edit' }))
      await waitFor(() =>
        expect(mockedUsedNavigate).toBeCalledWith({
          hash: '',
          pathname: `/ai/dataSubscriptions/edit/${dataSubscription.id}`,
          search: ''
        })
      )
    })

    const prepareDeleteDialog = async (dataSubscription: DataSubscription) => {
      const { targetRow } = await findRowInTable(dataSubscription)

      await click(targetRow)
      expect(await screen.findByRole('button', { name: 'Delete' })).toBeVisible()

      await click(await screen.findByRole('button', { name: 'Delete' }))
      const dialog = await screen.findByRole('dialog')
      expect(dialog).toBeVisible()
      expect(dialog).toHaveTextContent('Are you sure you want to delete this Data Subscription?')
      return { dialog }
    }

    it('handle delete', async () => {
      const deleteFn = jest.fn()
      mockServer.use(
        rest.delete(
          `${notificationApiURL}/dataSubscriptions`,
          (req, res, ctx) => {
            deleteFn(req.body)
            return res(ctx.json(null))
          })
      )

      const dataSubscription = mockedSubscriptions[3]
      const { dialog } = await prepareDeleteDialog(dataSubscription)
      await click(await within(dialog).findByRole('button', { name: 'Delete Data Subscription' }))

      await waitFor(() => {
        expect(deleteFn).toBeCalledWith([dataSubscription.id])
      })
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull()
      })
      expect(await screen.findByText(
        'The selected data subscription has been deleted successfully.')).toBeVisible()
    })

    it('handle delete RTKQuery error', async () => {
      mockServer.use(
        rest.delete(
          `${notificationApiURL}/dataSubscriptions`,
          (_, res) => res.networkError('Failed to connect'))
      )

      const dataSubscription = mockedSubscriptions[3]
      const { dialog } = await prepareDeleteDialog(dataSubscription)
      await click(await within(dialog).findByRole('button', { name: 'Delete Data Subscription' }))

      expect(await screen.findByText(
        'Failed to delete the selected data subscription.')).toBeVisible()
    })
  })

  // TODO: R1

})