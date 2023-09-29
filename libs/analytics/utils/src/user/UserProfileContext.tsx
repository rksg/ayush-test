import { createContext, ReactNode, useContext } from 'react'

import { useSearchParams } from '@acx-ui/react-router-dom'

import { Tenant, UserProfile }            from './types'
import { setUserProfile, getUserProfile } from './userProfile'

export interface UserProfileContextProps {
  data: UserProfile
}

// eslint-disable-next-line max-len
export const UserProfileContext = createContext<UserProfileContextProps>({} as UserProfileContextProps)
export const useUserProfileContext = () => useContext(UserProfileContext)

export function UserProfileProvider (props: { profile: UserProfile, children: ReactNode }) {
  const { profile, children } = props
  const [ search ] = useSearchParams()
  const permissions = profile.tenants?.filter(
    (tenant: Tenant) => tenant.id === profile.accountId
  )[0]!.permissions
  const data = { ...profile, permissions }
  setUserProfile(data, search.get('selectedTenants'))
  return <UserProfileContext.Provider value={{ data: getUserProfile() }} children={children} />
}
