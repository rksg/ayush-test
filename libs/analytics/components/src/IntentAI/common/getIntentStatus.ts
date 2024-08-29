import { defineMessage } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

import { states }        from '../config'
import { DisplayStates } from '../states'

export function getIntentStatus (displayStatus: DisplayStates) {
  const { $t } = getIntl()
  const state = states[displayStatus] ?? { text: defineMessage({ defaultMessage: 'Unknown' }) }
  return $t(state.text)
}
