import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { networkHealthApi, networkHealthApiURL } from '@acx-ui/analytics/services'
import { noDataSymbol }                          from '@acx-ui/analytics/utils'
import { UserProfileProvider }                   from '@acx-ui/rc/components'
import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { BrowserRouter as Router }               from '@acx-ui/react-router-dom'
import { Provider, store }                       from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved,
  mockServer,
  act,
  mockGraphqlMutation
}                                              from '@acx-ui/test-utils'

import { api } from './services'

import { getAPsUnderTest, getLastResult, getLastRun, NetworkHealthTable } from './index'

const mockedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}))

const fakeUserProfile = {
  tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
  externalId: '0032h00000LUqUKAA1',
  firstName: 'FisrtName 1093',
  lastName: 'LastName 1093'
}

const fakeDisabledUserProfile = {
  tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
  externalId: '0032h00000LUqUKAA2',
  firstName: 'FisrtName 1093',
  lastName: 'LastName 1093'
}

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: () => ({ tenantId: fakeUserProfile.tenantId })
}))

const networkHealthTests = [
  {
    id: '3d51e2f0-6a1f-4641-94a4-9feb3803edff',
    name: 'testCase 1',
    type: 'on-demand',
    apsCount: 13,
    userId: '0032h00000LUqUKAA1',
    clientType: 'virtual-client',
    schedule: null,
    tests: {
      items: [{
        id: 1,
        createdAt: '2023-02-06T20:00:00.000Z',
        summary: {
          apsTestedCount: 10,
          apsSuccessCount: 2,
          apsPendingCount: 0
        }
      }]
    }
  },
  {
    id: '3d51e2f0-6a1f-4641-94a4-9feb3803edfg',
    name: 'testCase 2',
    type: 'on-demand',
    apsCount: 0,
    userId: '0032h00000LUqUKAA1',
    clientType: 'virtual-wireless-client',
    schedule: null,
    tests: {
      items: [{
        id: 2,
        createdAt: '2023-02-06T21:00:00.000Z',
        summary: {
          apsTestedCount: 0,
          apsSuccessCount: 0,
          apsPendingCount: 0
        }
      }]
    }
  }
]

