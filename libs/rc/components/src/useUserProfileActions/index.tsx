import { useGetUserProfileQuery } from '@acx-ui/rc/services'
import { RolesEnum }              from '@acx-ui/rc/utils'
import { useParams }              from '@acx-ui/react-router-dom'


export function useUserProfileActions () {
  const params = useParams()
  const userProfileData = useGetUserProfileQuery({ params })
  const userData = userProfileData.data

  const hasRole = (userRole: string): boolean => {
    return userData?.roles.find(role => role === userRole) !== undefined
  }

  const verifyIsPrimeAdminUser = () => {
    return hasRole(RolesEnum.PRIME_ADMIN)
  }

  return {
    ...userProfileData,
    hasRole,
    verifyIsPrimeAdminUser
  }
}