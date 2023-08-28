import { createContext, ReactNode, useContext } from 'react'

import { UserProfile }    from './types'
import { setUserProfile } from './userProfile'

export interface UserProfileContextProps {
  data: UserProfile
}

// eslint-disable-next-line max-len
export const UserProfileContext = createContext<UserProfileContextProps>({} as UserProfileContextProps)
export const useUserProfileContext = () => useContext(UserProfileContext)

export function UserProfileProvider (props: { profile: UserProfile, children: ReactNode }) {
  const { profile, children } = props
  setUserProfile(profile)
  return <UserProfileContext.Provider value={{ data: profile }} children={children} />
}
