import { BrowserRouter, MemoryRouter } from '@acx-ui/react-router-dom'
import { renderHook }                  from '@acx-ui/test-utils'

import { fixedEncodeURIComponent } from './encodeURIComponent'
import { useEncodedParameter }     from './useEncodedParameter'

describe('useEncodedParameter', () => {
  it('reads and writes search parameters', () => {
    const setSearchSpy = jest.fn()
    jest
      .spyOn(require('react-router-dom'), 'useSearchParams')
      .mockReturnValue([
        new URLSearchParams({ name1: 'value1' }),
        setSearchSpy
      ])
    const { result } = renderHook(
      () => useEncodedParameter<{ value: string }>('name1'),
      {
        wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>
      }
    )
    expect(result.current.read()).toBe(null)
    result.current.write({ value: 'value1' })
    expect(setSearchSpy).toHaveBeenCalled()
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

  it('writes search parameters only if value has changed', () => {
    const value = 'value1'
    const encodedValue = fixedEncodeURIComponent(JSON.stringify({ value }))
    const setSearchSpy = jest.fn()
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
      new URLSearchParams({ name1: encodedValue }),
      setSearchSpy
    ])

    const { result } = renderHook(
      () => useEncodedParameter<{ value: string }>('name1'),
      {
        wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>
      }
    )

    expect(result.current.read()).toEqual({ value })
    result.current.write({ value })
    expect(setSearchSpy).not.toHaveBeenCalled()
  })
})
