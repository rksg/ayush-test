import { RolesEnum as Role } from '@acx-ui/types'

import { accessOk, rolesOk } from './helpers'
import { UserProfile }       from './types'

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
  // Do not call this manually except in test env
  userProfile.profile = profile.profile
  userProfile.allowedOperations = profile.allowedOperations
}

export function hasAccess (id?: string) {
  const { profile, allowedOperations } = getUserProfile()

  // temp measure to permit all undefined id for admins
  if (!id) return rolesOk(profile, [Role.PRIME_ADMIN, Role.ADMINISTRATOR])

  return accessOk(allowedOperations, id)
}

export function filterByAccess <Item> (items?: Item[]) {
  return items?.filter(item => hasAccess((item as { key?: string }).key))
}

export function hasRoles (roles: string | string[]) {
  const { profile } = getUserProfile()
  return rolesOk(profile, roles)
}
