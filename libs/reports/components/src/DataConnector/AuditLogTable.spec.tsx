import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { get }                                from '@acx-ui/config'
import { DateFormatEnum, formats, formatter } from '@acx-ui/formatter'
import {
  notificationApi,
  notificationApiURL,
  Provider,
  rbacApi,
  store
} from '@acx-ui/store'
import {
  findTBody,
  mockRestApiQuery,
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions } from '@acx-ui/user'

import { mockAuditLogs }                from './__fixtures__'
import AuditLogTable, { getRetryError } from './AuditLogTable'
import { AuditDto, AuditStatusEnum }    from './types'

const mockDataConnectorId = 'mock-data-connector-id'
const mockMoreThan3DaysBeforeNow = '2025-01-10T02:48:40.069Z'
const mockLessThan3DaysBeforeNow = '2025-01-18T02:48:40.069Z'
const { click } = userEvent

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
const mockGet = jest.mocked(get)
jest.mock('moment', () => {
  const moment = jest.requireActual('moment')
  const m = jest.fn((...args) => {
    if (args.length === 0) {
      // Return the fixed date-time for moment()
      return moment('2025-01-20T02:48:40.069Z')
    }
    // Use the original moment function for moment(params)
    return moment(...args)
  })
  m.utc = m
  return m
})

