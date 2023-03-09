import { createContext, useContext } from 'react'

import { RolesEnum }   from '@acx-ui/types'
import { useTenantId } from '@acx-ui/utils'

import {
  useAllowedOperationsQuery,
  useGetUserProfileQuery
} from './services'
import { UserProfile }              from './types'
import { setUserProfile, hasRoles } from './userProfile'

export interface UserProfileContextProps {
  data: UserProfile
  hasRole: typeof hasRoles
  isPrimeAdmin: () => boolean
  allowedOperations: string[]
}

const isPrimeAdmin = () => hasRoles(RolesEnum.PRIME_ADMIN)
const hasRole = hasRoles

// eslint-disable-next-line max-len
export const UserProfileContext = createContext<UserProfileContextProps>({} as UserProfileContextProps)
export const useUserProfileContext = () => useContext(UserProfileContext)

export function UserProfileProvider (props: React.PropsWithChildren) {
  const tenantId = useTenantId()
  const { data: profile } = useGetUserProfileQuery({ params: { tenantId } })
  const { data: allowedOperations } = useAllowedOperationsQuery(tenantId!, {
    skip: !Boolean(profile)
  })

  if (!profile || !allowedOperations) return null

  setUserProfile({ profile, allowedOperations })

  return <UserProfileContext.Provider
    value={{ allowedOperations, data: profile, hasRole, isPrimeAdmin }}
    children={props.children}
  />
}
