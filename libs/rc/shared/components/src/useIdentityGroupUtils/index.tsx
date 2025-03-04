import { PersonaUrls }                                    from '@acx-ui/rc/utils'
import { hasAllowedOperations, hasCrossVenuesPermission } from '@acx-ui/user'
import { getOpsApi }                                      from '@acx-ui/utils'


export const hasCreateIdentityGroupPermission = () =>
  hasCrossVenuesPermission({ needGlobalPermission: true }) &&
  hasAllowedOperations([getOpsApi(PersonaUrls.addPersonaGroup)])

export const hasCreateIdentityPermission = () =>
  hasCrossVenuesPermission({ needGlobalPermission: true }) &&
  hasAllowedOperations([getOpsApi(PersonaUrls.addPersona)])
