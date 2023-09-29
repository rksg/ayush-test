import { createContext, ReactNode, useContext } from 'react'

import { Tenant, UserProfile } from './types'
import { setUserProfile }      from './userProfile'

export interface UserProfileContextProps {
  data: UserProfile
}

// eslint-disable-next-line max-len
export const UserProfileContext = createContext<UserProfileContextProps>({} as UserProfileContextProps)
export const useUserProfileContext = () => useContext(UserProfileContext)

export function UserProfileProvider (props: { profile: UserProfile, children: ReactNode }) {
  const { profile, children } = props
  const permissions = profile.tenants?.filter(
    (tenant: Tenant) => tenant.id === profile.accountId
  )[0]!.permissions
  const data = { ...profile, permissions }
  setUserProfile(data)
  return <UserProfileContext.Provider value={{ data }} children={children} />
}
