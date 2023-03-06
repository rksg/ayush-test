import { createContext, useContext } from 'react'

import { RolesEnum }   from '@acx-ui/types'
import { useTenantId } from '@acx-ui/utils'

import { rolesOk }         from './helpers'
import {
  useAllowedOperationsQuery,
  useGetUserProfileQuery
} from './services'
import { UserProfile }                    from './types'
import { getUserProfile, setUserProfile } from './userProfile'

export interface UserProfileContextProps {
  data: UserProfile
  hasRole: (role: RolesEnum) => boolean
  isPrimeAdmin: () => boolean
  allowedOperations: string[]
}

const isPrimeAdmin = () => rolesOk(getUserProfile().profile, RolesEnum.PRIME_ADMIN)
const hasRole = (role: RolesEnum) => rolesOk(getUserProfile().profile, [role])

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
