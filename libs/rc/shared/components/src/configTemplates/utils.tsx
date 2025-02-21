
import { useIsSplitOn }         from '@acx-ui/feature-toggle'
import { useConfigTemplate }    from '@acx-ui/rc/utils'
import { RbacOpsIds }           from '@acx-ui/types'
import { hasAllowedOperations } from '@acx-ui/user'

export const withTemplateFeatureGuard = <P extends object>(
  props: {
    WrappedComponent: React.FC<P>,
    featureId: string,
    rbacOpsIds?: RbacOpsIds
  }
): React.FC<P> => {
  const { WrappedComponent, featureId, rbacOpsIds } = props
  return (props: P) => {
    const isFFEnabled = useIsSplitOn(featureId)
    const { isTemplate } = useConfigTemplate()
    const hasRbacOps = !rbacOpsIds || hasAllowedOperations(rbacOpsIds)

    if (!isTemplate || !isFFEnabled || !hasRbacOps) return null

    return <WrappedComponent {...props} />
  }
}
