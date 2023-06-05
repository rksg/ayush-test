import { createContext, useContext } from 'react'

import { RolesEnum }                     from '@acx-ui/types'
import { useTenantId, useLocaleContext } from '@acx-ui/utils'

import {
  useAllowedOperationsQuery,
  useGetUserProfileQuery
} from './services'
import { UserProfile }              from './types'
import { setUserProfile, hasRoles } from './userProfile'

export interface UserProfileContextProps {
  data: UserProfile | undefined
  allowedOperations: string[]
  hasRole: typeof hasRoles
  isPrimeAdmin: () => boolean
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
  const { data: allowedOperations } = useAllowedOperationsQuery(tenantId!, {
    skip: !Boolean(profile)
  })

  if (allowedOperations) setUserProfile({ profile: profile!, allowedOperations })

  return <UserProfileContext.Provider
    value={{ data: profile, allowedOperations: allowedOperations || [], hasRole, isPrimeAdmin }}
    children={props.children}
  />
}
