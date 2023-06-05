import { createContext, useContext } from 'react'

import { useGetUserProfileQuery } from './services'
import { UserProfile }    from './types'
import { setUserProfile } from './userProfile'

export interface UserProfileContextProps {
  data: UserProfile | undefined
}

// eslint-disable-next-line max-len
export const UserProfileContext = createContext<UserProfileContextProps>({} as UserProfileContextProps)
export const useUserProfileContext = () => useContext(UserProfileContext)

export function UserProfileProvider (props: React.PropsWithChildren) {

  const { data: profile } = useGetUserProfileQuery({})

  setUserProfile(profile!)

  return <UserProfileContext.Provider
    value={{ data: profile }}
    children={props.children}
  />
}
