import { omit } from 'lodash'

import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider  }          from '@acx-ui/store'
import { render,
  screen, mockRestApiQuery,
  mockAutoSizer,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import Devices, { getApDonutChartData, getSwitchDonutChartData } from '.'

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

describe('Venues widget', () => {
  mockAutoSizer()

  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url, 'get',{})
  })

  it('should render loader and then chart', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const { asFragment } = render(<Provider><Devices /></Provider>, { route: { params } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Devices')
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})

describe('getVenuesDonutChartData', () => {
  const data = {
    summary: {
      aps: {
        summary: {
          '1_InSetupPhase': 5,
          '3_RequiresAttention': 3,
          '1_InSetupPhase_Offline': 3
        },
        totalCount: 1
      }
    }
  }
  it('should return correct formatted data', async () => {
    expect(getApDonutChartData(data)).toEqual([{
      color: 'Red',
      name: 'Requires Attention',
      value: 3
    }, {
      color: 'Grey',
      name: 'In Setup Phase + Offline',
      value: 8
    }])

    //Removing 1_InSetupPhase, and it should return 1_InSetupPhase_Offline count
    const modifiedData = omit(data, 'summary.aps.summary.1_InSetupPhase')
    expect(getApDonutChartData(modifiedData)).toEqual([{
      color: 'Red',
      name: 'Requires Attention',
      value: 3
    }, {
      color: 'Grey',
      name: 'Offline',
      value: 3
    }])
  })
  it('should return empty array if no data', ()=>{
    expect(getApDonutChartData())
      .toEqual([])
  })
})

describe('getSwitchDonutChartData', () => {
  const data = {
    summary: {
      switches: {
        summary: {
          PREPROVISIONED: '2',
          ONLINE: '1',
          INITIALIZING: '3'
        },
        totalCount: 3
      }
    }
  }
  it('should return correct formatted data', async () => {
    expect(getSwitchDonutChartData(data)).toEqual([{
      color: 'Grey',
      name: 'In Setup Phase',
      value: 5
    }, {
      color: 'Green',
      name: 'Operational',
      value: 1
    }])

    // Removing PREPROVISIONED, and it should return INITIALIZING count
    const modifiedData = omit(data, 'summary.switches.summary.PREPROVISIONED')
    expect(getSwitchDonutChartData(modifiedData)).toEqual([{
      color: 'Grey',
      name: 'In Setup Phase',
      value: 3
    }, {
      color: 'Green',
      name: 'Operational',
      value: 1
    }])
  })
  it('should return empty array if no data', ()=>{
    expect(getSwitchDonutChartData())
      .toEqual([])
  })
})