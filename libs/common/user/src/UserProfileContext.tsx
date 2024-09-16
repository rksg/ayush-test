import { createContext, useContext } from 'react'

import { useParams } from 'react-router-dom'

import { RolesEnum as Role } from '@acx-ui/types'
import { useTenantId }       from '@acx-ui/utils'

import {
  useGetAccountTierQuery,
  useGetBetaStatusQuery,
  useGetUserProfileQuery,
  useFeatureFlagStatesQuery,
  useGetVenuesListQuery
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
  abacEnabled?: boolean
  isCustomRole?: boolean
  hasAllVenues?: boolean
  venuesList?: string[]
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

  let abacEnabled = false, isCustomRole = false
  const abacFF = 'abac-policies-toggle'
  // const ptenantRbacFF = 'acx-ui-rbac-api-ptenant-toggle'

  const { data: featureFlagStates, isLoading: isFeatureFlagStatesLoading }
    = useFeatureFlagStatesQuery(
      { params: { tenantId }, payload: [abacFF] },
      { skip: !Boolean(profile) }
    )
  // const ptenantRbacEnable = featureFlagStates?.[ptenantRbacFF] ?? false
  abacEnabled = featureFlagStates?.[abacFF] ?? false

  const { data: beta } = useGetBetaStatusQuery(
    { params: { tenantId }, enableRbac: abacEnabled },
    { skip: !Boolean(profile) })
  const betaEnabled = beta?.enabled === 'true'
  const { data: accTierResponse } = useGetAccountTierQuery(
    { params: { tenantId }, enableRbac: abacEnabled },
    { skip: !Boolean(profile) })
  const accountTier = accTierResponse?.acx_account_tier

  // TODO: should remove in future
  const allowedOperations = [] as string[]

  const getHasAllVenues = () => {
    if(abacEnabled && profile?.scopes?.includes('venue' as never)) {
      return false
    }
    return true
  }

  const hasAllVenues = getHasAllVenues()

  const params = useParams()
  const payload = {
    fields: ['id'],
    pageSize: 10000
  }

  const { data: venues } = useGetVenuesListQuery({ params, payload },
    { skip: !abacEnabled || hasAllVenues })

  const venuesList: string[] = (venues?.data.map(item => item.id)
    .filter((id): id is string => id !== undefined)) || []

  if (allowedOperations && accountTier && !isFeatureFlagStatesLoading) {
    isCustomRole = profile?.customRoleType?.toLocaleLowerCase()?.includes('custom') ?? false
    const userProfile = { ...profile } as UserProfile
    if(!abacEnabled && isCustomRole) {
      // TODO: Will remove this after RBAC feature release
      userProfile.role = userProfile.role in Role ? userProfile.role : Role.PRIME_ADMIN
      userProfile.roles = userProfile.roles
        .every(r => r in Role) ? userProfile.roles : [Role.PRIME_ADMIN]
      isCustomRole = false
    }
    setUserProfile({
      profile: userProfile,
      allowedOperations,
      accountTier,
      betaEnabled,
      abacEnabled,
      isCustomRole,
      scopes: profile?.scopes,
      hasAllVenues,
      venuesList
    })
  }

  return <UserProfileContext.Provider
    value={{
      data: profile,
      isUserProfileLoading: isUserProfileFetching,
      allowedOperations: allowedOperations,
      hasRole,
      isPrimeAdmin,
      hasAccess,
      accountTier: accountTier,
      betaEnabled,
      abacEnabled,
      isCustomRole,
      hasAllVenues,
      venuesList
    }}
    children={props.children}
  />
}
