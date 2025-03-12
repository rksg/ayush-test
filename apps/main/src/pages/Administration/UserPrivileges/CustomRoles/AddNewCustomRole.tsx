import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { AddCustomRole }         from './AddCustomRole'
import { AddExplicitCustomRole } from './ExplicitCustomRoles/AddExplicitCustomRole'

export function AddNewCustomRole () {
  const isRbacPhase3ToggleEnabled = useIsSplitOn(Features.RBAC_PHASE3_TOGGLE)

  return (
    isRbacPhase3ToggleEnabled ? <AddExplicitCustomRole /> : <AddCustomRole />
  )
}
