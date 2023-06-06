/* Provide profile outside component */
import { UserProfile } from './types'

const user = {
  profile: {} as UserProfile
}

export const getUserProfile = () => user.profile
export const setUserProfile = (profile: UserProfile) => {
  // Do not call this manually except in test env & UserProfileProvider
  user.profile = profile
}
