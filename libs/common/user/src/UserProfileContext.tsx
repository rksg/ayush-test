import { createContext, useContext } from 'react'

import { useParams } from 'react-router-dom'

import { RolesEnum as Role } from '@acx-ui/types'
import { useTenantId }       from '@acx-ui/utils'

import { getAIAllowedOperations } from './aiAllowedOperations'
import {
  useGetAccountTierQuery,
  useGetBetaStatusQuery,
  useGetUserProfileQuery,
  useFeatureFlagStatesQuery,
  useGetVenuesListQuery,
  useGetBetaFeatureListQuery,
  useGetAllowedOperationsQuery
} from './services'
import { FeatureAPIResults, UserProfile }      from './types'
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
  rbacOpsApiEnabled?: boolean
  allVenuesEnabled?: boolean
  isCustomRole?: boolean
  hasAllVenues?: boolean
  venuesList?: string[]
  selectedBetaListEnabled?: boolean
  betaFeaturesList?: FeatureAPIResults[]
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

  let abacEnabled = false,
    isCustomRole = false,
    rbacOpsApiEnabled = false,
    allVenuesEnabled = false

  const abacFF = 'abac-policies-toggle'
  const betaListFF = 'acx-ui-selective-early-access-toggle'
  const rbacOpsApiFF = 'acx-ui-rbac-allow-operations-api-toggle'
  const allVenuesFF = 'acx-ui-activity-all-venues-toggle'

  const { data: featureFlagStates, isLoading: isFeatureFlagStatesLoading }
    = useFeatureFlagStatesQuery(
      { params: { tenantId }, payload: [
        abacFF,
        betaListFF,
        rbacOpsApiFF
      ] },
      { skip: !Boolean(profile) }
    )
  abacEnabled = featureFlagStates?.[abacFF] ?? false
  rbacOpsApiEnabled = featureFlagStates?.[rbacOpsApiFF] ?? false
  allVenuesEnabled = featureFlagStates?.[allVenuesFF] ?? false
  const selectedBetaListEnabled = featureFlagStates?.[betaListFF] ?? false

  const { data: beta } = useGetBetaStatusQuery(
    { params: { tenantId }, enableRbac: abacEnabled },
    { skip: !Boolean(profile) })
  const betaEnabled = beta?.enabled === 'true'
  const { data: accTierResponse } = useGetAccountTierQuery(
    { params: { tenantId }, enableRbac: abacEnabled },
    { skip: !Boolean(profile) })
  const accountTier = accTierResponse?.acx_account_tier

  const { data: rcgAllowedOperations } = useGetAllowedOperationsQuery(
    undefined,
    { skip: !rbacOpsApiEnabled })
  const rcgOpsUri = rcgAllowedOperations?.allowedOperations.flatMap(op => op?.uri) || []
  const aiOpsUri = rbacOpsApiEnabled ? getAIAllowedOperations(profile).flatMap(op => op.uri) : []
  const allowedOperations = [...new Set([...rcgOpsUri, ...aiOpsUri])]

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

  const { data: features } = useGetBetaFeatureListQuery({ params },
    { skip: !(beta?.enabled === 'true') || !selectedBetaListEnabled })

  const betaFeaturesList: FeatureAPIResults[] = (features?.betaFeatures.filter((feature):
    feature is FeatureAPIResults => feature !== undefined)) || []

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
      rbacOpsApiEnabled,
      allVenuesEnabled,
      isCustomRole,
      scopes: profile?.scopes,
      hasAllVenues,
      venuesList,
      selectedBetaListEnabled,
      betaFeaturesList
    })
  }

  return <UserProfileContext.Provider
    value={{
      data: profile,
      isUserProfileLoading: isUserProfileFetching,
      allowedOperations,
      hasRole,
      isPrimeAdmin,
      hasAccess,
      accountTier: accountTier,
      betaEnabled,
      abacEnabled,
      rbacOpsApiEnabled,
      allVenuesEnabled,
      isCustomRole,
      hasAllVenues,
      venuesList,
      selectedBetaListEnabled,
      betaFeaturesList
    }}
    children={props.children}
  />
}
