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
  return ((userRole === role && role === RolesEnum.READ_ONLY)? true : false)
}
