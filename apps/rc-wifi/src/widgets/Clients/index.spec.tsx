import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider  }          from '@acx-ui/store'
import { render,
  screen, mockRestApiQuery,
  mockAutoSizer,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import Clients, { getAPClientChartData, getSwitchClientChartData } from '.'

jest.mock('@acx-ui/components', () => ({
  __esModule: true,
  ...(jest.requireActual('@acx-ui/components')),
  cssStr: jest.fn(property => {
    switch (property) {
      case '--acx-semantics-red-50':
        return 'Red'
      case '--acx-semantics-yellow-40':
        return 'Yellow'
      case '--acx-neutrals-50':
        return 'Grey'
      default:
        return 'Green'
    }
  })
}))

describe('Clients widget', () => {
  mockAutoSizer()

  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url, 'get',{})
  })

  it('should render loader and then chart', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const { asFragment } = render(<Provider><Clients /></Provider>, { route: { params } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Clients')
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})

describe('getAPClientChartData', () => {
  const data = {
    summary: {
      clients: {
        summary: {},
        totalCount: 0,
        clientDto: [{
          healthCheckStatus: 'Good'
        },{
          healthCheckStatus: 'Poor'
        },{
          healthCheckStatus: 'Good'
        },{
          healthCheckStatus: 'Unknown'
        }]
      }
    }
  }
  it('should return correct formatted data', async () => {
    expect(getAPClientChartData(data)).toEqual([{
      color: 'Red',
      name: 'Poor',
      value: 1
    }, {
      color: 'Green',
      name: 'Good',
      value: 2
    }, {
      color: 'Grey',
      name: 'Unknown',
      value: 1
    }])
  })
  it('should return empty array if no data', ()=>{
    expect(getAPClientChartData()).toEqual([])
  })
})

describe('getSwitchClientChartData', () => {
  const data = {
    summary: {
      switchClients: {
        summary: {
          '02e2ddbc88e1428987666d31edbc3d9a': '2'
        },
        totalCount: 2
      }
    }
  }
  it('should return correct formatted data', async () => {
    expect(getSwitchClientChartData(data)).toEqual([{
      color: 'Green',
      name: 'Clients',
      value: 2
    }])
  })
  it('should return empty array if no data', () => {
    expect(getSwitchClientChartData()).toEqual([])
  })
})
