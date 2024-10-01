import { BrowserRouter, MemoryRouter } from '@acx-ui/react-router-dom'
import { renderHook }                  from '@acx-ui/test-utils'

import { useEncodedParameter } from './useEncodedParameter'

describe('useEncodedParameter', () => {
  it('reads and writes search parameters', () => {
    const { result } = renderHook(
      () => useEncodedParameter<{ value: string }>('name1'),
      {
        wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>
      }
    )
    expect(result.current.read()).toBe(null)
    result.current.write({ value: 'value1' })
    expect(result.current.read()).toEqual({ value: 'value1' })
  })
  it('does not crash the page having old parameters', () => {
    const { result } = renderHook(
      () => useEncodedParameter<{ value: string }>('name2'),
      {
        wrapper: ({ children }) => <MemoryRouter
          initialEntries={[{
            pathname: '/incidents',
            search: '?name2=eyJyYW5nZSI6Ikxhc3QgNyBEYXlzIiwiaW5pdGlhdGVkIjoxNjY5MjgxNDgxODM1fQ'
          }]}
        >{children}</MemoryRouter>
      }
    )
    expect(result.current.read()).toBe(null)
  })
})
