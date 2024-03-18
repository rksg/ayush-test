import { createContext, useContext } from 'react'

import { RolesEnum }   from '@acx-ui/types'
import { useTenantId } from '@acx-ui/utils'

import {
  useAllowedOperationsQuery,
  useGetAccountTierQuery,
  useGetBetaStatusQuery,
  useGetUserProfileQuery
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
  rbacEnabled?: boolean
}

const isPrimeAdmin = () => hasRoles(RolesEnum.PRIME_ADMIN)
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
  const accountTier = accTierResponse?.acx_account_tier
  // TODO: get scope and rbac ff from API
  if (allowedOperations && accountTier) setUserProfile({ profile: profile!,
    allowedOperations, accountTier, betaEnabled })

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
