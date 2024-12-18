import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { AddCustomRole }        from './AddCustomRole'
import { AddExplictCustomRole } from './ExplictCustomRoles/AddExplictCustomRole'

export function AddNewCustomRole () {
  const isExplicitCustomRoleEnabled = useIsSplitOn(Features.RBAC_PHASE3_TOGGLE)

  return (
    isExplicitCustomRoleEnabled ? <AddExplictCustomRole /> : <AddCustomRole />
  )
}
