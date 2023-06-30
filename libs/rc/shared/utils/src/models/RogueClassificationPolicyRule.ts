import { RogueClassificationEnum } from './RogueClassificationEnum'
import { RogueRuleTypeEnum }       from './RogueRuleTypeEnum'

export class RogueClassificationPolicyRule {
  // Used to communicate additional information about the rogue AP.  This parameter’s value is dependent on the rogue classification policy rule used.

  moreInfo?: string

  name: string

  // | ENUM | Meaning |\n |-|-|\n | ExcessivePowerRule | Rule classifying as rogue an AP whose transmissions are being received above a certain SNR threshold. The default SNR threshold is 90 dB. |\n | CustomSsidRule| Custom rule to classify an AP which is broadcasting an SSID matching the one provided by this rule. |\n | CustomSnrRule | Custom rule to classify an AP whose frames are received at an SNR below the threshold provided by this rule. |\n | CustomMacOuiRule | Custom rule to classify an AP which is broadcasting a BSSID OUI (i.e. an organizationally unique identifier, the first 3 bytes of the MAC address) matching the one provided by this rule. |\n | AdHocRule | Rule classifying ad hoc networks as rogue networks. An ad hoc network, also known as an Independent Basic Service Set (IBSS) is one in which the transmitting stations are not in infrastructure mode (i.e., they don’t have a wired network connection). |\n | SsidSpoofingRule | Rule classifying as rogue an AP which is broadcasting the same SSID as one of the WLANs in the venue but is not managed by the cloud. |\n | MacSpoofingRule | Rule classifying as rogue an AP which is broadcasting the same BSSID (AP MAC address) as one of the WLANs in the venue but is not managed by the cloud. |\n | CTSAbuseRule | Rule classifying as rogue an AP which is transmitting to a specific receiver MAC address more CTS (clear to send) frames/second than the detection threshold (the default threshold is 50 frames/second).   |\n | RTSAbuseRule | Rule classifying as rogue an AP which is transmitting to a specific receiver MAC address more RTS (request to send) frames/second than the detection threshold (the default threshold is 50 frames/second). |\n | DeauthFloodRule | Rule classifying as rogue an AP which is transmitting more Deauthentication frames/second than the detection threshold (the default threshold is 50 frames/second). |\n | DisassocFloodRule | Rule classifying as rogue an AP which is transmitting more Disassociation frames/second than the detection threshold (the default threshold is 50 frames/second). |\n | NullSSIDRule | Rule classifying as rogue an AP which is broadcasting a null SSID.                                                                                                                                                                                        |\n | SameNetworkRule | Rule classifying as rogue an AP whose MAC address received via an Ethernet interface matches the upper 2 bytes of a rogue AP’s BSSID (MAC address) and its lower 4 bytes in all but 2 bit locations.
  type: RogueRuleTypeEnum

  // | ENUM | Meaning |\n |-|-|\n | Known | Identified and permitted devices. examples include hot spots in allowed areas, permitted secondary networks installed by local users, temporary venue use, etc. |\n | Malicious | Identified and un-permitted devices. examples include unauthorized hot spots, unapproved secondary networks installed by local users, nefarious users trying to spoof traffic or steal data, etc. |\n | Ignore | Identified and ignored devices. examples include known wireless from adjacent buildings, \"built-in\" carrier provided wireless like Xfinity or COX, etc. |\n | Unclassified | Unidentified devices that have not been classified by policy or by admin. This is the default class. |
  classification: RogueClassificationEnum

  priority: number

  constructor () {
    this.name = ''

    this.type = RogueRuleTypeEnum.AdhocRule

    this.classification = RogueClassificationEnum.Ignored

    this.priority = 0
  }
}
