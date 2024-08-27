import { defineMessage } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

// TODO: fix: temporary using recommendation states, use intent states later
import { states } from '../../Recommendations/config'
// import { states } from '../config'

// TODO: change status type to `keyof typeof states` later
export function getIntentStatus (displayStatus: string) {
  const { $t } = getIntl()
  const key = displayStatus as unknown as keyof typeof states
  // TODO: cleanup: remove unknown later
  const state = states[key] ?? { text: defineMessage({ defaultMessage: 'Unknown' }) }
  return $t(state.text)
}
