import { useIdentityGroupPageHeaderTitle } from '@acx-ui/cloudpath/components'
import { ConfigTemplateContext }           from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { renderHook }                      from '@acx-ui/test-utils'

describe('identityGroupUtils', () => {
  it('should render create identity group page header', () => {
    const { result: pageTitleResult } = renderHook(() =>
      useIdentityGroupPageHeaderTitle({ isEdit: false }))

    expect(pageTitleResult.current).toBe('Create Identity Group ')
  })

  it('should render create identity group page header in Config Template view', () => {
    const { result: pageTitleResult } = renderHook(() =>
      useIdentityGroupPageHeaderTitle({ isEdit: false }),
    {
      wrapper: ({ children }) => {
        return <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
          <Provider>
            {children}
          </Provider>
        </ConfigTemplateContext.Provider>
      }
    })

    expect(pageTitleResult.current).toBe('Create Identity Group Template')
  })

  it('should render edit identity group page header', () => {
    const { result: pageTitleResult } = renderHook(() =>
      useIdentityGroupPageHeaderTitle({ isEdit: true }))

    expect(pageTitleResult.current).toBe('Edit Identity Group ')
  })

  it('should render edit identity group page header in Config Template view', () => {
    const { result: pageTitleResult } = renderHook(() =>
      useIdentityGroupPageHeaderTitle({ isEdit: true }),
    {
      wrapper: ({ children }) => {
        return <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
          <Provider>
            {children}
          </Provider>
        </ConfigTemplateContext.Provider>
      }
    })

    expect(pageTitleResult.current).toBe('Edit Identity Group Template')
  })
})
