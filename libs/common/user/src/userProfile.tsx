import { ReactElement } from 'react'

import { defineMessage, MessageDescriptor } from 'react-intl'

import { get }               from '@acx-ui/config'
import { TenantNavigate }    from '@acx-ui/react-router-dom'
import { RolesEnum as Role } from '@acx-ui/types'

import { UserProfile, WifiScopes, SwitchScopes, EdgeScopes } from './types'

type Profile = {
  profile: UserProfile
  allowedOperations: string []
  accountTier?: string
  betaEnabled?: boolean
  abacEnabled?: boolean
  scopes?: (WifiScopes|SwitchScopes|EdgeScopes)[]
  isCustomRole?: boolean
}
const userProfile: Profile = {
  profile: {} as UserProfile,
  allowedOperations: [],
  accountTier: '',
  betaEnabled: false,
  abacEnabled: false,
  scopes: []
}
const SHOW_WITHOUT_RBAC_CHECK = 'SHOW_WITHOUT_RBAC_CHECK'

interface FilterItemType {
  scopeKey?: (WifiScopes|SwitchScopes|EdgeScopes)[],
  key?: string,
  props?: {
    scopeKey?: (WifiScopes|SwitchScopes|EdgeScopes)[],
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
  userProfile.isCustomRole = profile.isCustomRole
  userProfile.scopes = profile?.scopes
}

export const getShowWithoutRbacCheckKey = (id:string) => {
  return SHOW_WITHOUT_RBAC_CHECK + '_' + id
}

/**
 * Please use RBAC functions as follows,
 * 1. filterByAccess -> Backward compatible
 * 2. hasPermission -> For the new RBAC feature: replace the original "hasAccess" function
 * 3. hasScope -> For the new RBAC feature: custom role
 * 4. hasRoles -> No change
 *
 * DO NOT use hasAccess. It will be private after RBAC feature release.
 */

export function hasAccess (id?: string) {
  if (get('IS_MLISA_SA')) return true
  // measure to permit all undefined id for admins
  if (!id) return hasRoles([Role.PRIME_ADMIN, Role.ADMINISTRATOR, Role.DPSK_ADMIN])
  return hasAllowedOperations(id)
}

function hasAllowedOperations (id:string) {
  const { allowedOperations } = getUserProfile()

  if(id.startsWith(SHOW_WITHOUT_RBAC_CHECK)) return true
  return allowedOperations?.includes(id)
}

export function filterByAccess <Item> (items: Item[]) {
  return items.filter(item => {
    const filterItem = item as FilterItemType
    const allowedOperations = filterItem?.key
    const scopes = filterItem?.scopeKey || filterItem?.props?.scopeKey || []
    return hasPermission({ scopes, allowedOperations })
  })
}

export function hasPermission (props?: {
    scopes?:(WifiScopes|SwitchScopes|EdgeScopes)[],
    allowedOperations?:string
  }) {
  const { abacEnabled, isCustomRole } = getUserProfile()
  const { scopes = [], allowedOperations } = props || {}
  if(!abacEnabled) {
    return hasAccess(allowedOperations)
  }else {
    if(isCustomRole){
      const isScopesValid = scopes.length > 0 ? hasScope(scopes): true
      const isOperationsValid = allowedOperations ? hasAllowedOperations(allowedOperations): true
      return isScopesValid && isOperationsValid
    } else {
      return hasAccess(allowedOperations)
    }
  }
}

export function hasScope (userScopes: (WifiScopes|SwitchScopes|EdgeScopes)[]) {
  const { abacEnabled, scopes, isCustomRole } = getUserProfile()
  if(abacEnabled && isCustomRole) {
    return scopes?.some(scope => userScopes.includes(scope))
  }
  return true
}


export function hasRoles (roles: string | string[]) {
  const { profile } = getUserProfile()

  if (!Array.isArray(roles)) roles = [roles]

  return profile?.roles?.some(role => roles.includes(role))
}

export function AuthRoute (props: {
    scopes: (WifiScopes|SwitchScopes|EdgeScopes)[],
    children: ReactElement
  }) {
  const { scopes, children } = props
  return !hasScope(scopes) ? <TenantNavigate replace to='/no-permissions' /> : children
}


export function WrapIfAccessible ({ id, wrapper, children }: {
  id: string,
  wrapper: (children: React.ReactElement) => React.ReactElement,
  children: React.ReactElement
}) {
  return hasAccess(id) ? wrapper(children) : children
}
WrapIfAccessible.defaultProps = { id: undefined }


export const roleStringMap: Record<Role, MessageDescriptor> = {
  [Role.PRIME_ADMIN]: defineMessage({ defaultMessage: 'Prime Admin' }),
  [Role.ADMINISTRATOR]: defineMessage({ defaultMessage: 'Administrator' }),
  [Role.GUEST_MANAGER]: defineMessage({ defaultMessage: 'Guest Manager' }),
  [Role.READ_ONLY]: defineMessage({ defaultMessage: 'Read Only' }),
  [Role.DPSK_ADMIN]: defineMessage({ defaultMessage: 'DPSK Manager' })
}
