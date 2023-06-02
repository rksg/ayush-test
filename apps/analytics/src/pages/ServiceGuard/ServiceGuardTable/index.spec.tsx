import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { serviceGuardApiURL, Provider } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  mockGraphqlMutation,
  within,
  findTBody
}                              from '@acx-ui/test-utils'

import * as fixtures            from '../__tests__/fixtures'
import { ServiceGuardTableRow } from '../services'

import { ServiceGuardTable, lastResultSort } from '.'

const mockedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}))
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({ data: { externalId: 'user-id' } })
}))

describe('Service Validation Table', () => {
  it('should render table with valid input', async () => {
    mockGraphqlQuery(serviceGuardApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
    render(<ServiceGuardTable/>, { wrapper: Provider, route: {} })
    const tbody = await findTBody()
    expect(tbody).toBeVisible()
    const body = within(tbody)
    expect(await screen.findByRole('table')).toBeVisible()
    expect(await body.findAllByRole('row')).toHaveLength(4)
    expect(await screen.findByText('test-1')).not.toHaveAttribute('href')
    expect(await screen.findByText('test-2')).toHaveAttribute('href')
    expect(await screen.findByText('test-3')).toHaveAttribute('href')
    expect(await screen.findByText('test-4')).toHaveAttribute('href')
  })

  it('should click run now', async () => {
    mockGraphqlQuery(serviceGuardApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
    mockGraphqlMutation(serviceGuardApiURL, 'RunServiceGuardTest',
      { data: fixtures.runServiceGuardTest })
    render(<ServiceGuardTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[1])
    await userEvent.click(await screen.findByRole('button', { name: /run now/i }))
    expect(await screen.findByText('Service Validation test running')).toBeVisible()
  })

  it('should not run test when apsPendingCount is more than 0', async () => {
    mockGraphqlQuery(serviceGuardApiURL, 'FetchAllServiceGuardSpecs', {
      data: {
        allServiceGuardSpecs: [{
          ...fixtures.fetchAllServiceGuardSpecs.allServiceGuardSpecs[0],
          tests: { items: [{
            id: 1,
            createdAt: '2023-02-24T07:34:33.336Z',
            summary: { apsTestedCount: 2, apsSuccessCount: 0, apsPendingCount: 2 }
          }] }
        }]
      }
    })
    render(<ServiceGuardTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    const runNowButton = await screen.findByRole('button', { name: /run now/i })
    expect(runNowButton).toBeDisabled()
  })

  it('should not allow run when apsCount is 0', async () => {
    mockGraphqlQuery(serviceGuardApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
    mockGraphqlMutation(serviceGuardApiURL, 'RunServiceGuardTest',
      { data: fixtures.runServiceGuardTest })
    render(<ServiceGuardTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    const runNowButton = await screen.findByRole('button', { name: /run now/i })
    expect(runNowButton).toBeDisabled()
  })

  it('should not allow run when test is in progress', async () => {
    mockGraphqlQuery(serviceGuardApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
    mockGraphqlMutation(serviceGuardApiURL, 'RunServiceGuardTest',
      { data: fixtures.runServiceGuardTest })
    render(<ServiceGuardTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[2])
    const runNowButton = await screen.findByRole('button', { name: /run now/i })
    expect(runNowButton).toBeDisabled()
  })

  it('should handle error', async () => {
    mockGraphqlQuery(serviceGuardApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
    mockGraphqlMutation(serviceGuardApiURL, 'RunServiceGuardTest', { data: {
      runServiceGuardTest: {
        userErrors: [{ field: 'spec', message: 'RUN_TEST_NO_APS' }]
      } } })
    render(<ServiceGuardTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[1])
    await userEvent.click(await screen.findByRole('button', { name: /run now/i }))
    expect(await screen.findByText('There are no APs to run the test')).toBeVisible()
  })

  it('should only allow edit for same user', async () => {
    mockGraphqlQuery(serviceGuardApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
    render(<ServiceGuardTable/>, {
      wrapper: Provider,
      route: { params: { tenantId: 'tenant-id' } }
    })
    const radio = await screen.findAllByRole('radio')

    await userEvent.click(radio[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    expect(mockedNavigate)
      .toBeCalledWith('/tenant-id/t/analytics/serviceValidation/spec-id/edit')

    await userEvent.click(radio[1])
    expect(await screen.findByRole('button', { name: 'Edit' })).toBeDisabled()
  })

  it('should delete test properly', async () => {
    mockGraphqlQuery(serviceGuardApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
    mockGraphqlMutation(serviceGuardApiURL, 'DeleteServiceGuardSpec',
      { data: fixtures.deleteServiceGuard })
    render(<ServiceGuardTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    await userEvent.click(await screen.findByText(/delete test/i))
    expect(await screen.findByText('Service Validation test deleted')).toBeVisible()
  })

  it('should clone test properly',async () => {
    mockGraphqlQuery(serviceGuardApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
    mockGraphqlMutation(serviceGuardApiURL, 'CloneServiceGuardSpec',
      { data: fixtures.cloneServiceGuard })
    mockGraphqlQuery(serviceGuardApiURL, 'ServiceGuardSpecNames',
      { data: fixtures.serviceGuardSpecNames })

    render(<ServiceGuardTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Clone' }))
    expect(await screen.findByText('Clone test')).toBeVisible()
    await userEvent.type(await screen.findByRole('textbox'), 'test-name')
    await userEvent.click(await screen.findByText('Save'))
    expect(await screen.findByText('Service Validation test cloned')).toBeVisible()
  })

  describe('lastResultSort', () => {
    const row = fixtures.fetchAllServiceGuardSpecs.allServiceGuardSpecs[0]
    const row1 = { ...row, latestTest: {
      summary: {
        apsTestedCount: 2,
        apsPendingCount: 0,
        apsSuccessCount: 2
      }
    } } as ServiceGuardTableRow
    const row2 = { ...row, latestTest: {
      summary: {
        apsTestedCount: 2,
        apsPendingCount: 0,
        apsSuccessCount: 1
      }
    } } as ServiceGuardTableRow
    const row3 = { ...row, latestTest: undefined } as ServiceGuardTableRow
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
