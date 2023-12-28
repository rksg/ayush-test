import { dataApiURL, store }    from '@acx-ui/store'
import { mockGraphqlQuery }     from '@acx-ui/test-utils'
import type { AnalyticsFilter } from '@acx-ui/utils'
import { DateRange }            from '@acx-ui/utils'

import { SwitchStatusTimeSeries } from './__tests__/fixtures'
import { api }                    from './services'

describe('SwitchStatusWidgetService', () => {
  const props: AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }
  afterEach(() => store.dispatch(api.util.resetApiState()))
  it('should return correct data', async () => {
    const expectedResult = {
      network: {
        hierarchyNode: SwitchStatusTimeSeries
      }
    }
    mockGraphqlQuery(dataApiURL, 'switchStatus', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.switchStatus.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
    expect(error).toBe(undefined)
  })
  it('should return correct data for no result', async () => {
    const expectedResult = {
      network: {
        hierarchyNode: {
          switchTotalDowntime: 0,
          switchTotalUptime: 0,
          timeSeries: {
            isSwitchUp: [],
            time: []
          }
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'switchStatus', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.switchStatus.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'switchStatus', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.switchStatus.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
