import { useUserProfileContext } from '@acx-ui/user'

import { TierFeatures } from './features'

export function useIsBetaEnabled (featureKey: TierFeatures): boolean {
  const { betaEnabled, betaFeaturesList } = useUserProfileContext()
  return (betaEnabled ?? false) && (betaFeaturesList?.filter(feature => feature.id === featureKey)
    .some(feature => feature.enabled) ?? false)
}
