import { CommonUrlsInfo, Dashboard } from '@acx-ui/rc/utils'
import { Provider  }                 from '@acx-ui/store'
import { render,
  screen, mockRestApiQuery,
  mockDOMWidth,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import VenuesDonutWidget, { getVenuesDonutChartData } from '.'

const data: Dashboard = {
  summary: {
    venues: {
      summary: {
        '1_InSetupPhase': 4,
        '2_Operational': 5,
        '3_RequiresAttention': 2
      },
      totalCount: 4
    }
  }
}

describe('Venues widget', () => {
  mockDOMWidth()

  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url, 'get', { data })
  })

  it('should render loader and then chart', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const { asFragment } = render(<Provider><VenuesDonutWidget /></Provider>, { route: { params } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Venues')
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})

describe('getVenuesDonutChartData', () => {
  it('should return correct formatted data', async () => {
    expect(getVenuesDonutChartData(data)).toEqual([{
      color: '#ED1C24',
      name: 'Requires Attention',
      value: 2
    },{
      color: '#ACAEB0',
      name: 'In Setup Phase',
      value: 4
    },{
      color: '#23AB36',
      name: 'Operational',
      value: 5
    }])
  })
  it('should return empty array if no data', ()=>{
    expect(getVenuesDonutChartData())
      .toEqual([])
  })
})
