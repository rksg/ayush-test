import { Provider }            from '@acx-ui/store'
import { renderHook, waitFor } from '@acx-ui/test-utils'

import { useOltTable } from './useOltTable'

describe('useOltTable', () => {
  it('should return correct title with count', async () => {
    const { result } = renderHook(() => useOltTable(), { wrapper: Provider })
    await waitFor(() => expect(result.current).toBeDefined())

    expect(result.current.title).toBe('Optical List (2)')
    expect(result.current.headerExtra).toBeDefined()
    expect(result.current.component).toBeDefined()
  })
})