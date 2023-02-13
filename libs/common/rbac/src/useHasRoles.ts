import { useGetUserProfileQuery }          from '@acx-ui/rc/services'
import { getJwtTokenPayload, getTenantId } from '@acx-ui/utils'

enum RolesEnum {
  PRIME_ADMIN = 'PRIME_ADMIN',
  ADMINISTRATOR = 'ADMIN',
  GUEST_MANAGER = 'OFFICE_ADMIN',
  READ_ONLY = 'READ_ONLY'
}

export function useHasRoles (userRole: string): boolean {
  let { roles, role, tenantId } = getJwtTokenPayload()

  // when jwt is null as FF is disabled
  if (!tenantId) {
    tenantId = getTenantId()
  }
  const { data } = useGetUserProfileQuery({ params: { tenantId } })
  if (!role && !roles) {
    roles = data?.roles
    role = data?.role
  }

  // TODO: Need to optimize
  switch (userRole) {
    case RolesEnum.READ_ONLY:
      return !(roles?.filter((r: string) => r === userRole
        && role === RolesEnum.READ_ONLY) !== undefined)
    case RolesEnum.ADMINISTRATOR:
      return !(roles?.filter((r: string) => r === userRole
        && role === RolesEnum.ADMINISTRATOR) !== undefined)
    case RolesEnum.PRIME_ADMIN:
      return roles?.filter((r: string) => r === userRole
        && role === RolesEnum.PRIME_ADMIN) !== undefined
    default:
      return false
  }

}
