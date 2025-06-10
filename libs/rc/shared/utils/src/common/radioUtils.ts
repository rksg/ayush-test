/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'

export function useSupportedApModelTooltip () {
  const { $t } = useIntl()
  const wifi7_320Mhz_FeatureFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_320MHZ)
  const ap70BetaFlag = useIsTierAllowed(TierFeatures.AP_70)
  const supportWifi7_320MHz = ap70BetaFlag && wifi7_320Mhz_FeatureFlag

  return supportWifi7_320MHz ?
    $t({ defaultMessage: 'These settings apply only to AP models that support tri-band, such as R770, R760 and R560' }) :
    $t({ defaultMessage: 'These settings apply only to AP models that support tri-band, such as R760 and R560' })
}
