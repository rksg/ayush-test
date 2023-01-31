import { createContext, useContext } from 'react'

import { useGetUserProfileQuery } from '@acx-ui/rc/services'
import { UserProfile }            from '@acx-ui/rc/utils'
import { getJwtTokenPayload }     from '@acx-ui/utils'

export const UserProfileContext = createContext<UserProfile | undefined>(undefined)

export function useUserProfileContext () {
  return useContext(UserProfileContext)
}

export function UserProfileProvider (props: React.PropsWithChildren) {
  const { tenantId } = getJwtTokenPayload()
  const { data } = useGetUserProfileQuery({ params: { tenantId } })
  return <UserProfileContext.Provider value={data}>
    {props.children}
  </UserProfileContext.Provider>
}