describe('AuditLogTable', () => {
  beforeEach(() => {
    mockGet.mockReturnValue('true')
    setRaiPermissions({ WRITE_DATA_CONNECTOR: true } as RaiPermissions)
    mockRestApiQuery(
      `${notificationApiURL}/dataConnector/audit/query`,
      'post',
      {
        data: mockAuditLogs,
        page: 1,
        totalCount: mockAuditLogs.length
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    store.dispatch(rbacApi.util.resetApiState())
    store.dispatch(notificationApi.util.resetApiState())
  })

  it('renders table with data and columns correctly', async () => {
    render(<AuditLogTable dataConnectorId={mockDataConnectorId} />, {
      wrapper: Provider
    })

    const tbody = within(await findTBody())
    expect(await tbody.findAllByRole('row')).toHaveLength(
      mockAuditLogs.length
    )
    expect(
      (
        await screen.findAllByRole('columnheader', {
          name: (name) => Boolean(name)
        })
      ).map((cell) => cell.textContent)
    ).toEqual([
      'Last update',
      'Status',
      'Size transferred',
      'Export start',
      'Export end'
    ])

    const firstRow = (await tbody.findAllByRole('row'))[0]
    const firstRowText = within(firstRow)
      .getAllByRole('cell')
      .map((cell) => cell.textContent)

    const { updatedAt, size, start, end } = mockAuditLogs[0]
    expect(firstRowText).toEqual([
      '', // checkbox
      formatter(DateFormatEnum.DateTimeFormat)(updatedAt),
      'Success',
      formats.bytesFormat(size),
      formatter(DateFormatEnum.DateTimeFormat)(start),
      formatter(DateFormatEnum.DateTimeFormat)(end),
      '' // settings
    ])
  })

  it.each([0, 1])(
    'should render enabled radio button when audit is retryable',
    async (rowIndex) => {
      render(<AuditLogTable dataConnectorId={mockDataConnectorId} />, {
        wrapper: Provider
      })

      const tbody = within(await findTBody())
      const retryableRow = (await tbody.findAllByRole('row'))[rowIndex]
      const retryableRowCheckbox = within(retryableRow).getByRole('radio')

      expect(retryableRowCheckbox).toBeEnabled()
    }
  )

  it.each([2, 3, 4, 5])(
    'should render disabled radio button when audit is not retryable',
    async (rowIndex) => {
      render(<AuditLogTable dataConnectorId={mockDataConnectorId} />, {
        wrapper: Provider
      })

      const tbody = within(await findTBody())
      const notRetryableRow = (await tbody.findAllByRole('row'))[rowIndex]
      const notRetryableRowCheckbox =
        within(notRetryableRow).getByRole('radio')

      expect(notRetryableRowCheckbox).toBeDisabled()
    }
  )

  it('handle error tooltip when failed with quota exceeded', async () => {
    render(<AuditLogTable dataConnectorId={mockDataConnectorId} />, {
      wrapper: Provider
    })
    const tbody = within(await findTBody())
    const retryableRow = (await tbody.findAllByRole('row'))[6]
    const retryableRowCheckbox = within(retryableRow).getByRole('radio')
    expect(retryableRowCheckbox).toBeEnabled()
    const statusCell = await within(retryableRow).findByText('Failure')
    await userEvent.hover(statusCell)
    expect(
      await screen.findByRole('tooltip')
    ).toHaveTextContent(/Quota exceeded/)
  })

  it('handle retry, should show success toast when successful', async () => {
    const postFn = jest.fn()

    mockServer.use(
      rest.post(
        `${notificationApiURL}/dataConnector/retry/:id`,
        (req, res, ctx) => {
          postFn(req.body)
          return res(ctx.json('new-audit-id'))
        }
      )
    )

    render(<AuditLogTable dataConnectorId={mockDataConnectorId} />, {
      wrapper: Provider,
      route: {}
    })

    const element = await findTBody()
    expect(element).toBeVisible()
    const tbody = within(element)
    const retryableRow = (await tbody.findAllByRole('row'))[0]

    await click(within(retryableRow).getByRole('radio'))
    expect(
      await screen.findByRole('button', { name: 'Retry' })
    ).toBeVisible()
    await click(await screen.findByRole('button', { name: 'Retry' }))

    await waitFor(() => expect(postFn).toBeCalled())
    expect(
      await screen.findByText(
        'The selected audit has been retried successfully.'
      )
    ).toBeVisible()
  })

  it('handle retry, should show error toast when failed', async () => {
    const postFn = jest.fn()
    mockServer.use(
      rest.post(
        `${notificationApiURL}/dataConnector/retry/:id`,
        (req, res, ctx) => {
          postFn(req.body)
          return res(ctx.status(500))
        }
      )
    )

    render(<AuditLogTable dataConnectorId={mockDataConnectorId} />, {
      wrapper: Provider,
      route: {}
    })

    const element = await findTBody()
    expect(element).toBeVisible()
    const tbody = within(element)
    const retryableRow = (await tbody.findAllByRole('row'))[0]

    await click(within(retryableRow).getByRole('radio'))
    expect(
      await screen.findByRole('button', { name: 'Retry' })
    ).toBeVisible()
    await click(await screen.findByRole('button', { name: 'Retry' }))

    await waitFor(() => expect(postFn).toBeCalled())
    expect(
      await screen.findByText('Failed to retry selected audit.')
    ).toBeVisible()
  })
})

describe('getRetryError', () => {
  it('should return undefined when audit is undefined', () =>
    expect(getRetryError(undefined)).toBeUndefined())

  it('should return error message when audit status is not in retryableStatus', () => {
    expect(getRetryError({ status: AuditStatusEnum.Scheduled } as AuditDto))
      .toEqual('Connector is Scheduled')
  })

  it.each([
    [AuditStatusEnum.Success, mockMoreThan3DaysBeforeNow],
    [AuditStatusEnum.Failure, mockMoreThan3DaysBeforeNow]
  ])(
    'should return error message when status is retryable and start is more than 3 days ago',
    (status, start) =>
      expect(getRetryError({ status, start } as AuditDto)).toEqual(
        'Connector can only be retried within 3 days from start date'
      )
  )

  it.each([
    [AuditStatusEnum.Success, mockLessThan3DaysBeforeNow],
    [AuditStatusEnum.Failure, mockLessThan3DaysBeforeNow]
  ])(
    'should return error message when status is retryable and start is more than 3 days ago',
    (status, start) =>
      expect(getRetryError({ status, start } as AuditDto)).toBeUndefined()
  )
})
