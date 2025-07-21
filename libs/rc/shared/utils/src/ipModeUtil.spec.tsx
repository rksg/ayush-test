import React from 'react'
import { ConfigTemplateContext } from '@acx-ui/rc/utils'
import { renderHook } from '@acx-ui/test-utils'
import { Provider } from '@acx-ui/store'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { useIpModeValidatorSelector } from './ipModeUtil'

// Mock the dependencies
jest.mock('@acx-ui/feature-toggle')

const mockUseIsSplitOn = useIsSplitOn as jest.MockedFunction<typeof useIsSplitOn>

describe('ipModeValidatorSelector', () => {
  // Mock validators for testing
  const mockIpv4Validator = jest.fn()
  const mockIpv6Validator = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseIsSplitOn.mockReturnValue(false)
  })

  it('Should return IPv4 validator when feature flag is disabled and not in template mode', async () => {
    // Arrange
    mockUseIsSplitOn.mockReturnValue(false) // Feature flag disabled
    
    mockIpv4Validator.mockResolvedValue(Promise.resolve())
    mockIpv6Validator.mockResolvedValue(Promise.resolve())

    // Act
    const { result } = renderHook(() => useIpModeValidatorSelector(mockIpv4Validator, mockIpv6Validator))
    const validator = result.current
    await validator('test-value')

    // Assert
    expect(mockIpv4Validator).toHaveBeenCalledWith('test-value')
    expect(mockIpv6Validator).not.toHaveBeenCalled()
  })

  it('Should return IPv4 validator when feature flag is disabled and in template mode', async () => {
    // Arrange
    mockUseIsSplitOn.mockReturnValue(false) // Feature flag disabled
    
    mockIpv4Validator.mockResolvedValue(Promise.resolve())
    mockIpv6Validator.mockResolvedValue(Promise.resolve())

    // Act
    const { result } = renderHook(() => useIpModeValidatorSelector(mockIpv4Validator, mockIpv6Validator), {
      wrapper: ({ children }) => {
        return <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
          <Provider>
            {children}
          </Provider>
        </ConfigTemplateContext.Provider>
      }
    })
    const validator = result.current
    await validator('test-value')

    // Assert
    expect(mockIpv4Validator).toHaveBeenCalledWith('test-value')
    expect(mockIpv6Validator).not.toHaveBeenCalled()
  })

  it('Should return IPv4 validator when feature flag is enabled but in template mode', async () => {
    // Arrange
    mockUseIsSplitOn.mockReturnValue(true) // Feature flag enabled
    
    mockIpv4Validator.mockResolvedValue(Promise.resolve())
    mockIpv6Validator.mockResolvedValue(Promise.resolve())

    // Act
    const { result } = renderHook(() => useIpModeValidatorSelector(mockIpv4Validator, mockIpv6Validator), {
      wrapper: ({ children }) => (
        <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
          {children}
        </ConfigTemplateContext.Provider>
      )
    })
    const validator = result.current
    await validator('test-value')

    // Assert
    expect(mockIpv4Validator).toHaveBeenCalledWith('test-value')
    expect(mockIpv6Validator).not.toHaveBeenCalled()
  })

  it('Should return IPv6 validator when feature flag is enabled and not in template mode', async () => {
    // Arrange
    mockUseIsSplitOn.mockReturnValue(true) // Feature flag enabled
    
    mockIpv4Validator.mockResolvedValue(Promise.resolve())
    mockIpv6Validator.mockResolvedValue(Promise.resolve())

    // Act
    const { result } = renderHook(() => useIpModeValidatorSelector(mockIpv4Validator, mockIpv6Validator))
    const validator = result.current
    await validator('test-value')

    // Assert
    expect(mockIpv6Validator).toHaveBeenCalledWith('test-value')
    expect(mockIpv4Validator).not.toHaveBeenCalled()
  })

  it('Should pass through validation errors from IPv4 validator', async () => {
    // Arrange
    mockUseIsSplitOn.mockReturnValue(false)
    
    const errorMessage = 'IPv4 validation failed'
    mockIpv4Validator.mockRejectedValue(new Error(errorMessage))
    mockIpv6Validator.mockResolvedValue(Promise.resolve())

    // Act & Assert
    const { result } = renderHook(() => useIpModeValidatorSelector(mockIpv4Validator, mockIpv6Validator))
    const validator = result.current
    await expect(validator('test-value')).rejects.toThrow(errorMessage)
  })

  it('Should pass through validation errors from IPv6 validator', async () => {
    // Arrange
    mockUseIsSplitOn.mockReturnValue(true)
    
    const errorMessage = 'IPv6 validation failed'
    mockIpv4Validator.mockResolvedValue(Promise.resolve())
    mockIpv6Validator.mockRejectedValue(new Error(errorMessage))

    // Act & Assert
    const { result } = renderHook(() => useIpModeValidatorSelector(mockIpv4Validator, mockIpv6Validator))
    const validator = result.current
    await expect(validator('test-value')).rejects.toThrow(errorMessage)
  })

  it('Should work with different data types', async () => {
    // Arrange
    mockUseIsSplitOn.mockReturnValue(true)
    
    mockIpv4Validator.mockResolvedValue(Promise.resolve())
    mockIpv6Validator.mockResolvedValue(Promise.resolve())

    // Act
    const { result } = renderHook(() => useIpModeValidatorSelector(mockIpv4Validator, mockIpv6Validator))
    const validator = result.current
    
    // Test with different types
    await validator('string-value')
    await validator(123)
    await validator({ key: 'value' })

    // Assert
    expect(mockIpv6Validator).toHaveBeenCalledWith('string-value')
    expect(mockIpv6Validator).toHaveBeenCalledWith(123)
    expect(mockIpv6Validator).toHaveBeenCalledWith({ key: 'value' })
  })

  it('Should call the correct feature flag', () => {
    // Arrange
    mockUseIsSplitOn.mockReturnValue(false)

    // Act
    renderHook(() => useIpModeValidatorSelector(mockIpv4Validator, mockIpv6Validator))

    // Assert
    expect(mockUseIsSplitOn).toHaveBeenCalledWith(Features.WIFI_EDA_IP_MODE_CONFIG_TOGGLE)
  })

  it('Should handle multiple calls with different feature flag states', async () => {
    // Arrange
    mockIpv4Validator.mockResolvedValue(Promise.resolve())
    mockIpv6Validator.mockResolvedValue(Promise.resolve())

    // First call: feature flag disabled
    mockUseIsSplitOn.mockReturnValue(false)
    
    const { result: result1 } = renderHook(() => useIpModeValidatorSelector(mockIpv4Validator, mockIpv6Validator))
    const validator1 = result1.current
    await validator1('test1')

    // Second call: feature flag enabled
    mockUseIsSplitOn.mockReturnValue(true)
    
    const { result: result2 } = renderHook(() => useIpModeValidatorSelector(mockIpv4Validator, mockIpv6Validator))
    const validator2 = result2.current
    await validator2('test2')

    // Assert
    expect(mockIpv4Validator).toHaveBeenCalledWith('test1')
    expect(mockIpv6Validator).toHaveBeenCalledWith('test2')
  })
}) 