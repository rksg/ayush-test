import { defineMessage, MessageDescriptor } from 'react-intl'

import { RolesEnum as Role } from '@acx-ui/types'

import { UserProfile } from './types'

type Profile = {
  profile: UserProfile
  allowedOperations: string []
}
const userProfile: Profile = {
  profile: {} as UserProfile,
  allowedOperations: []
}

export const getUserProfile = () => userProfile
export const setUserProfile = (profile: Profile) => {
  // Do not call this manually except in test env & UserProfileProvider
  userProfile.profile = profile.profile
  userProfile.allowedOperations = profile.allowedOperations
}

// TODO:
// To expand the map when we start define IDs for operations
let operationMap: Record<string, string> = {}

export function hasAccess (id?: string) {
  const { allowedOperations } = getUserProfile()

  if(id === 'SHOW_WITHOUT_RBAC_CHECK') return true
  // temp measure to permit all undefined id for admins
  if (!id) return hasRoles([Role.PRIME_ADMIN, Role.ADMINISTRATOR, Role.DPSK_ADMIN])

  const action = operationMap[id]
  return allowedOperations.includes(action)
}

export function filterByAccess <Item> (items?: Item[]) {
  return items?.filter(item => hasAccess((item as { key?: string }).key))
}

export function WrapIfAccessible ({ id, wrapper, children }: {
  id: string,
  wrapper: (children: React.ReactElement) => React.ReactElement,
  children: React.ReactElement
}) {
  return hasAccess(id) ? wrapper(children) : children
}
WrapIfAccessible.defaultProps = { id: undefined }

export function hasRoles (roles: string | string[]) {
  const { profile } = getUserProfile()

  if (!Array.isArray(roles)) roles = [roles]

  return profile.roles.some(role => roles.includes(role))
}

export const roleStringMap: Record<Role, MessageDescriptor> = {
  [Role.PRIME_ADMIN]: defineMessage({ defaultMessage: 'Prime Admin' }),
  [Role.ADMINISTRATOR]: defineMessage({ defaultMessage: 'Administrator' }),
  [Role.GUEST_MANAGER]: defineMessage({ defaultMessage: 'Guest Manager' }),
  [Role.READ_ONLY]: defineMessage({ defaultMessage: 'Read Only' }),
  [Role.DPSK_ADMIN]: defineMessage({ defaultMessage: 'DPSK Manager' })
}
