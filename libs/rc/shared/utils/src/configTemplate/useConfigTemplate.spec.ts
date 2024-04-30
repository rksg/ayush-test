import { renderHook } from '@acx-ui/test-utils'

import { useConfigTemplate } from '.'

const mockedConfigTemplateContextFn = jest.fn()
jest.mock('./ConfigTemplateContext', () => ({
  useConfigTemplateContext: () => mockedConfigTemplateContextFn()
}))

describe('useConfigTemplate Hook', () => {
  it('returns isTemplate as a boolean', () => {
    mockedConfigTemplateContextFn.mockReturnValue({ isTemplate: true })
    const { result } = renderHook(() => useConfigTemplate())

    expect(result.current.isTemplate).toBe(true)
  })
})
