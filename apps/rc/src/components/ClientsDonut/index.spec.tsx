import { useIntl } from 'react-intl'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }      from '@acx-ui/store'
import { render,
  screen,
  mockRestApiQuery,
  mockAutoSizer,
  waitForElementToBeRemoved,
  renderHook
} from '@acx-ui/test-utils'


import ClientsDonutWidget, { getAPClientChartData, getSwitchClientChartData } from '.'

describe('Clients widget', () => {
  mockAutoSizer()

  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url, 'get',{})
  })

  it('should render loader and then chart', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const { asFragment } = render(<Provider><ClientsDonutWidget /></Provider>,
      { route: { params } })
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
    const { result } = renderHook(() => getAPClientChartData(data, useIntl()))
    expect(result.current).toEqual([{
      color: '#ED1C24',
      name: 'Poor',
      value: 1
    }, {
      color: '#23AB36',
      name: 'Good',
      value: 2
    }, {
      color: '#ACAEB0',
      name: 'Unknown',
      value: 1
    }])
  })
  it('should return empty array if no data', ()=>{
    const { result } = renderHook(() => getAPClientChartData(undefined, useIntl()))
    expect(result.current).toEqual([])
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
    const { result } = renderHook(() => getSwitchClientChartData(data, useIntl()))
    expect(result.current).toEqual([{
      color: '#23AB36',
      name: 'Clients',
      value: 2
    }])
  })
  it('should return empty array if no data', () => {
    const { result } = renderHook(() => getSwitchClientChartData(undefined, useIntl()))
    expect(result.current).toEqual([])
  })
})
