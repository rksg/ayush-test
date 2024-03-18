import { defineMessage, MessageDescriptor } from 'react-intl'

import { RolesEnum as Role } from '@acx-ui/types'

import { UserProfile } from './types'

export type Profile = {
  profile: UserProfile
  allowedOperations: string []
  accountTier?: string
  betaEnabled?: boolean
  abacEnabled?: boolean
  scope?: string[]
}
const userProfile: Profile = {
  profile: {} as UserProfile,
  allowedOperations: [],
  accountTier: '',
  betaEnabled: false,
  abacEnabled: false,
  scope: []
}
const SHOW_WITHOUT_RBAC_CHECK = 'SHOW_WITHOUT_RBAC_CHECK'

interface FilterItemType {
  scopeKey?: string,
  key?: string,
  props?: {
    scopeKey?: string,
    key?: string
  }
}

export const getUserProfile = () => userProfile
export const setUserProfile = (profile: Profile) => {
  // Do not call this manually except in test env & UserProfileProvider
  userProfile.profile = profile.profile
  userProfile.allowedOperations = profile.allowedOperations
  userProfile.accountTier = profile.accountTier
  userProfile.betaEnabled = profile.betaEnabled
  userProfile.abacEnabled = profile.abacEnabled
  //TODO: wait for API
  // userProfile.scope = [
  //   'wifi-d', 'wifi-r', 'wifi-c', 'wifi-u',
  //   'switch-r'
  // ]
}

export const getShowWithoutRbacCheckKey = (id:string) => {
  return SHOW_WITHOUT_RBAC_CHECK + '_' + id
}

export function hasAccess (id?: string) {
  const { allowedOperations, scope, abacEnabled } = getUserProfile()
  // measure to permit all undefined id for admins
  if (!id) return hasRoles([Role.PRIME_ADMIN, Role.ADMINISTRATOR, Role.DPSK_ADMIN])
  if(id?.includes(SHOW_WITHOUT_RBAC_CHECK)) return true
  if (id && abacEnabled && scope) return scope.includes(id)

  return allowedOperations?.includes(id)
}

export function filterByAccess <Item> (items: Item[]) {
  const { abacEnabled } = getUserProfile()
  const key = abacEnabled ? 'scopeKey' : 'key'
  return items.filter(item => {
    const filterItem = item as FilterItemType
    const id = filterItem?.[key] || filterItem?.props?.[key]
    return hasAccess(id)
  })
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

  return profile?.roles?.some(role => roles.includes(role))
}

export const roleStringMap: Record<Role, MessageDescriptor> = {
  [Role.PRIME_ADMIN]: defineMessage({ defaultMessage: 'Prime Admin' }),
  [Role.ADMINISTRATOR]: defineMessage({ defaultMessage: 'Administrator' }),
  [Role.GUEST_MANAGER]: defineMessage({ defaultMessage: 'Guest Manager' }),
  [Role.READ_ONLY]: defineMessage({ defaultMessage: 'Read Only' }),
  [Role.DPSK_ADMIN]: defineMessage({ defaultMessage: 'DPSK Manager' })
}
