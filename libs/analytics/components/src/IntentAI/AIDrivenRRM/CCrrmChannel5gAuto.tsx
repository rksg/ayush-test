/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

import { isStandaloneSwitch } from '../common/isStandaloneSwitch'

import { createIntentAIDetails } from './IntentAIDetails'

export { kpis } from './common'
export { IntentAIForm } from './IntentAIForm'

export const IntentAIDetails = createIntentAIDetails({
  reason: {
    default: defineMessage({ defaultMessage: 'Based on our AI Analytics, enabling AI-Driven Cloud RRM will decrease the number of interfering links from {before} to {after}.' }),
    activeFull: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' }),
    activePartial: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.' })
  },
  tradeoff: isStandaloneSwitch({
    full: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' }),
    partial: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the zone level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage. Do note that any unlicensed APs added to the zone after AI-Driven Cloud RRM is applied will not be considered and this may result in suboptimal channel planning in the zone.' })
  }, {
    full: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage.' }),
    partial: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM will be applied at the <venueSingular></venueSingular> level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten. DFS channels with excessive radar events will also be automatically restricted from usage.' })
  })
})
