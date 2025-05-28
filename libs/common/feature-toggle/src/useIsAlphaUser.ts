import { useUserProfileContext } from '@acx-ui/user'

export function useIsAlphaUser (): boolean {
  const { data: userProfile, betaEnabled, alphaEnabled } = useUserProfileContext()
  return ((betaEnabled && userProfile?.dogfood) || !!alphaEnabled)
}
