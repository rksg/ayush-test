import { createContext, useContext } from 'react'

import { RolesEnum as Role } from '@acx-ui/types'
import { useTenantId }       from '@acx-ui/utils'

import {
  useAllowedOperationsQuery,
  useGetAccountTierQuery,
  useGetBetaStatusQuery,
  useGetUserProfileQuery,
  useFeatureFlagStatesQuery
} from './services'
import { UserProfile }                         from './types'
import { setUserProfile, hasRoles, hasAccess } from './userProfile'

export interface UserProfileContextProps {
  data: UserProfile | undefined
  isUserProfileLoading: boolean
  allowedOperations: string[]
  hasRole: typeof hasRoles
  hasAccess: typeof hasAccess
  isPrimeAdmin: () => boolean
  accountTier?: string
  betaEnabled?: boolean
}

const isPrimeAdmin = () => hasRoles(Role.PRIME_ADMIN)
const hasRole = hasRoles

// eslint-disable-next-line max-len
export const UserProfileContext = createContext<UserProfileContextProps>({} as UserProfileContextProps)
export const useUserProfileContext = () => useContext(UserProfileContext)

export function UserProfileProvider (props: React.PropsWithChildren) {
  const tenantId = useTenantId()
  const {
    data: profile,
    isFetching: isUserProfileFetching
  } = useGetUserProfileQuery({ params: { tenantId } })
  const { data: allowedOperations } = useAllowedOperationsQuery(tenantId!,
    { skip: !Boolean(profile) })
  const { data: beta } = useGetBetaStatusQuery({ params: { tenantId } },
    { skip: !Boolean(profile) })
  const betaEnabled = (beta?.enabled === 'true')? true : false
  const { data: accTierResponse } = useGetAccountTierQuery({ params: { tenantId } },
    { skip: !Boolean(profile) })

  const abacFF = 'abac-policies-toggle'
  const { data: featureFlagStates, isLoading: isFeatureFlagStatesLoading }
    = useFeatureFlagStatesQuery(
      { params: { tenantId }, payload: [abacFF] }, { skip: !Boolean(profile) }
    )

  const accountTier = accTierResponse?.acx_account_tier
  if (allowedOperations && accountTier && !isFeatureFlagStatesLoading) {
    let isCustomRole = !!profile?.customRoleName
    const abacEnabled = featureFlagStates?.[abacFF] ?? false
    const userProfile = { ...profile } as UserProfile
    if(!abacEnabled && isCustomRole) {
      // TODO: Will remove this after RBAC feature release
      userProfile.role = Role.PRIME_ADMIN
      userProfile.roles = [Role.PRIME_ADMIN]
      isCustomRole = false
    }
    setUserProfile({
      profile: userProfile,
      allowedOperations,
      accountTier,
      betaEnabled,
      abacEnabled,
      isCustomRole,
      scopes: profile?.scopes
    })
  }

  return <UserProfileContext.Provider
    value={{
      data: profile,
      isUserProfileLoading: isUserProfileFetching,
      allowedOperations: allowedOperations || [],
      hasRole,
      isPrimeAdmin,
      hasAccess,
      accountTier: accountTier,
      betaEnabled
    }}
    children={props.children}
  />
}
