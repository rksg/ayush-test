
import React from 'react'

import { useIsSplitOn }                              from '@acx-ui/feature-toggle'
import { ConfigTemplateContext, ConfigTemplateType } from '@acx-ui/rc/utils'
import { renderHook }                                from '@acx-ui/test-utils'

import { ConfigTemplateEnforcementContext } from './constants'

import { useEnforcedStatus } from '.'

describe('useEnforcedStatus', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  it('should return false when enforcement FF is false', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    const { result } = renderHook(() => useEnforcedStatus(ConfigTemplateType.NETWORK), {
      // eslint-disable-next-line max-len
      wrapper: ({ children }) => <ConfigTemplateContext.Provider value={{ isTemplate: false }} children={children}/>
    })
    expect(result.current.hasEnforcedItem([{ isEnforced: true }])).toBe(false)
  })

  it('should return false when isTemplate is true', () => {
    const { result } = renderHook(() => useEnforcedStatus(ConfigTemplateType.NETWORK), {
      // eslint-disable-next-line max-len
      wrapper: ({ children }) => <ConfigTemplateContext.Provider value={{ isTemplate: true }} children={children}/>
    })

    expect(result.current.hasEnforcedItem([{ isEnforced: true }])).toBe(false)
  })

  it('should return true for a single object with isEnforced true', () => {
    const { result } = renderHook(() => useEnforcedStatus(ConfigTemplateType.NETWORK), {
      // eslint-disable-next-line max-len
      wrapper: ({ children }) => <ConfigTemplateContext.Provider value={{ isTemplate: false }} children={children}/>
    })

    expect(result.current.hasEnforcedItem([{ isEnforced: true }])).toBe(true)
  })

  it('should return true if any item in the array has isEnforced true', () => {
    const { result } = renderHook(() => useEnforcedStatus(ConfigTemplateType.NETWORK), {
      // eslint-disable-next-line max-len
      wrapper: ({ children }) => <ConfigTemplateContext.Provider value={{ isTemplate: false }} children={children}/>
    })

    // eslint-disable-next-line max-len
    expect(result.current.hasEnforcedItem([{ isEnforced: false }, { isEnforced: true }])).toBe(true)
  })

  it('should return false if all items in the array have isEnforced false', () => {
    const { result } = renderHook(() => useEnforcedStatus(ConfigTemplateType.NETWORK), {
      // eslint-disable-next-line max-len
      wrapper: ({ children }) => <ConfigTemplateContext.Provider value={{ isTemplate: false }} children={children}/>
    })

    // eslint-disable-next-line max-len
    expect(result.current.hasEnforcedItem([{ isEnforced: false }, { isEnforced: false }])).toBe(false)
  })

  it('should return the enforced action message if condition is met', () => {
    const { result } = renderHook(() => useEnforcedStatus(ConfigTemplateType.NETWORK), {
      // eslint-disable-next-line max-len
      wrapper: ({ children }) => <ConfigTemplateContext.Provider value={{ isTemplate: false }} children={children}/>
    })

    expect(result.current.getEnforcedActionMsg([{ isEnforced: true }]))
      .toBe('Action is disabled due to enforcement from the template')
  })

  it('should return empty string if condition is not met', () => {
    const { result } = renderHook(() => useEnforcedStatus(ConfigTemplateType.NETWORK), {
      // eslint-disable-next-line max-len
      wrapper: ({ children }) => <ConfigTemplateContext.Provider value={{ isTemplate: false }} children={children}/>
    })

    expect(result.current.getEnforcedActionMsg([{ isEnforced: false }])).toBe('')
  })

  describe('getEnforcedStepsFormProps', () => {
    const expectedButtonProps = {
      disabled: true,
      tooltip: 'Action is disabled due to enforcement from the template'
    }

    type WrapperProps = {
      enforcedFromContext?: boolean,
      children: React.ReactElement
    }
    const Wrapper: React.FC<WrapperProps> = ({ enforcedFromContext, children }) => {
      if (enforcedFromContext === undefined) {
        return <ConfigTemplateContext.Provider value={{ isTemplate: false }}>
          {children}
        </ConfigTemplateContext.Provider>
      }

      return <ConfigTemplateContext.Provider value={{ isTemplate: false }}>
        <ConfigTemplateEnforcementContext.Provider value={{ isEnforced: enforcedFromContext }}>
          {children}
        </ConfigTemplateEnforcementContext.Provider>
      </ConfigTemplateContext.Provider>
    }

    const renderUseEnforcedStatus = (enforcedFromContext?: boolean) => {
      return renderHook(() => useEnforcedStatus(ConfigTemplateType.NETWORK), {
        // eslint-disable-next-line max-len
        wrapper: ({ children }) => <Wrapper enforcedFromContext={enforcedFromContext} children={children} />
      })
    }

    it('should return the correct StepsForm props when isEnforced is true', () => {
      const { result: resultWithoutContext } = renderUseEnforcedStatus()

      expect(resultWithoutContext.current.getEnforcedStepsFormProps('StepsForm', true)).toEqual({
        buttonProps: { apply: expectedButtonProps }
      })

      const { result: resultWithContext } = renderUseEnforcedStatus(true)

      expect(resultWithContext.current.getEnforcedStepsFormProps('StepsForm')).toEqual({
        buttonProps: { apply: expectedButtonProps }
      })
    })

    it('should return the correct StepsFormLegacy props when isEnforced is true', () => {
      const { result: resultWithoutContext } = renderUseEnforcedStatus()

      // eslint-disable-next-line max-len
      expect(resultWithoutContext.current.getEnforcedStepsFormProps('StepsFormLegacy', true)).toEqual({
        buttonProps: { submit: expectedButtonProps }
      })

      const { result: resultWithContext } = renderUseEnforcedStatus(true)

      expect(resultWithContext.current.getEnforcedStepsFormProps('StepsFormLegacy')).toEqual({
        buttonProps: { submit: expectedButtonProps }
      })
    })

    it('should return undefined when isEnforced is false', () => {
      const { result: resultWithoutContext } = renderUseEnforcedStatus()

      expect(resultWithoutContext.current.getEnforcedStepsFormProps('StepsForm')).toBeUndefined()

      const { result: resultWithContext } = renderUseEnforcedStatus(false)

      expect(resultWithContext.current.getEnforcedStepsFormProps('StepsForm')).toBeUndefined()
    })
  })
})
