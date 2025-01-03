import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { AddCustomRole }         from './AddCustomRole'
import { AddExplicitCustomRole } from './ExplicitCustomRoles/AddExplicitCustomRole'

export function AddNewCustomRole () {
  const isExplicitCustomRoleEnabled = useIsSplitOn(Features.RBAC_PHASE3_TOGGLE)

  return (
    isExplicitCustomRoleEnabled ? <AddExplicitCustomRole /> : <AddCustomRole />
  )
}
