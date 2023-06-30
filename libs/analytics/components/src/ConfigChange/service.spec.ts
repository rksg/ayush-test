import { Provider, dataApiURL }                  from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import { configChanges }        from './__tests__/fixtures'
import { useConfigChangeQuery } from './services'

describe('useConfigChangeQuery', () => {
  afterEach(() => jest.resetAllMocks())
  it('should return correct data', async () => {
    const param = {
      path: [{ type: 'network' as const, name: 'Network' }],
      start: '2023-04-01T16:00:00+08:00',
      end: '2023-04-30T16:00:00+08:00'
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges } } } })
    const { result } = renderHook(() => useConfigChangeQuery(param), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(configChanges.map((item, id) => ({ ...item, id })))
  })
  it('should return empty data', async () => {
    const param = {
      path: [{ type: 'network' as const, name: 'Network' }],
      start: '2023-05-01T16:00:00+08:00',
      end: '2023-05-30T16:00:00+08:00'
    }
    mockGraphqlQuery(dataApiURL, 'ConfigChange',
      { data: { network: { hierarchyNode: { configChanges: [] } } } })
    const { result } = renderHook(() => useConfigChangeQuery(param), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })

})
