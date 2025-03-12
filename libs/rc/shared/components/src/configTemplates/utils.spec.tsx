import { useIsSplitOn }          from '@acx-ui/feature-toggle'
import { ConfigTemplateContext } from '@acx-ui/rc/utils'
import { render, screen }        from '@acx-ui/test-utils'

import { withTemplateFeatureGuard } from './utils'

const mockedHasAllowedOperations = jest.fn()
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  hasAllowedOperations: () => mockedHasAllowedOperations()
}))

describe('Config Template shared components utils', () => {
  describe('withTemplateFeatureGuard', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockReset()
      mockedHasAllowedOperations.mockReset()
    })
    it('returns null when isTemplate is false', () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)

      const Component = withTemplateFeatureGuard({
        WrappedComponent: () => <div>Wrapped Component</div>,
        featureId: 'test-feature-id'
      })
      const { container } = render(
        <ConfigTemplateContext.Provider value={{ isTemplate: false }}>
          <Component />
        </ConfigTemplateContext.Provider>
      )

      expect(container.firstChild).toBeNull()
    })

    it('returns null when isFFEnabled is false', () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)

      const Component = withTemplateFeatureGuard({
        WrappedComponent: () => <div>Wrapped Component</div>,
        featureId: 'test-feature-id'
      })
      const { container } = render(
        <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
          <Component />
        </ConfigTemplateContext.Provider>
      )

      expect(container.firstChild).toBeNull()
    })

    it('returns null when hasRbacOps is false', () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockedHasAllowedOperations.mockReturnValue(false)

      const Component = withTemplateFeatureGuard({
        WrappedComponent: () => <div>Wrapped Component</div>,
        featureId: 'test-feature-id',
        rbacOpsIds: ['test-rbac-op']
      })
      const { container } = render(
        <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
          <Component />
        </ConfigTemplateContext.Provider>
      )

      expect(container.firstChild).toBeNull()
    })

    it('renders WrappedComponent when all conditions are true', () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockedHasAllowedOperations.mockReturnValue(true)

      const Component = withTemplateFeatureGuard({
        WrappedComponent: () => <div>Wrapped Component</div>,
        featureId: 'test-feature-id',
        rbacOpsIds: ['test-rbac-op']
      })
      render(
        <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
          <Component />
        </ConfigTemplateContext.Provider>
      )

      expect(screen.getByText('Wrapped Component')).toBeVisible()
    })
  })
})
