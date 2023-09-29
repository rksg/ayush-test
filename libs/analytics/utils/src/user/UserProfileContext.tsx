import { createContext, ReactNode, useContext } from 'react'

import { useSearchParams } from '@acx-ui/react-router-dom'

import { UserProfile }                    from './types'
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
  setUserProfile(profile, search.get('selectedTenants'))
  return <UserProfileContext.Provider value={{ data: getUserProfile() }} children={children} />
}
