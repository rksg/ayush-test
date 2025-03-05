import { rest } from 'msw'

import { useIsSplitOn }                                                                 from '@acx-ui/feature-toggle'
import { configTemplateApi, configTemplateInstanceEnforcedApiMap }                      from '@acx-ui/rc/services'
import { ConfigTemplateContext, ConfigTemplateType }                                    from '@acx-ui/rc/utils'
import { Provider, store }                                                              from '@acx-ui/store'
import { fireEvent, mockServer, render, renderHook, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { EnforcedButton, useEnforcedStatus } from '.'

describe('EnforcedButton', () => {
  const networkResponseGenerator = jest.fn()

  beforeEach(() => {
    networkResponseGenerator.mockReturnValue(generateEnforcedNetworkResponse(false))

    store.dispatch(configTemplateApi.util.resetApiState())
    mockServer.use(
      rest.post(
        configTemplateInstanceEnforcedApiMap[ConfigTemplateType.NETWORK].url,
        (req, res, ctx) => res(ctx.json(networkResponseGenerator()))
      )
    )
  })

  it('disables the button and shows tooltip when enforcement is active', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    networkResponseGenerator.mockReturnValue(generateEnforcedNetworkResponse(true))

    render(<Provider>
      <ConfigTemplateContext.Provider value={{ isTemplate: false }}>
        <EnforcedButton
          configTemplateType={ConfigTemplateType.NETWORK}
          instanceId={'12345'}
        >Test Button</EnforcedButton>
      </ConfigTemplateContext.Provider>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    expect(screen.getByRole('button')).toBeDisabled()

    fireEvent.mouseOver(screen.getByText('Test Button'))
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Action is disabled due to enforcement from the template')
  })

  it('renders enabled button when enforcement is inactive', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    networkResponseGenerator.mockReturnValue(generateEnforcedNetworkResponse(false))

    render(<Provider>
      <ConfigTemplateContext.Provider value={{ isTemplate: false }}>
        <EnforcedButton
          configTemplateType={ConfigTemplateType.NETWORK}
          instanceId={'12345'}
        >Test Button</EnforcedButton>
      </ConfigTemplateContext.Provider>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    expect(screen.getByRole('button')).toBeEnabled()
  })

  it('does not check enforcement when isTemplate is true', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider>
      <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
        <EnforcedButton
          configTemplateType={ConfigTemplateType.NETWORK}
          instanceId={'12345'}
        >Test Button</EnforcedButton>
      </ConfigTemplateContext.Provider>
    </Provider>)

    expect(screen.getByRole('button')).toBeEnabled()
  })

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
})

function generateEnforcedNetworkResponse (isEnforced: boolean) {
  return {
    fields: ['name', 'id'],
    totalCount: 1,
    page: 1,
    data: [
      {
        name: 'test-psk',
        id: '936ad54680ba4e5bae59ae1eb817ca24',
        isEnforced
      }
    ]
  }
}
