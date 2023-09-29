import { createContext, ReactNode, useContext } from 'react'

import { UserProfile }    from './types'
import { getUserProfile } from './userProfile'

export interface UserProfileContextProps {
  data: UserProfile
}

// eslint-disable-next-line max-len
export const UserProfileContext = createContext<UserProfileContextProps>({} as UserProfileContextProps)
export const useUserProfileContext = () => useContext(UserProfileContext)

export function UserProfileProvider (props: { children: ReactNode }) {
  const { children } = props

  return <UserProfileContext.Provider value={{ data: getUserProfile() }} children={children} />
}
