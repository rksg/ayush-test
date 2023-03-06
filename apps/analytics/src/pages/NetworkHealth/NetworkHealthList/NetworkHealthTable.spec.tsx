import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { networkHealthApiURL } from '@acx-ui/analytics/services'
import { Provider }            from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  mockGraphqlMutation,
  within,
  findTBody
}                              from '@acx-ui/test-utils'

import {
  deleteNetworkHealth,
  fetchAllServiceGuardSpecs,
  runServiceGuardTest
} from '../__tests__/fixtures'

import { NetworkHealthTable, lastResultSort } from './NetworkHealthTable'

const mockedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}))
jest.mock('@acx-ui/user', () => ({
  useUserProfileContext: () => ({ data: { externalId: 'user-id' } })
}))

describe('Network Health Table', () => {
  it('should render table with valid input', async () => {
    mockGraphqlQuery(
      networkHealthApiURL, 'FetchAllServiceGuardSpecs', { data: fetchAllServiceGuardSpecs })
    render(<NetworkHealthTable/>, { wrapper: Provider, route: {} })
    const tbody = await findTBody()
    expect(tbody).toBeVisible()
    const body = within(tbody)
    expect(await screen.findByRole('table')).toBeVisible()
    expect(await body.findAllByRole('row')).toHaveLength(3)
  })

  it('should click run now', async () => {
    mockGraphqlQuery(
      networkHealthApiURL, 'FetchAllServiceGuardSpecs', { data: fetchAllServiceGuardSpecs })
    mockGraphqlMutation(networkHealthApiURL, 'RunNetworkHealthTest', { data: runServiceGuardTest })
    render(<NetworkHealthTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[1])
    await userEvent.click(await screen.findByRole('button', { name: /run now/i }))
    expect(await screen.findByText('Network Health test running')).toBeVisible()
  })

  it('should not run test when apsPendingCount is more than 0', async () => {
    mockGraphqlQuery(networkHealthApiURL, 'FetchAllServiceGuardSpecs', {
      data: {
        allServiceGuardSpecs: [{
          ...fetchAllServiceGuardSpecs.allServiceGuardSpecs[0],
          tests: { items: [{
            id: 1,
            createdAt: '2023-02-24T07:34:33.336Z',
            summary: { apsTestedCount: 2, apsSuccessCount: 0, apsPendingCount: 2 }
          }] }
        }]
      }
    })
    render(<NetworkHealthTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    const runNowButton = await screen.findByRole('button', { name: /run now/i })
    expect(runNowButton).toBeDisabled()
  })

  it('should not allow run when apsCount is 0', async () => {
    mockGraphqlQuery(
      networkHealthApiURL, 'FetchAllServiceGuardSpecs', { data: fetchAllServiceGuardSpecs })
    mockGraphqlMutation(networkHealthApiURL, 'RunNetworkHealthTest', { data: runServiceGuardTest })
    render(<NetworkHealthTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    const runNowButton = await screen.findByRole('button', { name: /run now/i })
    expect(runNowButton).toBeDisabled()
  })

  it('should not allow run when test is in progress', async () => {
    mockGraphqlQuery(
      networkHealthApiURL, 'FetchAllServiceGuardSpecs', { data: fetchAllServiceGuardSpecs })
    mockGraphqlMutation(networkHealthApiURL, 'RunNetworkHealthTest', { data: runServiceGuardTest })
    render(<NetworkHealthTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[2])
    const runNowButton = await screen.findByRole('button', { name: /run now/i })
    expect(runNowButton).toBeDisabled()
  })

  it('should handle error', async () => {
    mockGraphqlQuery(
      networkHealthApiURL, 'FetchAllServiceGuardSpecs', { data: fetchAllServiceGuardSpecs })
    mockGraphqlMutation(networkHealthApiURL, 'RunNetworkHealthTest', { data: {
      runServiceGuardTest: {
        userErrors: [{ field: 'spec', message: 'RUN_TEST_NO_APS' }]
      } } })
    render(<NetworkHealthTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[1])
    await userEvent.click(await screen.findByRole('button', { name: /run now/i }))
    expect(await screen.findByText('There are no APs to run the test')).toBeVisible()
  })

  it('should only allow edit for same user', async () => {
    mockGraphqlQuery(
      networkHealthApiURL, 'FetchAllServiceGuardSpecs', { data: fetchAllServiceGuardSpecs })
    render(<NetworkHealthTable/>, {
      wrapper: Provider,
      route: { params: { tenantId: 'tenant-id' } }
    })
    const radio = await screen.findAllByRole('radio')

    await userEvent.click(radio[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    expect(mockedNavigate)
      .toBeCalledWith('/t/tenant-id/serviceValidation/networkHealth/spec-id/edit')

    await userEvent.click(radio[1])
    expect(await screen.findByRole('button', { name: 'Edit' })).toBeDisabled()
  })

  it('should delete test properly', async () => {
    mockGraphqlQuery(
      networkHealthApiURL, 'FetchAllServiceGuardSpecs', { data: fetchAllServiceGuardSpecs })
    mockGraphqlMutation(
      networkHealthApiURL, 'DeleteServiceGuardSpec', { data: deleteNetworkHealth })
    render(<NetworkHealthTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    await userEvent.click(await screen.findByText(/delete test/i))
    expect(await screen.findByText('Network Health test deleted')).toBeVisible()
  })

  describe('lastResultSort', () => {
    const row = fetchAllServiceGuardSpecs.allServiceGuardSpecs[0]
    const row1 = { ...row, latestTest: {
      summary: {
        apsTestedCount: 2,
        apsPendingCount: 0,
        apsSuccessCount: 2
      }
    } }
    const row2 = { ...row, latestTest: {
      summary: {
        apsTestedCount: 2,
        apsPendingCount: 0,
        apsSuccessCount: 1
      }
    } }
    const row3 = { ...row, latestTest: undefined }
    it('should return 1', () => {
      expect(lastResultSort(row1, row2)).toEqual(1)
    })
    it('should return -1', () => {
      expect(lastResultSort(row2, row1)).toEqual(-1)
    })
    it('should return 0', () => {
      expect(lastResultSort(row1, row1)).toEqual(0)
    })
    it('should return 1 when comparing undefined', () => {
      expect(lastResultSort(row1, row3)).toEqual(1)
    })
    it('should return -1 when comparing undefined', () => {
      expect(lastResultSort(row3, row1)).toEqual(-1)
    })
    it('should return 0 when comparing undefined', () => {
      expect(lastResultSort(row3, row3)).toEqual(0)
    })
  })
})
