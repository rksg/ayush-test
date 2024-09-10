import { defineMessage } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

import { states }        from '../config'
import { DisplayStates } from '../states'

export function getIntentStatus (displayStatus: DisplayStates, tooltip?: boolean) {
  const { $t } = getIntl()
  const unknownText = { text: defineMessage({ defaultMessage: 'Unknown' }) }
  const unknownTooltip = { tooltip: defineMessage({ defaultMessage: 'Unknown' }) }
  const state = states[displayStatus] ?? (tooltip ? unknownTooltip : unknownText)
  return tooltip ? $t(state.tooltip) : $t(state.text)
}
