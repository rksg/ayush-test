import { createContext, useContext } from 'react'

// import { useLocation } from 'react-router-dom'

import { useGetUserProfileQuery } from '@acx-ui/rc/services'
import { UserProfile, RolesEnum } from '@acx-ui/rc/utils'
import { useTenantId }            from '@acx-ui/utils'

export interface UserProfileContextProps {
  data: UserProfile | undefined;
  hasRole: (role: string) => boolean;
  isPrimeAdmin: () => boolean;
}

// eslint-disable-next-line max-len
export const UserProfileContext = createContext<UserProfileContextProps>({} as UserProfileContextProps)

export function useUserProfileContext () {
  return useContext(UserProfileContext)
}

export function UserProfileProvider (props: React.PropsWithChildren) {
  const tenantId = useTenantId()
  const { data } = useGetUserProfileQuery({ params: { tenantId } })

  const hasRole = (userRole: string): boolean => {
    return data?.roles.find(role => role === userRole) !== undefined
  }

  const isPrimeAdmin = () => {
    return hasRole(RolesEnum.PRIME_ADMIN)
  }

  return <UserProfileContext.Provider
    value={{
      data,
      hasRole,
      isPrimeAdmin
    }}
  >
    {props.children}
  </UserProfileContext.Provider>
}