describe('Network Health Table', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    store.dispatch(networkHealthApi.util.resetApiState())
  })

  it('should render loader', () => {
    mockGraphqlQuery(networkHealthApiURL, 'ServiceGuardSpecs', {
      data: {
        allServiceGuardSpecs: []
      }
    })
    render(<Router>
      <Provider>
        <NetworkHealthTable/>
      </Provider>
    </Router>)
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
  })

  it('should render table with valid input', async () => {
    mockGraphqlQuery(networkHealthApiURL, 'ServiceGuardSpecs', {
      data: {
        allServiceGuardSpecs: networkHealthTests
      }
    })

    const { asFragment } = render(<Provider>
      <NetworkHealthTable/>
    </Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: {
          tenantId: fakeUserProfile.tenantId
        }
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })

  const columnHeaders = [
    { name: 'Test Name', count: 1 },
    { name: 'Client Type', count: 2 },
    { name: 'Test Type', count: 2 },
    { name: 'APs', count: 1 },
    { name: 'Last Run', count: 1 },
    { name: 'APs Under Test', count: 1 },
    { name: 'Last Result', count: 1 }
  ]

  it('should render column header', async () => {
    mockGraphqlQuery(networkHealthApiURL, 'ServiceGuardSpecs', {
      data: {
        allServiceGuardSpecs: networkHealthTests
      }
    })

    render(<Provider><NetworkHealthTable/></Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: {
          tenantId: fakeUserProfile.tenantId
        }
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: /loader/ }))

    for (let i = 0; i < columnHeaders.length; i++) {
      const header = columnHeaders[i]
      const currHeader = await screen.findAllByText(header.name)
      expect(currHeader).toHaveLength(header.count)
    }
  })

  it('should click run now', async () => {
    const expected = {
      selectedId: '3d51e2f0-6a1f-4641-94a4-9feb3803edff',
      userErrors: null
    }
    mockGraphqlQuery(networkHealthApiURL, 'ServiceGuardSpecs', {
      data: {
        allServiceGuardSpecs: networkHealthTests
      }
    })

    render(<Provider><NetworkHealthTable/></Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: {
          tenantId: fakeUserProfile.tenantId
        }
      }
    })

    const radio = await screen.findAllByRole('radio')
    userEvent.click(radio[0])
    mockGraphqlMutation(networkHealthApiURL, 'RunNetworkHealthTest', {
      data: { runServiceGuardTest: expected }
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    })
    userEvent.click(await screen.findByRole('button', { name: /run now/i }))
    expect(await screen.findByText('Network Health test running')).toBeVisible()
  })

  it('should not run test when apsPendingCount is more than 0', async () => {
    const expected = {
      selectedId: null,
      userErrors: [{ field: 'spec', message: 'TEST_IN_PROGRESS' }]
    }
    mockGraphqlQuery(networkHealthApiURL, 'ServiceGuardSpecs', {
      data: {
        allServiceGuardSpecs: networkHealthTests
      }
    })

    render(<Provider><NetworkHealthTable/></Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: {
          tenantId: fakeUserProfile.tenantId
        }
      }
    })

    const radio = await screen.findAllByRole('radio')
    userEvent.click(radio[0])
    mockGraphqlMutation(networkHealthApiURL, 'RunNetworkHealthTest', {
      data: { runServiceGuardTest: expected }
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    })
    userEvent.click(await screen.findByRole('button', { name: /run now/i }))
    expect(await screen.findByText('Test is in progress')).toBeVisible()
  })

  it('should not run test when apsCount is 0', async () => {
    const expected = {
      selectedId: null,
      userErrors: [{ field: 'spec', message: 'RUN_TEST_NO_APS' }]
    }
    mockGraphqlQuery(networkHealthApiURL, 'ServiceGuardSpecs', {
      data: {
        allServiceGuardSpecs: networkHealthTests
      }
    })

    render(<Provider><NetworkHealthTable/></Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: {
          tenantId: fakeUserProfile.tenantId
        }
      }
    })

    const radio = await screen.findAllByRole('radio')
    userEvent.click(radio[0])
    mockGraphqlMutation(networkHealthApiURL, 'RunNetworkHealthTest', {
      data: { runServiceGuardTest: expected }
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    })
    userEvent.click(await screen.findByRole('button', { name: /run now/i }))
    expect(await screen.findByText('There are no APs to run the test')).toBeVisible()
  })

  it('should disable run now button', async () => {
    mockGraphqlQuery(networkHealthApiURL, 'ServiceGuardSpecs', {
      data: {
        allServiceGuardSpecs: networkHealthTests
      }
    })

    render(<Provider><NetworkHealthTable/></Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: {
          tenantId: fakeUserProfile.tenantId
        }
      }
    })

    const radio = await screen.findAllByRole('radio')
    userEvent.click(radio[1])
    const runNowButton = await screen.findByRole('button', { name: /run now/i })
    expect(runNowButton).toBeDisabled()
  })

  it('should click edit', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getUserProfile.url, (req, res, ctx) => res(ctx.json(fakeUserProfile)))
    )
    mockGraphqlQuery(networkHealthApiURL, 'ServiceGuardSpecs', {
      data: {
        allServiceGuardSpecs: networkHealthTests
      }
    })
    render(<Provider>
      <UserProfileProvider>
        <NetworkHealthTable/>
      </UserProfileProvider>
    </Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: {
          tenantId: fakeUserProfile.tenantId
        }
      }
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    })
    const radio = await screen.findAllByRole('radio')
    userEvent.click(radio[0])
    userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    })
    expect(mockedNavigate.mock.calls[0][0]).toEqual(
      `/t/${fakeUserProfile.tenantId}/serviceValidation/networkHealth/` +
      `${networkHealthTests[0].id}/edit`
    )
  })

  it('should disable edit button', async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getUserProfile.url, (req, res, ctx) => res(
          ctx.json(fakeDisabledUserProfile)))
    )
    mockGraphqlQuery(networkHealthApiURL, 'ServiceGuardSpecs', {
      data: {
        allServiceGuardSpecs: networkHealthTests
      }
    })
    render(<Provider>
      <UserProfileProvider>
        <NetworkHealthTable/>
      </UserProfileProvider>
    </Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: {
          tenantId: fakeDisabledUserProfile.tenantId
        }
      }
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    })
    const radio = await screen.findAllByRole('radio')
    userEvent.click(radio[0])
    const editButton = await screen.findByRole('button', { name: 'Edit' })
    expect(editButton).toBeDisabled()
  })

  it('should throw error when deleting test which does not exist', async () => {
    mockGraphqlQuery(networkHealthApiURL, 'ServiceGuardSpecs', {
      data: {
        allServiceGuardSpecs: networkHealthTests
      }
    })
    mockGraphqlMutation(networkHealthApiURL, 'DeleteServiceGuardSpec', {
      data: {
        deleteServiceGuardSpec: {
          deletedSpecId: null,
          userErrors: [{ field: 'spec', message: 'SPEC_NOT_FOUND' }]
        }
      }
    })

    render(<NetworkHealthTable/>, {
      wrapper: Provider,
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: {
          tenantId: fakeUserProfile.tenantId
        }
      }
    })
    const radio = await screen.findAllByRole('radio')
    userEvent.click(radio[0])
    userEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    userEvent.click(await screen.findByText(/delete test/i))
    expect(await screen.findByText('Network Health test does not exist')).toBeVisible()
  })

  it('should delete test properly', async () => {
    mockGraphqlQuery(networkHealthApiURL, 'ServiceGuardSpecs', {
      data: {
        allServiceGuardSpecs: networkHealthTests
      }
    })

    mockGraphqlMutation(networkHealthApiURL, 'DeleteServiceGuardSpec', {
      data: {
        deleteServiceGuardSpec: {
          deletedSpecId: '3d51e2f0-6a1f-4641-94a4-9feb3803edff',
          userErrors: null
        }
      }
    })

    render(<NetworkHealthTable/>, {
      wrapper: Provider,
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: {
          tenantId: fakeUserProfile.tenantId
        }
      }
    })
    const radio = await screen.findAllByRole('radio')
    userEvent.click(radio[0])
    userEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    userEvent.click(await screen.findByText(/delete test/i))
    expect(await screen.findByText('Network Health test deleted')).toBeVisible()
  })

  it('should return getLastRun results correctly', () => {
    const time = '2023-02-06T08:16:51.316Z'
    const result = getLastRun(time)
    expect(result).toEqual('Feb 06 2023 08:16:51')
  })
  it('should return noDataSymbol for getLastRun', () => {
    const time = ''
    const result = getLastRun(time)
    expect(result).toEqual(noDataSymbol)
  })

  it('should return getAPsUnderTest results correctly when pending tests', () => {
    const total = 10
    const pending = 5
    const result = getAPsUnderTest(total, pending)
    expect(result).toEqual('5 of 10 APs tested')
  })
  it('should return getAPsUnderTest results correctly when 0 pending', () => {
    const total = 10
    const pending = 0
    const result = getAPsUnderTest(total, pending)
    expect(result).toEqual('10 APs')
  })
  it('should return noDataSymbol for getAPsUnderTest', () => {
    const total = 0
    const pending = 0
    const result = getAPsUnderTest(total, pending)
    expect(result).toEqual(noDataSymbol)
  })

  it('should return getLastResult results correctly when 0 pending', () => {
    const total = 20
    const success = 10
    const pending = 0
    const result = getLastResult(total, success, pending)
    expect(result).toEqual('50% pass')
  })
  it('should return getLastResult results correctly when pending tests', () => {
    const total = 20
    const success = 10
    const pending = 5
    const result = getLastResult(total, success, pending)
    expect(result).toEqual('In progress...')
  })
  it('should return noDataSymbol for getLastResult', () => {
    const total = 0
    const success = 0
    const pending = 0
    const result = getLastResult(total, success, pending)
    expect(result).toEqual(noDataSymbol)
  })
})
