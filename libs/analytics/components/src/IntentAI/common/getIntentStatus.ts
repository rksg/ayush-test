import { defineMessage } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

import { states }        from '../config'
import { DisplayStates } from '../states'

export function getIntentStatus (displayStatus: DisplayStates, retries?: number) {
  const { $t } = getIntl()
  const state = states[displayStatus] ?? { text: defineMessage({ defaultMessage: 'Unknown' }) }
  return $t(state.text) + (state.showRetries && retries && retries > 1
    ? ' ' + $t({ defaultMessage: '(retry {retries} of 2)' }, { retries: retries - 1 })
    : ''
  )
}
