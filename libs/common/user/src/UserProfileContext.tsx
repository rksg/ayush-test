import { createContext, useContext } from 'react'

import { RolesEnum }                     from '@acx-ui/types'
import { useTenantId, useLocaleContext } from '@acx-ui/utils'

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
  allowedOperations: string[]
  hasRole: typeof hasRoles
  hasAccess: typeof hasAccess
  isPrimeAdmin: () => boolean
  accountTier?: string
  betaEnabled?: boolean
}

const isPrimeAdmin = () => hasRoles(RolesEnum.PRIME_ADMIN)
const hasRole = hasRoles

// eslint-disable-next-line max-len
export const UserProfileContext = createContext<UserProfileContextProps>({} as UserProfileContextProps)
export const useUserProfileContext = () => useContext(UserProfileContext)

export function UserProfileProvider (props: React.PropsWithChildren) {
  const locale = useLocaleContext()
  const tenantId = useTenantId()
  const { data: profile } = useGetUserProfileQuery({ params: { tenantId } }, {
    // 401 will show error on UI, so locale needs to be loaded first
    skip: !Boolean(locale.messages)
  })
  const { data: allowedOperations } = useAllowedOperationsQuery(tenantId!,
    { skip: !Boolean(profile) })
  const { data: beta } = useGetBetaStatusQuery({ params: { tenantId } },
    { skip: !Boolean(locale.messages) })
  const betaEnabled = (beta?.enabled === 'true')? true : false
  const { data: accTierResponse } = useGetAccountTierQuery({ params: { tenantId } },
    { skip: !Boolean(locale.messages) })
  const accountTier = accTierResponse?.acx_account_tier
  if (allowedOperations && accountTier) setUserProfile({ profile: profile!,
    allowedOperations, accountTier, betaEnabled })

  return <UserProfileContext.Provider
    value={{
      data: profile,
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
