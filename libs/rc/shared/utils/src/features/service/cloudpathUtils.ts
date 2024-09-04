import { RolesEnum }                          from '@acx-ui/types'
import { hasCrossVenuesPermission, hasRoles } from '@acx-ui/user'

export function hasCloudpathAccess () {
  return hasCrossVenuesPermission() && hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
}
