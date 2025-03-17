import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { getUserProfile as getUserProfileRA, UserProfile }                          from '@acx-ui/analytics/utils'
import { get }                                                                      from '@acx-ui/config'
import { DateFormatEnum, formatter }                                                from '@acx-ui/formatter'
import { notificationApi, notificationApiURL, Provider, rbacApi, store }            from '@acx-ui/store'
import { findTBody, mockRestApiQuery, mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'
import {
  getUserProfile as getUserProfileR1,
  hasRoles, RaiPermissions, setRaiPermissions, setUserProfile
} from '@acx-ui/user'

import { mockedConnectors, mockedUserId } from './__fixtures__'
import { DataConnectorTable }             from './Table'
import { DataConnector }                  from './types'

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
const mockUserProfileRA = jest.mocked(getUserProfileRA)
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
const mockGet = jest.mocked(get)
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  hasRoles: jest.fn()
}))
const mockHasRoles = jest.mocked(hasRoles)

describe('DataConnector table', () => {
  describe('RAI', () => {
    beforeEach(() => {
      mockGet.mockReturnValue('true')
      setRaiPermissions({ WRITE_DATA_CONNECTOR: true } as RaiPermissions)
      mockUserProfileRA.mockReturnValue({ userId: mockedUserId } as UserProfile)
      mockRestApiQuery(`${notificationApiURL}/dataConnector/query`, 'post', {
        data: mockedConnectors, page: 1, totalCount: mockedConnectors.length
      })
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.restoreAllMocks()
      store.dispatch(rbacApi.util.resetApiState())
      store.dispatch(notificationApi.util.resetApiState())
    })

    it('renders table with data and correct columns', async () => {
      render(<DataConnectorTable />, { wrapper: Provider, route: {} })

      const tbody = within(await findTBody())
      expect(await tbody.findAllByRole('row')).toHaveLength(mockedConnectors.length)
      expect(await screen
        // column header count
        .findAllByRole('columnheader', { name: name => Boolean(name) })).toHaveLength(5)
      const firstRow = (await tbody.findAllByRole('row'))[0]
      const firstRowText = within(firstRow).getAllByRole('cell').map(cell =>
        cell.title)
      expect(firstRowText).toEqual([
        '', // checkbox
        mockedConnectors[0].name,
        mockedConnectors[0].userName,
        'Paused',
        'Daily',
        formatter(DateFormatEnum.DateTimeFormat)(mockedConnectors[0].updatedAt),
        '' // settings
      ])
    })

    const findRowInTable = async (data: DataConnector) => {
      render(<DataConnectorTable />, { wrapper: Provider, route: {} })

      const element = await findTBody()
      expect(element).toBeVisible()

      const tbody = within(element)
      const targetRow = await tbody.findByRole('row',
        { name: (row) => row.includes(data.name) })
      return { targetRow }
    }

    const prepareResumeButton = async (dataConnector: DataConnector) => {
      const { targetRow } = await findRowInTable(dataConnector)
      await click(targetRow)
      expect(await screen.findByRole('button', { name: 'Resume' })).toBeVisible()
    }

    it('handle resume', async () => {
      const patchFn = jest.fn()
      mockServer.use(
        rest.patch(
          `${notificationApiURL}/dataConnector`,
          (req, res, ctx) => {
            patchFn(req.body)
            return res(ctx.json(null))
          })
      )

      const dataConnector = mockedConnectors[0]
      await prepareResumeButton(dataConnector)
      await click(await screen.findByRole('button', { name: 'Resume' }))

      await waitFor(() => {
        expect(patchFn).toBeCalledWith({
          ids: [dataConnector.id],
          data: {
            status: true
          }
        })
      })
      expect(await screen.findByText(
        'The selected data connector has been resumed successfully.')).toBeVisible()
    })

    it('handle resume RTKQuery error', async () => {
      mockServer.use(
        rest.patch(
          `${notificationApiURL}/dataConnector`,
          (_, res) => res.networkError('Failed to connect'))
      )

      const dataConnector = mockedConnectors[0]
      await prepareResumeButton(dataConnector)
      await click(await screen.findByRole('button', { name: 'Resume' }))

      expect(await screen.findByText(
        'Failed to resume the selected data connector.')).toBeVisible()
    })

    const preparePauseButton = async (dataConnector: DataConnector) => {
      const { targetRow } = await findRowInTable(dataConnector)
      await click(targetRow)
      expect(await screen.findByRole('button', { name: 'Pause' })).toBeVisible()
    }

    it('handle pause', async () => {
      const patchFn = jest.fn()
      mockServer.use(
        rest.patch(
          `${notificationApiURL}/dataConnector`,
          (req, res, ctx) => {
            patchFn(req.body)
            return res(ctx.json(null))
          })
      )

      const dataConnector = mockedConnectors[1]
      await preparePauseButton(dataConnector)
      await click(await screen.findByRole('button', { name: 'Pause' }))

      await waitFor(() => {
        expect(patchFn).toBeCalledWith({
          ids: [dataConnector.id],
          data: {
            status: false
          }
        })
      })
      expect(await screen.findByText(
        'The selected data connector has been paused successfully.')).toBeVisible()
    })

    it('handle pause RTKQuery error', async () => {
      mockServer.use(
        rest.patch(
          `${notificationApiURL}/dataConnector`,
          (_, res) => res.networkError('Failed to connect'))
      )

      const dataConnector = mockedConnectors[1]
      await preparePauseButton(dataConnector)
      await click(await screen.findByRole('button', { name: 'Pause' }))

      expect(await screen.findByText(
        'Failed to pause the selected data connector.')).toBeVisible()
    })

    it('handle edit', async () => {
      const dataConnector = mockedConnectors[2]
      const { targetRow } = await findRowInTable(dataConnector)

      await click(targetRow)
      expect(await screen.findByRole('button', { name: 'Edit' })).toBeVisible()

      await click(await screen.findByRole('button', { name: 'Edit' }))
      await waitFor(() =>
        expect(mockedUsedNavigate).toBeCalledWith({
          hash: '',
          pathname: `/ai/dataConnector/edit/${dataConnector.id}`,
          search: ''
        })
      )
    })

    it(
      // eslint-disable-next-line max-len
      'should navigate to audit log page when data connector name is clicked and user is data connector owner',
      async () => {
        const dataConnector = mockedConnectors[0]
        const { targetRow } = await findRowInTable(dataConnector)
        const dataConnectorNameLink = (
          within(targetRow).getByRole('link', {
            name: dataConnector.name
          }) as HTMLAnchorElement
        ).href

        expect(dataConnectorNameLink).toContain(
          `/ai/dataConnector/auditLog/${dataConnector.id}`
        )
      })

    it('data connector name should not be clickable when user is not data connector owner',
      async () => {
        const dataConnector = mockedConnectors[9]
        const { targetRow } = await findRowInTable(dataConnector)
        const dataConnectorNameCell = within(targetRow).getByRole('cell', {
          name: dataConnector.name
        })
        expect(dataConnectorNameCell).not.toHaveAttribute('href')
      })
  })

  describe('R1', () => {
    beforeEach(() => {
      mockGet.mockReturnValue('') // R1
      mockHasRoles.mockReturnValue(true)
      setUserProfile({
        allowedOperations: [],
        profile: { ...getUserProfileR1().profile, externalId: mockedUserId }
      })
      mockRestApiQuery(`${notificationApiURL}/dataConnector/query`, 'post', {
        data: mockedConnectors, page: 1, totalCount: mockedConnectors.length
      })
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.restoreAllMocks()
      store.dispatch(rbacApi.util.resetApiState())
      store.dispatch(notificationApi.util.resetApiState())
    })

    it('renders table with data and correct columns', async () => {
      render(<DataConnectorTable />, { wrapper: Provider, route: {} })

      const tbody = within(await findTBody())
      expect(await tbody.findAllByRole('row')).toHaveLength(mockedConnectors.length)
      expect(await screen
        // column header count
        .findAllByRole('columnheader', { name: name => Boolean(name) })).toHaveLength(5)
      const firstRow = (await tbody.findAllByRole('row'))[0]
      const firstRowText = within(firstRow).getAllByRole('cell').map(cell =>
        cell.title)
      expect(firstRowText).toEqual([
        '', // checkbox
        mockedConnectors[0].name,
        mockedConnectors[0].userName,
        'Paused',
        'Daily',
        formatter(DateFormatEnum.DateTimeFormat)(mockedConnectors[0].updatedAt),
        '' // settings
      ])
    })

    it(
      // eslint-disable-next-line max-len
      'should navigate to audit log page when data connector name is clicked and user is data connector owner',
      async () => {
        const dataConnector = mockedConnectors[0]
        render(<DataConnectorTable />, { wrapper: Provider, route: {} })
        const element = await findTBody()
        const tbody = within(element)
        const targetRow = (await tbody.findAllByRole('row'))[0]
        const dataConnectorNameLink = (
          within(targetRow).getByRole('link', {
            name: dataConnector.name
          }) as HTMLAnchorElement
        ).href

        expect(dataConnectorNameLink).toContain(
          `/dataConnector/auditLog/${dataConnector.id}`
        )
      })

    it('data connector name should not be clickable when user is not data connector owner',
      async () => {
        const dataConnector = mockedConnectors[9]
        render(<DataConnectorTable />, { wrapper: Provider, route: {} })
        const element = await findTBody()
        const tbody = within(element)
        const targetRow = (await tbody.findAllByRole('row'))[9]
        const dataConnectorNameCell = within(targetRow).getByRole('cell', {
          name: dataConnector.name
        })
        expect(dataConnectorNameCell).not.toHaveAttribute('href')
      })
  })
})