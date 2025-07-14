/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { TierFeatures, useIsTierAllowed } from '@acx-ui/feature-toggle'

export function useSupportedApModelTooltip () {
  const { $t } = useIntl()
  const ap70BetaFlag = useIsTierAllowed(TierFeatures.AP_70)

  return ap70BetaFlag ?
    $t({ defaultMessage: 'These settings apply only to AP models that support tri-band, such as R770, R760 and R560' }) :
    $t({ defaultMessage: 'These settings apply only to AP models that support tri-band, such as R760 and R560' })
}
