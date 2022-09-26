import { omit }    from 'lodash'
import { useIntl } from 'react-intl'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }      from '@acx-ui/store'
import { render,
  screen, mockRestApiQuery,
  mockDOMWidth,
  waitForElementToBeRemoved,
  renderHook } from '@acx-ui/test-utils'

import DevicesDonutWidget, { getApDonutChartData, getSwitchDonutChartData } from '.'

describe('Devices widget', () => {
  mockDOMWidth()

  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url, 'get',{})
  })

  it('should render loader and then chart', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const { asFragment } = render(<Provider><DevicesDonutWidget /></Provider>,
      { route: { params } })
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
    const { result } = renderHook(() =>
      getApDonutChartData(data, useIntl()))
    expect(result.current).toEqual([{
      color: '#ED1C24',
      name: 'Requires Attention',
      value: 3
    }, {
      color: '#ACAEB0',
      name: 'In Setup Phase: 5, Offline: 3',
      value: 8
    }])

    //Removing 1_InSetupPhase, and it should return 1_InSetupPhase_Offline count
    const modifiedData = omit(data, 'summary.aps.summary.1_InSetupPhase')
    const { result: result2 } = renderHook(() =>
      getApDonutChartData(modifiedData, useIntl()))
    expect(result2.current).toEqual([{
      color: '#ED1C24',
      name: 'Requires Attention',
      value: 3
    }, {
      color: '#ACAEB0',
      name: 'Offline',
      value: 3
    }])
  })
  it('should return empty array if no data', ()=>{
    const { result } = renderHook(() =>
      getApDonutChartData(undefined, useIntl()))
    expect(result.current).toEqual([])
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
      color: '#ACAEB0',
      name: 'In Setup Phase',
      value: 5
    }, {
      color: '#23AB36',
      name: 'Operational',
      value: 1
    }])

    // Removing PREPROVISIONED, and it should return INITIALIZING count
    const modifiedData = omit(data, 'summary.switches.summary.PREPROVISIONED')
    expect(getSwitchDonutChartData(modifiedData)).toEqual([{
      color: '#ACAEB0',
      name: 'In Setup Phase',
      value: 3
    }, {
      color: '#23AB36',
      name: 'Operational',
      value: 1
    }])
  })
  it('should return empty array if no data', ()=>{
    expect(getSwitchDonutChartData())
      .toEqual([])
  })
})
