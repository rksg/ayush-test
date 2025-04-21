import { ReactElement } from 'react'

import { defineMessage, MessageDescriptor } from 'react-intl'

import { get }            from '@acx-ui/config'
import { TenantNavigate } from '@acx-ui/react-router-dom'
import {
  RbacOpsIds,
  RolesEnum as Role,
  ScopeKeys
} from '@acx-ui/types'
import { AccountTier } from '@acx-ui/utils'

import {
  type UserProfile,
  type RaiPermission,
  type RaiPermissions,
  CustomRoleType,
  FeatureAPIResults
} from './types'

type Permission = {
  needGlobalPermission: boolean
}

type Profile = {
  profile: UserProfile
  allowedOperations: string []
  accountTier?: string
  betaEnabled?: boolean
  abacEnabled?: boolean
  rbacOpsApiEnabled?: boolean
  allVenuesEnabled?: boolean
  scopes?: ScopeKeys
  isCustomRole?: boolean,
  hasAllVenues?: boolean,
  venuesList?: string[],
  selectedBetaListEnabled?: boolean,
  betaFeaturesList?: FeatureAPIResults[]
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
  scopeKey?: ScopeKeys,
  key?: string,
  rbacOpsIds?: RbacOpsIds
  props?: {
    rbacOpsIds?: RbacOpsIds,
    scopeKey?: ScopeKeys,
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
  userProfile.rbacOpsApiEnabled = profile.rbacOpsApiEnabled
  userProfile.allVenuesEnabled = profile.allVenuesEnabled
  userProfile.isCustomRole = profile.isCustomRole
  userProfile.scopes = profile?.scopes
  userProfile.hasAllVenues = profile?.hasAllVenues
  userProfile.venuesList = profile?.venuesList
  userProfile.betaFeaturesList = profile?.betaFeaturesList
}
export const getUserName = () =>
  `${userProfile.profile.firstName} ${userProfile.profile.lastName}`

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

export function hasAccess (props?: { legacyKey?: string,
  rbacOpsIds?: RbacOpsIds, roles?: Role[] }) {
  if (get('IS_MLISA_SA')) return true
  // measure to permit all undefined id for admins
  const { rbacOpsApiEnabled } = getUserProfile()
  if(rbacOpsApiEnabled) {
    return (props?.rbacOpsIds)
      ? hasAllowedOperations(props?.rbacOpsIds) : true
  } else {
    if(props?.legacyKey?.startsWith(SHOW_WITHOUT_RBAC_CHECK)) return true
    return hasRoles(props?.roles || [Role.PRIME_ADMIN, Role.ADMINISTRATOR, Role.DPSK_ADMIN])
  }
}

/**
 * Checks if the user has the required RBAC permissions for the allowed operations API.
 *
 * @param rbacOpsIds The operational IDs (RbacOpsIds) to validate against the user's profile.
 *
 * OR  -> If it's a single operation or any single scope in the list matches, access is granted (e.g., `['DELETE:/venues', 'DELETE:/networks']`).
 * AND ->  If the `opsId` is an array, all elements must match (e.g., `[['DELETE:/venues', 'DELETE:/networks']]`).
 */
export function hasAllowedOperations (rbacOpsIds: RbacOpsIds) {
  const { rbacOpsApiEnabled, allowedOperations } = getUserProfile()
  if (rbacOpsApiEnabled && rbacOpsIds.length > 0) {
    return rbacOpsIds?.some(rbacOpsIds => {
      if (Array.isArray(rbacOpsIds)) {
        return rbacOpsIds.every(i => allowedOperations.includes(i))
      } else {
        return allowedOperations.includes(rbacOpsIds)
      }
    })
  }
  return true
}

export function filterByAccess <Item> (items: Item[]) {
  if (get('IS_MLISA_SA')) {
    return items
  } else {
    return items.filter(item => {
      const filterItem = item as FilterItemType
      const allowedOperations = filterItem?.rbacOpsIds || filterItem?.props?.rbacOpsIds || []
      const legacyKey = filterItem?.key
      const scopes = filterItem?.scopeKey || filterItem?.props?.scopeKey || []
      return hasPermission({ scopes, rbacOpsIds: allowedOperations, legacyKey })
    })
  }
}

export function filterByOperations <Item> (items: Item[]) {
  if (get('IS_MLISA_SA')) return items

  const { rbacOpsApiEnabled } = getUserProfile()
  if (!rbacOpsApiEnabled) return items

  return items.filter(item => {
    const filterItem = item as FilterItemType
    const allowedOperations = filterItem?.rbacOpsIds || filterItem?.props?.rbacOpsIds
    return allowedOperations ? hasAllowedOperations(allowedOperations) : true
  })
}

let permissions: RaiPermissions = {} as RaiPermissions
export const setRaiPermissions = (perms: RaiPermissions) => {
  permissions = perms
}

// use hasRaiPermission to enforce permission in RAI standalone
export function hasRaiPermission (permission: RaiPermission) {
  return !get('IS_MLISA_SA') || permissions[permission]
}

/**
* use hasPermission when enforcing for both R1 and RAI standalone at the same time
* IMPORTANT: Suggest using hasPermission for action items, as it will always return FALSE for Role.READ_ONLY.
*/
export function hasPermission (props?: {
    // RAI
    permission?: RaiPermission,
    // R1
    scopes?: ScopeKeys,
    rbacOpsIds?: RbacOpsIds,
    roles?: Role[],
    legacyKey?: string,
}): boolean {
  const { scopes = [], rbacOpsIds, permission, roles, legacyKey } = props || {}
  if (get('IS_MLISA_SA')) {
    return !!(permission && permissions[permission])
  } else {
    const { abacEnabled, isCustomRole, rbacOpsApiEnabled } = getUserProfile()
    if (rbacOpsApiEnabled) {
      return hasAccess({ rbacOpsIds: rbacOpsIds })
    } else if (!abacEnabled) {
      return hasAccess({ roles, legacyKey })
    } else {
      if (isCustomRole) {
        const isScopesValid = scopes.length > 0 ? hasScope(scopes) : true
        return !!isScopesValid
      } else {
        return hasAccess({ roles, legacyKey })
      }
    }
  }
}

/**
 * Check if the user has the required scopes based on the user's profile.
 *
 * @param userScopes The scopes to check against the user's profile.
 *
 * OR  -> WifiScopes|SwitchScopes|EdgeScopes: means the scope is optional, and the user can have any one of these scopes.
 * AND -> (WifiScopes|SwitchScopes|EdgeScopes)[]: means the user must have these specific scopes.
 *
 */
export function hasScope (userScopes: ScopeKeys) {
  const { abacEnabled, scopes = [], isCustomRole } = getUserProfile()
  if(abacEnabled && isCustomRole) {
    return userScopes?.some(scope => {
      if(Array.isArray(scope)) {
        return scope.every(i => scopes.includes(i))
      } else {
        return scopes.includes(scope)
      }
    })
  }
  return true
}


export function hasRoles (roles: string | string[]) {
  const { profile, abacEnabled } = getUserProfile()


  if (!Array.isArray(roles)) roles = [roles]

  if (abacEnabled &&
    profile.customRoleType === CustomRoleType.SYSTEM &&
    profile.customRoleName) {
    return roles.includes(profile.customRoleName)
  }

  return profile?.roles?.some(role => roles.includes(role))
}

export function isCustomAdmin () {
  const { profile, abacEnabled } = getUserProfile()
  if (abacEnabled &&
    profile.customRoleType === CustomRoleType.SYSTEM &&
    profile.customRoleName === Role.ADMINISTRATOR) {
    return !profile?.roles?.includes(Role.ADMINISTRATOR)
  }
  return false
}

export function hasCrossVenuesPermission (props?: Permission) {
  if (get('IS_MLISA_SA')) {
    return true
  }
  const { abacEnabled, hasAllVenues, isCustomRole, rbacOpsApiEnabled } = getUserProfile()
  if(rbacOpsApiEnabled) return true

  if(!abacEnabled) return true
  if(props?.needGlobalPermission) {
    return !isCustomRole && hasAllVenues && hasRoles([Role.PRIME_ADMIN, Role.ADMINISTRATOR])
  } else {
    return hasAllVenues
  }
}

export function AuthRoute (props: {
    scopes?: ScopeKeys,
    children: ReactElement,
    rbacOpsIds?: RbacOpsIds,
    unsupportedTiers?: AccountTier[]
    requireCrossVenuesPermission?: boolean | Permission
  }) {
  const { scopes = [], children,
    requireCrossVenuesPermission, rbacOpsIds = [], unsupportedTiers } = props
  const { rbacOpsApiEnabled, accountTier } = getUserProfile()

  let authorizedElement = children

  if (Array.isArray(unsupportedTiers) && unsupportedTiers.length > 0) {
    authorizedElement = unsupportedTiers.includes(accountTier as AccountTier)
      ? <TenantNavigate replace to='/no-permissions' /> : children
  }

  if (rbacOpsApiEnabled) {
    const shouldSkipRBACCheck = rbacOpsIds.length === 0
    return (shouldSkipRBACCheck || hasAllowedOperations(rbacOpsIds))
      ? authorizedElement : <TenantNavigate replace to='/no-permissions' />
  }

  if(typeof requireCrossVenuesPermission === 'object') {
    return hasCrossVenuesPermission(requireCrossVenuesPermission)
      ? authorizedElement : <TenantNavigate replace to='/no-permissions' />
  }

  if(requireCrossVenuesPermission) {
    return hasScope(scopes) && hasCrossVenuesPermission()
      ? authorizedElement : <TenantNavigate replace to='/no-permissions' />
  }

  return hasScope(scopes) ? authorizedElement : <TenantNavigate replace to='/no-permissions' />
}


export function WrapIfAccessible ({ id, wrapper, children }: {
  id: string,
  wrapper: (children: React.ReactElement) => React.ReactElement,
  children: React.ReactElement
}) {
  return hasAccess({ legacyKey: id }) ? wrapper(children) : children
}
WrapIfAccessible.defaultProps = { id: undefined }


export const roleStringMap: Record<Role, MessageDescriptor> = {
  [Role.PRIME_ADMIN]: defineMessage({ defaultMessage: 'Prime Admin' }),
  [Role.ADMINISTRATOR]: defineMessage({ defaultMessage: 'Administrator' }),
  [Role.GUEST_MANAGER]: defineMessage({ defaultMessage: 'Guest Manager' }),
  [Role.READ_ONLY]: defineMessage({ defaultMessage: 'Read Only' }),
  [Role.DPSK_ADMIN]: defineMessage({ defaultMessage: 'DPSK Manager' }),
  [Role.TEMPLATES_ADMIN]: defineMessage({ defaultMessage: 'Templates Management' }),
  [Role.REPORTS_ADMIN]: defineMessage({ defaultMessage: 'Reports Admin' })
}
