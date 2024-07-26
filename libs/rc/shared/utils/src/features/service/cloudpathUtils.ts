import { RolesEnum } from '@acx-ui/types'
import { hasRoles }  from '@acx-ui/user'

export function hasCloudpathAccess () {
  return hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
}
