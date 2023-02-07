import '@testing-library/jest-dom'

import { networkhealthURL }              from '@acx-ui/analytics/services'
import { noDataSymbol }          from '@acx-ui/analytics/utils'
import { BrowserRouter as Router, TenantLink } from '@acx-ui/react-router-dom'
import { Provider, store }         from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render, screen,
  fireEvent,
  waitForElementToBeRemoved,
  mockServer,
} from '@acx-ui/test-utils'
import { rest }  from 'msw'

import { api } from './services'

import { getAPsUnderTest, getLastResult, getLastRun, NetworkHealthTable } from './index'
import { CommonUrlsInfo } from '@acx-ui/rc/utils'

const mockedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
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
    mockGraphqlQuery(networkhealthURL, 'IncidentTableWidget', {
      data: { allServiceGuardSpecs: [] }
    })
    render(<Router><Provider><NetworkHealthTable/></Provider></Router>)
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
  })

  it('should render table with valid input', async () => {
    mockGraphqlQuery(networkhealthURL, 'IncidentTableWidget', {
      data: { allServiceGuardSpecs: networkHealthTests }
    })

    render(<Provider><NetworkHealthTable/></Provider>, {
      route: {
        path: '/t/tenantId/serviceValidation/networkHealth',
        wrapRoutes: false
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
        path: '/t/tenantId/serviceValidation/networkHealth',
        wrapRoutes: false
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
        path: '/t/tenantId/serviceValidation/networkHealth',
        wrapRoutes: false
      }
    })

    const radio = await screen.findAllByRole('radio', { hidden: true, checked: false })
    fireEvent.click(radio[0])
    screen.logTestingPlaygroundURL()

    fireEvent.click(await screen.findByRole('button', { name: /run now/i }))
    // screen.logTestingPlaygroundURL()
  })

  it.only('should click edit', async () => {
    // const userProfile = {
    //   externalId: '0032h00000LUqUKAA1'
    // }
    const userProfile = {
      region: '[NA]',
      allowedRegions: [
        {
          name: 'US',
          description: 'United States of America',
          link: 'https://devalto.ruckuswireless.com',
          current: true
        }
      ],
      externalId: '0032h00000LUqUKAA1',
      pver: 'acx-hybrid',
      companyName: 'Dog Company 1093',
      firstName: 'FisrtName 1093',
      lastName: 'LastName 1093',
      username: 'dog1093@email.com',
      role: 'PRIME_ADMIN',
      roles: ['PRIME_ADMIN'],
      detailLevel: 'debug',
      dateFormat: 'yyyy/mm/dd',
      email: 'dog1093@email.com',
      var: false,
      tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
      varTenantId: 'd1ec841a4ff74436b23bca6477f6a631',
      adminId: '2cfff8a9345843f88be768dbf833592f',
      support: false,
      dogfood: false
    }
    mockServer.use(
      rest.get(CommonUrlsInfo.getUserProfile.url, (req, res, ctx) =>
        res(ctx.json(userProfile))
      )
    )
    mockGraphqlQuery(networkhealthURL, 'ServiceGuardSpecs', {
      data: { allServiceGuardSpecs: networkHealthTests }
    })

    render(<Provider><NetworkHealthTable/></Provider>, {
      route: {
        path: '/t/:tenantId/serviceValidation/networkHealth',
        params: {
          tenantId: 'd1ec841a4ff74436b23bca6477f6a631'
        }
      }
    })
    
    // await new Promise(r => setTimeout(r, 500))

    // const radio = await screen.findAllByRole('radio')
    // fireEvent.click(radio[0])
    // screen.logTestingPlaygroundURL()
    // fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    // screen.logTestingPlaygroundURL()
  })

  it('should delete test properly', async () => {
    mockGraphqlQuery(networkhealthURL, 'ServiceGuardSpecs', {
      data: { allServiceGuardSpecs: networkHealthTests }
    })

    render(<Provider><NetworkHealthTable/></Provider>, {
      route: {
        path: '/t/tenantId/serviceValidation/networkHealth',
        wrapRoutes: false
      }
    })
    const radio = await screen.findAllByRole('radio', { hidden: true, checked: false })
    fireEvent.click(radio[0])
    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    // screen.logTestingPlaygroundURL()
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
