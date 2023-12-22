import { BrowserRouter } from 'react-router-dom'

import { fakeIncidentAirtimeB }             from '@acx-ui/analytics/utils'
import { dataApiURL, store }                from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { noBuffer }                from '../__tests__/fixtures'
import { TimeSeriesChartTypes }    from '../config'
import { Api }                     from '../services'
import { TimeSeriesChartResponse } from '../types'

import { AirtimeUtilizationChart } from './AirtimeUtilizationChart'

const expectedResult = {
  airtimeUtilizationChart: {
    time: [
      '2023-11-13T00:00:00.000Z',
      '2023-11-13T00:15:00.000Z',
      '2023-11-13T00:30:00.000Z',
      '2023-11-13T00:45:00.000Z',
      '2023-11-13T01:00:00.000Z',
      '2023-11-13T01:15:00.000Z',
      '2023-11-13T01:30:00.000Z',
      '2023-11-13T01:45:00.000Z',
      '2023-11-13T02:00:00.000Z',
      '2023-11-13T02:15:00.000Z'
    ],
    airtimeBusy: [0.485, 0.467, 0.413, 0.3155, 0.295,
      0.381, 0.3895, 0.4545, 0.4705, 0.4905],
    airtimeRx: [0.095, 0.1, 0.174, 0.2755, 0.315, 0.1565,
      0.1225, 0.10400000000000001, 0.0745, 0.0655 ],
    airtimeTx: [0.0775, 0.079, 0.0885, 0.09300000000000001, 0.078,
      0.0745, 0.086, 0.0775, 0.0815, 0.0885],
    airtimeUtilization: [0.6579999999999999, 0.6459999999999999, 0.6755, 0.684, 0.688,
      0.612, 0.598, 0.636, 0.6265, 0.6445000000000001]
  }
} as unknown as TimeSeriesChartResponse

afterEach(() => store.dispatch(Api.util.resetApiState()))

describe('AirtimeUtilizationChart', () => {
  it('should render chart for 2.4 GHz', async () => {
    const { asFragment } = render(
      <BrowserRouter>
        <AirtimeUtilizationChart
          chartRef={()=>{}}
          incident={fakeIncidentAirtimeB}
          data={expectedResult}
          buffer={noBuffer}
        />
      </BrowserRouter>
    )
    expect(await screen.findByText('Airtime Utilization for 2.4 GHz')).toBeVisible()
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should render chart for 5 GHz', async () => {
    const { asFragment } = render(
      <BrowserRouter>
        <AirtimeUtilizationChart
          chartRef={()=>{}}
          incident={{ ...fakeIncidentAirtimeB, code: 'p-airtime-b-5g-high' }}
          data={expectedResult}
          buffer={noBuffer}
        />
      </BrowserRouter>
    )
    expect(await screen.findByText('Airtime Utilization for 5 GHz')).toBeVisible()
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should render chart for 6(5) GHz', async () => {
    const { asFragment } = render(
      <BrowserRouter>
        <AirtimeUtilizationChart
          chartRef={()=>{}}
          incident={{ ...fakeIncidentAirtimeB, code: 'p-airtime-b-6(5)g-high' }}
          data={expectedResult}
          buffer={noBuffer}
        />
      </BrowserRouter>
    )
    expect(await screen.findByText('Airtime Utilization for 6(5) GHz')).toBeVisible()
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('handle when data is null', () => {
    const noDataResult = {
      apInfraImpactedAPsChart: {
        time: [
          '2023-11-13T00:00:00.000Z',
          '2023-11-13T00:15:00.000Z',
          '2023-11-13T00:30:00.000Z',
          '2023-11-13T00:45:00.000Z',
          '2023-11-13T01:00:00.000Z',
          '2023-11-13T01:15:00.000Z',
          '2023-11-13T01:30:00.000Z',
          '2023-11-13T01:45:00.000Z',
          '2023-11-13T02:00:00.000Z',
          '2023-11-13T02:15:00.000Z'
        ],
        airtimeBusy: [null, null, null, null, null, null, null, null, null, null],
        airtimeRx: [null, null, null, null, null, null, null, null, null, null],
        airtimeTx: [null, null, null, null, null, null, null, null, null, null],
        airtimeUtilization: [null, null, null, null, null, null, null, null, null, null]
      }
    }
    const { asFragment } = render(
      <BrowserRouter>
        <AirtimeUtilizationChart
          chartRef={()=>{}}
          incident={fakeIncidentAirtimeB}
          data={noDataResult}
          buffer={noBuffer}
        />
      </BrowserRouter>
    )
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).toBeNull()
    expect(screen.getByText('No data to display')).toBeVisible()
  })
})
describe('airtimeUtilizationChartQuery', () => {
  it('should call corresponding api', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: { network: { hierarchyNode: expectedResult } }
    }, true)
    const { status, data, error } = await store.dispatch(
      Api.endpoints.Charts.initiate({
        incident: fakeIncidentAirtimeB,
        charts: [TimeSeriesChartTypes.AirtimeUtilizationChart],
        minGranularity: 'PT15M',
        buffer: noBuffer
      })
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
    expect(error).toBe(undefined)
  })
})

