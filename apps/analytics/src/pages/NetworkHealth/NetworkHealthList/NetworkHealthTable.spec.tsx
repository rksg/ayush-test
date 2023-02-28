import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { networkHealthApiURL } from '@acx-ui/analytics/services'
import { UserProfileProvider } from '@acx-ui/rc/components'
import { CommonUrlsInfo }      from '@acx-ui/rc/utils'
import { Provider }            from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  mockServer,
  act,
  mockGraphqlMutation,
  within,
  findTBody
}                              from '@acx-ui/test-utils'

import * as fixtures from '../__tests__/fixtures'

import { NetworkHealthTable } from './NetworkHealthTable'

const mockedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}))

const fakeUserProfile = {
  tenantId: 'tenantId',
  externalId: 'user-id',
  firstName: 'firstName',
  lastName: 'lastName'
}

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: () => ({ tenantId: fakeUserProfile.tenantId })
}))

describe('Network Health Table', () => {
  it('should render table with valid input', async () => {
    mockGraphqlQuery(networkHealthApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs }
    )
    render(<NetworkHealthTable/>, { wrapper: Provider, route: {} })
    const tbody = await findTBody()
    expect(tbody).toBeVisible()
    const body = within(tbody)
    expect(await screen.findByRole('table')).toBeVisible()
    expect(await body.findAllByRole('row')).toHaveLength(2)
  })

  it('should click run now', async () => {
    mockGraphqlQuery(networkHealthApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
    mockGraphqlMutation(networkHealthApiURL, 'RunNetworkHealthTest',
      { data: fixtures.runServiceGuardTest }
    )
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
          ...fixtures.fetchAllServiceGuardSpecs.allServiceGuardSpecs[0],
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
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    })
    const runNowButton = await screen.findByRole('button', { name: /run now/i })
    expect(runNowButton).toBeDisabled()
  })

  it('should not run test when apsCount is 0', async () => {
    mockGraphqlQuery(networkHealthApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
    mockGraphqlMutation(networkHealthApiURL, 'RunNetworkHealthTest',
      { data: fixtures.runServiceGuardTest })
    render(<NetworkHealthTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    })
    const runNowButton = await screen.findByRole('button', { name: /run now/i })
    expect(runNowButton).toBeDisabled()
  })

  it('should handle error', async () => {
    mockGraphqlQuery(networkHealthApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
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

  it('should click edit', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getUserProfile.url, (req, res, ctx) => res(ctx.json(fakeUserProfile)))
    )
    mockGraphqlQuery(networkHealthApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
    render(<UserProfileProvider><NetworkHealthTable/></UserProfileProvider>, {
      wrapper: Provider,
      route: { params: { tenantId: 'tenant-id' } }
    })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    expect(await mockedNavigate)
      .toBeCalledWith('/t/tenant-id/serviceValidation/networkHealth/spec-id/edit')
  })

  it('should disable edit button', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getUserProfile.url, (req, res, ctx) => res(ctx.json(fakeUserProfile)))
    )
    mockGraphqlQuery(networkHealthApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
    render(<UserProfileProvider><NetworkHealthTable/></UserProfileProvider>, {
      wrapper: Provider,
      route: { params: { tenantId: 'tenant-id' } }
    })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[1])
    const editButton = await screen.findByRole('button', { name: 'Edit' })
    expect(editButton).toBeDisabled()
  })

  it('should delete test properly', async () => {
    mockGraphqlQuery(networkHealthApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
    mockGraphqlMutation(networkHealthApiURL, 'DeleteServiceGuardSpec',
      { data: fixtures.deleteNetworkHealth })
    render(<NetworkHealthTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    await userEvent.click(await screen.findByText(/delete test/i))
    expect(await screen.findByText('Network Health test deleted')).toBeVisible()
  })

  it('should clone test properly',async () => {
    mockGraphqlQuery(networkHealthApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
    mockGraphqlMutation(networkHealthApiURL, 'CloneServiceGuardSpec',
      { data: fixtures.cloneNetworkHealth })
    render(<NetworkHealthTable/>, { wrapper: Provider, route: {} })
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Clone' }))
    expect(await screen.findByText('Clone test')).toBeVisible()
    await userEvent.type(await screen.findByRole('textbox'), 'test-name')
    await userEvent.click(await screen.findByText('Save'))
    expect(await screen.findByText('Network Health test cloned')).toBeVisible()
  })
})
