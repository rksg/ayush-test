import { renderHook } from '@testing-library/react'

import { getBasePath, useBasePath } from './helpers'


describe('getBasePath', () => {
  it('returns base path', () => {
    expect(getBasePath()).toEqual('')
  })
})

describe('useBasePath', () => {
  it('returns base path', () => {
    const { result } = renderHook(() => useBasePath())
    expect(result.current).toEqual('')
  })
})
