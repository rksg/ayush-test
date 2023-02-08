import '@testing-library/jest-dom'

import { rest } from 'msw'

import { networkhealthURL }                    from '@acx-ui/analytics/services'
import { noDataSymbol }                        from '@acx-ui/analytics/utils'
import { UserProfileProvider }                 from '@acx-ui/rc/components'
import { CommonUrlsInfo }                      from '@acx-ui/rc/utils'
import { BrowserRouter as Router, TenantLink } from '@acx-ui/react-router-dom'
import { Provider, store }                     from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render, screen,
  fireEvent,
  waitForElementToBeRemoved,
  mockServer,
  act
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

const fakeUserProfile2 = {
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
    apsCount: 20,
    userId: '0032h00000LUqUKAA1',
    clientType: 'virtual-wireless-client',
    schedule: null,
    tests: {
      items: [{
        id: 2,
        createdAt: '2023-02-06T21:00:00.000Z',
        summary: {
          apsTestedCount: 15,
          apsSuccessCount: 0,
          apsPendingCount: 1
        }
      }]
    }
  },
  {
    id: '3d51e2f0-6a1f-4641-94a4-9feb3803edfh',
    name: 'testCase 3',
    type: 'on-demand',
    apsCount: 0,
    userId: '0032h00000LUqUKAA1',
    clientType: 'virtual-client',
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
  })

  it('should render loader', () => {
    mockGraphqlQuery(networkhealthURL, 'ServiceGuardSpecs', {
      data: { allServiceGuardSpecs: [] }
    })
    render(<Router>
      <Provider>
        <NetworkHealthTable/>
      </Provider>
    </Router>)
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
  })

  it('should render table with valid input', async () => {
    mockGraphqlQuery(networkhealthURL, 'ServiceGuardSpecs', {
      data: { allServiceGuardSpecs: networkHealthTests }
    })

    render(<Provider>
      <NetworkHealthTable/>
    </Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: { tenantId: fakeUserProfile.tenantId }
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
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
    mockGraphqlQuery(networkhealthURL, 'ServiceGuardSpecs', {
      data: { allServiceGuardSpecs: networkHealthTests }
    })

    render(<Provider><NetworkHealthTable/></Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: { tenantId: fakeUserProfile.tenantId }
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
    mockGraphqlQuery(networkhealthURL, 'ServiceGuardSpecs', {
      data: { allServiceGuardSpecs: networkHealthTests }
    })

    render(<Provider><NetworkHealthTable/></Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: { tenantId: fakeUserProfile.tenantId }
      }
    })

    const radio = await screen.findAllByRole('radio')
    fireEvent.click(radio[0])
    fireEvent.click(await screen.findByRole('button', { name: /run now/i }))
  })

  it('should disable run now button', async () => {
    mockGraphqlQuery(networkhealthURL, 'ServiceGuardSpecs', {
      data: { allServiceGuardSpecs: networkHealthTests }
    })

    render(<Provider><NetworkHealthTable/></Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: { tenantId: fakeUserProfile.tenantId }
      }
    })

    const radio = await screen.findAllByRole('radio')
    fireEvent.click(radio[2])
    const runNowButton = await screen.findByRole('button', { name: /run now/i })
    expect(runNowButton).toBeDisabled()
  })

  it('should click edit', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getUserProfile.url, (req, res, ctx) => res(ctx.json(fakeUserProfile)))
    )
    mockGraphqlQuery(networkhealthURL, 'ServiceGuardSpecs', {
      data: { allServiceGuardSpecs: networkHealthTests }
    })
    render(<Provider>
      <UserProfileProvider>
        <NetworkHealthTable/>
      </UserProfileProvider>
    </Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: { tenantId: fakeUserProfile.tenantId }
      }
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    })
    const radio = await screen.findAllByRole('radio')
    fireEvent.click(radio[0])
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    expect(mockedNavigate.mock.calls[0][0]).toEqual(
      `/t/${fakeUserProfile.tenantId}/serviceValidation/networkHealth/` +
      `${networkHealthTests[0].id}/edit`
    )
  })

  it('should disable edit button', async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getUserProfile.url, (req, res, ctx) => res(ctx.json(fakeUserProfile2)))
    )
    mockGraphqlQuery(networkhealthURL, 'ServiceGuardSpecs', {
      data: { allServiceGuardSpecs: networkHealthTests }
    })
    render(<Provider>
      <UserProfileProvider>
        <NetworkHealthTable/>
      </UserProfileProvider>
    </Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: { tenantId: fakeUserProfile2.tenantId }
      }
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    })
    const radio = await screen.findAllByRole('radio')
    fireEvent.click(radio[0])
    const editButton = await screen.findByRole('button', { name: 'Edit' })
    expect(editButton).toBeDisabled()
  })

  it('should delete test properly', async () => {
    mockGraphqlQuery(networkhealthURL, 'ServiceGuardSpecs', {
      data: { allServiceGuardSpecs: networkHealthTests }
    })

    render(<Provider><NetworkHealthTable/></Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: { tenantId: fakeUserProfile.tenantId }
      }
    })
    const radio = await screen.findAllByRole('radio')
    fireEvent.click(radio[0])
    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Delete test' }))
  })

  it('should return getLastRun results correctly', () => {
    const time = '2023-02-06T08:16:51.316Z'
    const result = getLastRun(time)
    expect(result).toEqual('2023-02-06 08:16:51')
  })
  it('should return noDataSymbol for getLastRun', () => {
    const time = ''
    const result = getLastRun(time)
    expect(result).toEqual(noDataSymbol)
  })

  it('should return getAPsUnderTest results correctly', () => {
    const aps = 10
    const result = getAPsUnderTest(aps)
    expect(result).toEqual(<TenantLink to={'/serviceValidation/networkHealth'}>{aps}</TenantLink>)
  })
  it('should return noDataSymbol for getAPsUnderTest', () => {
    const time = 0
    const result = getAPsUnderTest(time)
    expect(result).toEqual(noDataSymbol)
  })

  it('should return getLastResult results correctly', () => {
    const total = 20
    const success = 10
    const result = getLastResult(total, success)
    expect(result).toEqual('50% pass')
  })
  it('should return noDataSymbol for getLastResult', () => {
    const total = 0
    const success = 0
    const result = getLastResult(total, success)
    expect(result).toEqual(noDataSymbol)
  })
})
