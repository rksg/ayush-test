import { pathToFilter }         from '@acx-ui/analytics/utils'
import { dataApiURL, store }    from '@acx-ui/store'
import { mockGraphqlQuery }     from '@acx-ui/test-utils'
import { DateRange }            from '@acx-ui/utils'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { emptyResult, numberResult } from './__tests__/fixtures'
import { api }                       from './services'

describe('TtcTimeWidget', () => {
  const props:AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: pathToFilter([{ type: 'AP', name: '28:B3:71:28:6C:10' }])
  }
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data', async () => {
    mockGraphqlQuery(dataApiURL, 'AverageTTC', {
      data: numberResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.averageTtc.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(500)
    expect(error).toBe(undefined)
  })
  it('should return correct data for no result', async () => {
    mockGraphqlQuery(dataApiURL, 'AverageTTC', {
      data: emptyResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.averageTtc.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(null)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'AverageTTC', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.averageTtc.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
