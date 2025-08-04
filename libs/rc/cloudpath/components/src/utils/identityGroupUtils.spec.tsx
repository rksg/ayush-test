import { ConfigTemplateContext } from '@acx-ui/rc/utils'
import { Provider }              from '@acx-ui/store'
import { renderHook }            from '@acx-ui/test-utils'

import {
  getIdentityGroupRoutePath,
  IdentityOperation,
  useIdentityGroupBreadcrumbs,
  useIdentityGroupPageHeaderTitle
} from './identityGroupUtils'

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  generateConfigTemplateBreadcrumb: () => [{ text: 'Configuration Templates' }]
}))

describe('identityGroupUtils', () => {
  describe('useIdentityGroupPageHeaderTitle', () => {
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

  describe('getIdentityGroupRoutePath', () => {
    it('should getIdentityGroupRoutePath correctly', () => {
      const groupId = 'id'
      const basePath = 'users/identity-management/identity-group'
      expect(getIdentityGroupRoutePath(IdentityOperation.CREATE, false))
        .toBe(`${basePath}/add`)
      expect(getIdentityGroupRoutePath(IdentityOperation.EDIT, false, groupId))
        .toBe(`${basePath}/${groupId}/edit`)
      expect(getIdentityGroupRoutePath(IdentityOperation.DETAIL, false, groupId))
        .toBe(`${basePath}/${groupId}`)
      expect(getIdentityGroupRoutePath(IdentityOperation.LIST, false))
        .toBe(`${basePath}`)

      // Template view
      const baseTemplatePath = 'identityManagement/identityGroups'
      expect(getIdentityGroupRoutePath(IdentityOperation.CREATE, true))
        .toBe(`${baseTemplatePath}/add`)
      expect(getIdentityGroupRoutePath(IdentityOperation.EDIT, true, groupId))
        .toBe(`${baseTemplatePath}/${groupId}/edit`)
      expect(getIdentityGroupRoutePath(IdentityOperation.DETAIL, true, groupId))
        .toBe(`${baseTemplatePath}/${groupId}/detail`)
      expect(getIdentityGroupRoutePath(IdentityOperation.LIST, true))
        .toBe(`${baseTemplatePath}`)
    })
  })

  describe('useIdentityGroupBreadcrumbs', () => {
    it('should render breadcrumbs for EC correctly', () => {
      const { result } = renderHook(() => useIdentityGroupBreadcrumbs(IdentityOperation.CREATE))
      expect(result.current).toEqual([
        {
          text: 'Clients'
        },
        {
          text: 'Identity Management'
        },
        {
          text: 'Identity Groups',
          link: 'users/identity-management/identity-group/add'
        }
      ])
    })

    it('should render breadcrumbs for MSP template correctly', () => {
      const { result } = renderHook(() => useIdentityGroupBreadcrumbs(IdentityOperation.CREATE),
        {
          wrapper: ({ children }) => {
            return <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
              <Provider>
                {children}
              </Provider>
            </ConfigTemplateContext.Provider>
          }
        })
      expect(result.current).toEqual([{ text: 'Configuration Templates' }])
    })
  })
})
