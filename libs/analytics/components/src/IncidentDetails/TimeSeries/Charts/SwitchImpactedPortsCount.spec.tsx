import { fakeIncidentDDoS }         from '@acx-ui/analytics/utils'
import { dataApiURL, store }        from '@acx-ui/store'
import { mockGraphqlQuery, render } from '@acx-ui/test-utils'

import { buffer10d }            from '../__tests__/fixtures'
import { TimeSeriesChartTypes } from '../config'
import { Api }                  from '../services'

import { SwitchImpactedPortsCount } from './SwitchImpactedPortsCount'

describe('SwitchImpactedPortsCount', () => {
  const chart = {
    timeSeries: {
      time: ['2022-04-07T09:00:00.000Z', '2022-04-08T09:00:00.000Z', '2022-04-08T09:00:00.000Z'],
      portCount: [0.5, null, 0.7]
    }
  }
  const incident = {
    ...fakeIncidentDDoS
  }

  beforeEach(() => mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
    data: { network: { hierarchyNode: chart } }
  }))
  afterEach(() => store.dispatch(Api.util.resetApiState()))

  it('renders projected time line', () => {
    const { asFragment } = render(<SwitchImpactedPortsCount
      chartRef={() => {}}
      buffer={buffer10d}
      incident={incident}
      data={chart}
    />, { route: true })
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })

  describe('switchImpactedPortsCountQuery', () => {
    it('call corresponidng api and transform response', async () => {
      const { status, data, error } = await store.dispatch(
        Api.endpoints.Charts.initiate({
          incident,
          charts: [TimeSeriesChartTypes.SwitchImpactedPortsCount],
          minGranularity: 'PT1H',
          buffer: buffer10d
        })
      )
      const expectedChart = {
        timeSeries: {
          ...chart.timeSeries
        }
      }
      const expectedResult = { network: { hierarchyNode: expectedChart } }
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
      expect(error).toBe(undefined)
    })
  })
})
