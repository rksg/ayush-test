import userEvent from '@testing-library/user-event'

import { get }                                       from '@acx-ui/config'
import { notificationApiURL, Provider }              from '@acx-ui/store'
import { render, screen, mockRestApiQuery, waitFor } from '@acx-ui/test-utils'

import { NotificationSettings } from '.'

const mockedUnwrap = jest.fn()
const mockedPrefMutation = jest.fn().mockImplementation(() => ({
  unwrap: mockedUnwrap
}))

jest.mock('@acx-ui/analytics/utils', () => ({
  getUserProfile: () => ({ email: 'test1@email.com' })
}))

jest.mock('@acx-ui/analytics/services', () => ({
  ...jest.requireActual('@acx-ui/analytics/services'),
  useSetNotificationMutation: () => [
    mockedPrefMutation, { reset: jest.fn() }
  ]
}))

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

const mockGet = jest.mocked(get)

describe('NotificationSettings', () => {
  beforeEach(() => {
    mockGet.mockClear()
    mockedUnwrap.mockImplementation(async () => {})
    mockedPrefMutation.mockClear()
    mockRestApiQuery(`${notificationApiURL}/preferences`, 'get', {
      data: {
        incident: {
          P1: ['email']
        },
        configRecommendation: {
          aiOps: ['email']
        }
      }
    }, true)
  })
  it('renders without license / emails', async () => {
    mockedUnwrap.mockImplementation(async () => ({ success: true }))
    mockGet.mockImplementationOnce(() => '')
    const apply = {}
    render(<NotificationSettings
      tenantId='test'
      apply={apply}
    />, { wrapper: Provider })
    expect(screen.queryByText('Licenses')).toBeNull()
    expect(screen.queryByText('Recipients')).toBeNull()
    const inputs = await screen.findAllByRole('checkbox')
    expect(inputs).toHaveLength(6)
    await userEvent.click(inputs[0])
    await userEvent.click(inputs[1])
    await userEvent.click(inputs[5])
    await apply.current()
    await waitFor(() => {
      expect(mockedPrefMutation).toHaveBeenLastCalledWith({
        tenantId: 'test',
        preferences: {
          incident: { P2: ['email'] }
        }
      })
    })
  })
  it('renders with license / emails', async () => {
    mockGet.mockReturnValue('true')
    const apply = {}
    render(<NotificationSettings
      tenantId='test'
      apply={apply}
    />, { wrapper: Provider })
    expect(await screen.findByText('Licenses')).toBeVisible()
    expect(await screen.findByText('Recipients')).toBeVisible()
    const input = await screen.findByRole('combobox')
    await userEvent.type(input, 'test@email.com')
    await userEvent.click(screen.getByTitle('test@email.com'))
    await apply.current()
    await waitFor(() => {
      expect(mockedPrefMutation).toHaveBeenLastCalledWith({
        tenantId: 'test',
        preferences: {
          configRecommendation: { aiOps: ['email'] },
          incident: { P1: ['email'] },
          recipients: ['test1@email.com', 'test@email.com']
        }
      })
    })
  })
  it('does not submit with empty recipients', async () => {
    mockGet.mockReturnValue('true')
    const apply = {}
    render(<NotificationSettings
      tenantId='test'
      apply={apply}
    />, { wrapper: Provider })
    await userEvent.click(await screen.findByTitle('test1@email.com'))
    await userEvent.click((await screen.findAllByTitle('test1@email.com'))[1])
    expect(await apply.current()).toEqual(false)
  })
})
