import moment from 'moment-timezone'

import { fakeIncidentSwitchMemory } from '@acx-ui/analytics/utils'
import { dataApiURL, store }        from '@acx-ui/store'
import { mockGraphqlQuery, render } from '@acx-ui/test-utils'

import { buffer10d }            from '../__tests__/fixtures'
import { TimeSeriesChartTypes } from '../config'
import { Api }                  from '../services'

import { SwitchMemoryUtilizationChart } from './SwitchMemoryUtilizationChart'

describe('SwitchMemoryUtilizationChart', () => {
  const chart = {
    memoryUtilizationChart: {
      time: ['2022-04-07T09:00:00.000Z', '2022-04-08T09:00:00.000Z', '2022-04-08T09:00:00.000Z'],
      utilization: [0.5, 0.6, 0.7]
    }
  }

  beforeEach(() => mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
    data: { network: { hierarchyNode: chart } }
  }))
  afterEach(() => store.dispatch(Api.util.resetApiState()))

  it('renders projected time line', () => {
    const incident = {
      ...fakeIncidentSwitchMemory,
      metadata: {
        projected_time: 9.5,
        upper_bound: 0.95
      }
    }
    const { asFragment } = render(<SwitchMemoryUtilizationChart
      chartRef={() => {}}
      buffer={buffer10d}
      incident={incident}
      data={chart}
    />, { route: true })
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })

  it('renders without project time', () => {
    const incident = {
      ...fakeIncidentSwitchMemory,
      metadata: { projected_time: 0, upper_bound: 0.95 }
    }
    const { asFragment } = render(<SwitchMemoryUtilizationChart
      chartRef={() => {}}
      buffer={buffer10d}
      incident={incident}
      data={chart}
    />, { route: true })
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })

  describe('switchMemoryUtilizationQuery', () => {
    it('call corresponidng api and transform response', async () => {
      const incident = {
        ...fakeIncidentSwitchMemory,
        metadata: { projected_time: 0, upper_bound: 95 }
      }
      const { status, data, error } = await store.dispatch(
        Api.endpoints.Charts.initiate({
          incident,
          charts: [TimeSeriesChartTypes.SwitchMemoryUtilizationChart],
          minGranularity: 'PT1H',
          buffer: buffer10d
        })
      )
      const expectedChart = {
        memoryUtilizationChart: {
          ...chart.memoryUtilizationChart,
          projectedUtilization: Array(chart.memoryUtilizationChart.time.length).fill(undefined)
        }
      }
      const expectedResult = { network: { hierarchyNode: expectedChart } }
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
      expect(error).toBe(undefined)
    })

    it('call corresponidng api and transform response with projected time', async () => {
      const incident = {
        ...fakeIncidentSwitchMemory,
        metadata: { projected_time: 9.5, upper_bound: 95 }
      }
      const { status, data, error } = await store.dispatch(
        Api.endpoints.Charts.initiate({
          incident,
          charts: [TimeSeriesChartTypes.SwitchMemoryUtilizationChart],
          minGranularity: 'PT1H',
          buffer: buffer10d
        })
      )
      const projectTime = moment(chart.memoryUtilizationChart.time.at(-1))
        .add(24 * incident.metadata.projected_time!, 'hours')
      const expectedChart = {
        memoryUtilizationChart: {
          ...chart.memoryUtilizationChart,
          time: [
            ...chart.memoryUtilizationChart.time,
            projectTime.toISOString(),
            projectTime.clone().add(12, 'hours').toISOString()
          ],
          projectedUtilization: [
            ...Array(chart.memoryUtilizationChart.time.length - 1).fill(undefined),
            chart.memoryUtilizationChart.utilization.at(-1),
            incident.metadata.upper_bound! / 100
          ]
        }
      }
      const expectedResult = { network: { hierarchyNode: expectedChart } }
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
      expect(error).toBe(undefined)
    })
  })
})
