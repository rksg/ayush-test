import '@testing-library/jest-dom'

import { store, dataApiSearchURL } from '@acx-ui/store'
import { mockGraphqlQuery }        from '@acx-ui/test-utils'

import { apListFixture, searchFixture } from './__tests__/fixtures'
import {
  searchApi
} from './searchApi'

describe('Search API', () => {

  beforeEach(() => {
    store.dispatch(searchApi.util.resetApiState())
  })

  it('search api should return the data', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: searchFixture
    })
    const searchPayload = {
      start: '2023-04-06T15:26:21+05:30',
      end: '2023-04-06T15:29:48+05:30',
      query: 'sometext',
      limit: 100
    }
    const { status, data, error } = await store.dispatch(
      searchApi.endpoints.search.initiate(searchPayload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(searchFixture.search)
  })

  it('apList api should return the data', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: apListFixture
    })
    const payload = {
      start: '2023-04-06T15:26:21+05:30',
      end: '2023-04-06T15:29:48+05:30',
      metric: 'traffic',
      limit: 100
    }
    const { status, data, error } = await store.dispatch(
      searchApi.endpoints.apList.initiate(payload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(apListFixture.search)
  })
})
