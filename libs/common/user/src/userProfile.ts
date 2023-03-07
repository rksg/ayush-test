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

  // temp measure to permit all undefined id for admins
  if (!id) return hasRoles([Role.PRIME_ADMIN, Role.ADMINISTRATOR])

  const action = operationMap[id]

  // allowed undefined operation
  // this is so helpers could skip `key` used in places like PageHeader’s extra prop
  if (!action) return true

  return allowedOperations.includes(action)
}

export function filterByAccess <Item> (items?: Item[]) {
  return items?.filter(item => hasAccess((item as { key?: string }).key))
}

export function hasRoles (roles: string | string[]) {
  const { profile } = getUserProfile()

  if (!Array.isArray(roles)) roles = [roles]

  return profile.roles.some(role => roles.includes(role))
}
