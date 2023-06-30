import '@testing-library/jest-dom'

import { timelineApi }                           from '@acx-ui/rc/services'
import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider, store }                       from '@acx-ui/store'
import { mockRestApiQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import {
  events,
  eventsForQuery,
  eventsMetaForQuery,
  adminLogs,
  adminLogsForQuery,
  adminLogsMetaForQuery
} from './__tests__/fixtures'
import {
  useEventsTableQuery,
  useAdminLogsTableQuery
} from './services'

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({ data: { detailLevel: 'it' } })
}))

describe('useEventsTableQuery', () => {
  beforeEach(() => {
    store.dispatch(timelineApi.util.resetApiState())
    mockRestApiQuery(CommonUrlsInfo.getEventList.url, 'post', eventsForQuery)
    mockRestApiQuery(CommonUrlsInfo.getEventListMeta.url, 'post', eventsMetaForQuery)
  })
  it('should return correct value', async () => {
    const { result } = renderHook(
      () => useEventsTableQuery(),
      { wrapper: Provider, route: true }
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(events.length)
  })
})

describe('useAdminLogsTableQuery', () => {
  beforeEach(() => {
    store.dispatch(timelineApi.util.resetApiState())
    mockRestApiQuery(CommonUrlsInfo.getEventList.url, 'post', adminLogsForQuery)
    mockRestApiQuery(CommonUrlsInfo.getEventListMeta.url, 'post', adminLogsMetaForQuery)
  })
  it('should return correct value', async () => {
    const { result } = renderHook(
      () => useAdminLogsTableQuery(),
      { wrapper: Provider, route: true }
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(adminLogs.length)
  })
})
