import { pathToFilter }           from '@acx-ui/analytics/utils'
import { dataApiURL, store }      from '@acx-ui/store'
import { mockGraphqlQuery }       from '@acx-ui/test-utils'
import { DateRange, NetworkPath } from '@acx-ui/utils'
import type { AnalyticsFilter }   from '@acx-ui/utils'

import * as fixtures from './__tests__/fixtures'
import { api }       from './services'

const input = [
  fixtures.header1,
  fixtures.header2,
  fixtures.header3,
  fixtures.header4,
  fixtures.header5,
  fixtures.header6
]

describe('NetworkNodeInfo', () => {
  const props: AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  input.forEach(({ path, queryResult, transformedResult, name }) => {
    it(`should return correct data for ${name}`, async () => {
      mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
        data: queryResult
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.networkNodeInfo.initiate({
          ...props, filter: pathToFilter(path as NetworkPath) })
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(transformedResult)
      expect(error).toBe(undefined)
    })
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.networkNodeInfo.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
