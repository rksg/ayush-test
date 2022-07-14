import { Dashboard }          from '@acx-ui/rc/services'
import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider  }          from '@acx-ui/store'
import { render,
  screen, mockRestApiQuery,
  mockAutoSizer,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import Venues, { getVenuesDonutChartData } from '.'

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
  mockAutoSizer()

  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url, 'get', { data })
  })

  it('should render loader and then chart', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const { asFragment } = render(<Provider><Venues /></Provider>, { route: { params } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Venues')
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})

describe('getVenuesDonutChartData', () => {
  it('should return correct formatted data', async () => {
    expect(getVenuesDonutChartData(data)).toEqual([{
      color: 'Red',
      name: 'Requires Attention',
      value: 2
    },{
      color: 'Grey',
      name: 'In Setup Phase',
      value: 4
    },{
      color: 'Green',
      name: 'Operational',
      value: 5
    }])
  })
  it('should return empty array if no data', ()=>{
    expect(getVenuesDonutChartData())
      .toEqual([])
  })
})
