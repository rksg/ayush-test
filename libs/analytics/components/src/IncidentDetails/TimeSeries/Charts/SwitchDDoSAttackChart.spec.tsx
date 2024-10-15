import { fakeIncidentDDoS }         from '@acx-ui/analytics/utils'
import { dataApiURL, store }        from '@acx-ui/store'
import { mockGraphqlQuery, render } from '@acx-ui/test-utils'

import { buffer10d }            from '../__tests__/fixtures'
import { TimeSeriesChartTypes } from '../config'
import { Api }                  from '../services'

import { SwitchDDoSAttackChart } from './SwitchDDoSAttackChart'

describe('SwitchDDoSAttackChart', () => {
  const chart = {
    ddosAttackOnPortTimeSeries: {
      time: ['2022-04-07T09:00:00.000Z', '2022-04-08T09:00:00.000Z', '2022-04-08T09:00:00.000Z'],
      ddos: [0.5, 0.6, 0.7]
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
    const { asFragment } = render(<SwitchDDoSAttackChart
      chartRef={() => {}}
      buffer={buffer10d}
      incident={incident}
      data={chart}
    />, { route: true })
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
  })

  describe('switchDDoSAttackQuery', () => {
    it('call corresponidng api and transform response', async () => {
      const { status, data, error } = await store.dispatch(
        Api.endpoints.Charts.initiate({
          incident,
          charts: [TimeSeriesChartTypes.SwitchDDoSAttackChart],
          minGranularity: 'PT1H',
          buffer: buffer10d
        })
      )
      const expectedChart = {
        ddosAttackOnPortTimeSeries: {
          ...chart.ddosAttackOnPortTimeSeries
        }
      }
      const expectedResult = { network: { hierarchyNode: expectedChart } }
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
      expect(error).toBe(undefined)
    })
  })
})
