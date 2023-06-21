/* eslint-disable max-len */
import { defineMessage, MessageDescriptor  } from 'react-intl'

type States = Record<string, string>

export type CodeInfo = {
  category: MessageDescriptor;
  summary: MessageDescriptor;
  priority: MessageDescriptor;
}

export const data: { states: States, codes: Record<string, CodeInfo> } = {
  states: {
    new: 'new',
    applyScheduled: 'applyscheduled',
    applyScheduleInProgress: 'applyscheduleinprogress',
    applied: 'applied',
    applyFailed: 'applyfailed',
    beforeApplyInterrupted: 'beforeapplyinterrupted',
    afterApplyInterrupted: 'afterapplyinterrupted',
    applyWarning: 'applywarning',
    revertScheduled: 'revertscheduled',
    revertScheduleInProgress: 'revertscheduleinprogress',
    revertFailed: 'revertfailed',
    reverted: 'reverted',
    deleted: 'deleted'
  },
  codes: {
    'c-bgscan24g-enable': {
      category: defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
      summary: defineMessage({ defaultMessage: 'Auto channel selection mode and background scan on 2.4 GHz radio' }),
      priority: defineMessage({ defaultMessage: 'medium' })
    },
    'c-bgscan5g-enable': {
      category: defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
      summary: defineMessage({ defaultMessage: 'Auto channel selection mode and background scan on 5 GHz radio' }),
      priority: defineMessage({ defaultMessage: 'medium' })
    },
    'c-bgscan24g-timer': {
      category: defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
      summary: defineMessage({ defaultMessage: 'Background scan timer on 2.4 GHz radio' }),
      priority: defineMessage({ defaultMessage: 'low' })
    },
    'c-bgscan5g-timer': {
      category: defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
      summary: defineMessage({ defaultMessage: 'Background scan timer on 5 GHz radio' }),
      priority: defineMessage({ defaultMessage: 'low' })
    },
    'c-dfschannels-enable': {
      category: defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
      summary: defineMessage({ defaultMessage: 'Enable DFS channels' }),
      priority: defineMessage({ defaultMessage: 'medium' })
    },
    'c-dfschannels-disable': {
      category: defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
      summary: defineMessage({ defaultMessage: 'Disable DFS channels' }),
      priority: defineMessage({ defaultMessage: 'low' })
    },
    'c-bandbalancing-enable': {
      category: defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
      summary: defineMessage({ defaultMessage: 'Enable band balancing' }),
      priority: defineMessage({ defaultMessage: 'low' })
    },
    'c-bandbalancing-enable-below-61': {
      category: defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
      summary: defineMessage({ defaultMessage: 'Enable band balancing' }),
      priority: defineMessage({ defaultMessage: 'low' })
    },
    'c-bandbalancing-proactive': {
      category: defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
      summary: defineMessage({ defaultMessage: 'Change band balancing mode' }),
      priority: defineMessage({ defaultMessage: 'low' })
    },
    'c-aclb-enable': {
      category: defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
      summary: defineMessage({ defaultMessage: 'Enable load balancing based on client count' }),
      priority: defineMessage({ defaultMessage: 'low' })
    },
    'i-zonefirmware-upgrade': {
      category: defineMessage({ defaultMessage: 'Infrastructure' }),
      summary: defineMessage({ defaultMessage: 'Zone firmware upgrade' }),
      priority: defineMessage({ defaultMessage: 'medium' })
    },
    'c-txpower-same': {
      category: defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
      summary: defineMessage({ defaultMessage: 'Tx power setting for 2.4 GHz and 5 GHz radio' }),
      priority: defineMessage({ defaultMessage: 'medium' })
    },
    'c-txpower5g-low': {
      category: defineMessage({ defaultMessage: 'Wi-Fi Client Experience' }),
      summary: defineMessage({ defaultMessage: 'Tx power is low for 5 GHz' }),
      priority: defineMessage({ defaultMessage: 'medium' })
    },
    's-wlanauth-open': {
      category: defineMessage({ defaultMessage: 'Security' }),
      summary: defineMessage({ defaultMessage: 'WLAN with Open Security' }),
      priority: defineMessage({ defaultMessage: 'medium' })
    },
    's-wlanauth-weak': {
      category: defineMessage({ defaultMessage: 'Security' }),
      summary: defineMessage({ defaultMessage: 'Weak WLAN authentication method' }),
      priority: defineMessage({ defaultMessage: 'medium' })
    },
    'p-multicasttraffic-limit': {
      category: defineMessage({ defaultMessage: 'AP Performance' }),
      summary: defineMessage({ defaultMessage: 'Multicast/Broadcast traffic flood' }),
      priority: defineMessage({ defaultMessage: 'medium' })
    },
    'c-crrm-channel24g-auto': {
      category: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
      summary: defineMessage({ defaultMessage: 'More optimal channel plan and channel bandwidth selection on 2.4 GHz radio' }),
      priority: defineMessage({ defaultMessage: 'high' })
    },
    'c-crrm-channel5g-auto': {
      category: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
      summary: defineMessage({ defaultMessage: 'More optimal channel plan and channel bandwidth selection on 5 GHz radio' }),
      priority: defineMessage({ defaultMessage: 'high' })
    },
    'c-crrm-channel6g-auto': {
      category: defineMessage({ defaultMessage: 'AI-Driven Cloud RRM' }),
      summary: defineMessage({ defaultMessage: 'More optimal channel plan and channel bandwidth selection on 6 GHz radio' }),
      priority: defineMessage({ defaultMessage: 'high' })
    }
  }
}

export default data

