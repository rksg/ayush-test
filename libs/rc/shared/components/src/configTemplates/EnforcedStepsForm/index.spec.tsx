
import { useIsSplitOn }          from '@acx-ui/feature-toggle'
import { ConfigTemplateContext } from '@acx-ui/rc/utils'
import { renderHook }            from '@acx-ui/test-utils'

import { useEnforcedStatus } from '.'

describe('useEnforcedStatus', () => {
  it('should return false when enforcement FF is false', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    const { result } = renderHook(() => useEnforcedStatus(), {
      // eslint-disable-next-line max-len
      wrapper: ({ children }) => <ConfigTemplateContext.Provider value={{ isTemplate: false }} children={children}/>
    })
    expect(result.current.hasEnforcedItem([{ isEnforced: true }])).toBe(false)
  })

  it('should return false when isTemplate is true', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useEnforcedStatus(), {
      // eslint-disable-next-line max-len
      wrapper: ({ children }) => <ConfigTemplateContext.Provider value={{ isTemplate: true }} children={children}/>
    })

    expect(result.current.hasEnforcedItem([{ isEnforced: true }])).toBe(false)
  })

  it('should return true for a single object with isEnforced true', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useEnforcedStatus(), {
      // eslint-disable-next-line max-len
      wrapper: ({ children }) => <ConfigTemplateContext.Provider value={{ isTemplate: false }} children={children}/>
    })

    expect(result.current.hasEnforcedItem([{ isEnforced: true }])).toBe(true)
  })

  it('should return true if any item in the array has isEnforced true', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useEnforcedStatus(), {
      // eslint-disable-next-line max-len
      wrapper: ({ children }) => <ConfigTemplateContext.Provider value={{ isTemplate: false }} children={children}/>
    })

    // eslint-disable-next-line max-len
    expect(result.current.hasEnforcedItem([{ isEnforced: false }, { isEnforced: true }])).toBe(true)
  })

  it('should return false if all items in the array have isEnforced false', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useEnforcedStatus(), {
      // eslint-disable-next-line max-len
      wrapper: ({ children }) => <ConfigTemplateContext.Provider value={{ isTemplate: false }} children={children}/>
    })

    // eslint-disable-next-line max-len
    expect(result.current.hasEnforcedItem([{ isEnforced: false }, { isEnforced: false }])).toBe(false)
  })

  it('should return the enforced action message if condition is met', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useEnforcedStatus(), {
      // eslint-disable-next-line max-len
      wrapper: ({ children }) => <ConfigTemplateContext.Provider value={{ isTemplate: false }} children={children}/>
    })

    expect(result.current.getEnforcedActionMsg([{ isEnforced: true }]))
      .toBe('Action is disabled due to enforcement from the template')
  })

  it('should return empty string if condition is not met', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useEnforcedStatus(), {
      // eslint-disable-next-line max-len
      wrapper: ({ children }) => <ConfigTemplateContext.Provider value={{ isTemplate: false }} children={children}/>
    })

    expect(result.current.getEnforcedActionMsg([{ isEnforced: false }])).toBe('')
  })
})
