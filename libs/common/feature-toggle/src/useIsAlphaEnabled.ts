import { useUserProfileContext } from '@acx-ui/user'
import { getJwtTokenPayload }    from '@acx-ui/utils'

export function useIsAlphaEnabled (): boolean {
  const { data: userProfile, betaEnabled } = useUserProfileContext()
  const jwtPayload = getJwtTokenPayload()
  return ((betaEnabled && userProfile?.dogfood) || !!jwtPayload.isAlphaFlag)
}
