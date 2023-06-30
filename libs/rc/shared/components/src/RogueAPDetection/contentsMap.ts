import { defineMessage, MessageDescriptor } from 'react-intl'

import { RogueRuleType } from '@acx-ui/rc/utils'

export const rogueRuleLabelMapping: Record<RogueRuleType, MessageDescriptor> = {
  [RogueRuleType.AD_HOC_RULE]: defineMessage({ defaultMessage: 'Ad Hoc' }),
  [RogueRuleType.CTS_ABUSE_RULE]: defineMessage({ defaultMessage: 'CTS Abuse' }),
  [RogueRuleType.DEAUTH_FLOOD_RULE]: defineMessage({ defaultMessage: 'Deauth Flood' }),
  [RogueRuleType.DISASSOC_FLOOD_RULE]: defineMessage({ defaultMessage: 'Disassoc Flood' }),
  [RogueRuleType.EXCESSIVE_POWER_RULE]: defineMessage({ defaultMessage: 'Excessive Power' }),
  [RogueRuleType.LOW_SNR_RULE]: defineMessage({ defaultMessage: 'Low SNR' }),
  [RogueRuleType.CUSTOM_SNR_RULE]: defineMessage({ defaultMessage: 'Low SNR' }),
  [RogueRuleType.MAC_OUI_RULE]: defineMessage({ defaultMessage: 'MAC OUI' }),
  [RogueRuleType.CUSTOM_MAC_OUI_RULE]: defineMessage({ defaultMessage: 'MAC OUI' }),
  [RogueRuleType.MAC_SPOOFING_RULE]: defineMessage({ defaultMessage: 'MAC Spoofing' }),
  [RogueRuleType.NULL_SSID_RULE]: defineMessage({ defaultMessage: 'Null SSID' }),
  [RogueRuleType.RTS_ABUSE_RULE]: defineMessage({ defaultMessage: 'RTS Abuse' }),
  [RogueRuleType.SAME_NETWORK_RULE]: defineMessage({ defaultMessage: 'Same Network' }),
  [RogueRuleType.SSID_RULE]: defineMessage({ defaultMessage: 'SSID' }),
  [RogueRuleType.CUSTOM_SSID_RULE]: defineMessage({ defaultMessage: 'SSID' }),
  [RogueRuleType.SSID_SPOOFING_RULE]: defineMessage({ defaultMessage: 'SSID Spoofing' })
}

export const PROFILE_MAX_COUNT = 64

export const RULE_MAX_COUNT = 32

export const VENUE_IN_PROFILE_MAX_COUNT = 64
