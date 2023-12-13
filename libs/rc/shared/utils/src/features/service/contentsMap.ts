import { defineMessage, MessageDescriptor } from 'react-intl'

import { ServiceType }          from '../../constants'
import { PassphraseFormatEnum } from '../../models/PassphraseFormatEnum'
import { PolicyDefaultAccess }  from '../../types'


export const passphraseFormatDescription: Record<PassphraseFormatEnum, MessageDescriptor> = {
  // eslint-disable-next-line max-len
  [PassphraseFormatEnum.MOST_SECURED]: defineMessage({ defaultMessage: 'Letters, numbers and symbols can be used' }),
  // eslint-disable-next-line max-len
  [PassphraseFormatEnum.KEYBOARD_FRIENDLY]: defineMessage({ defaultMessage: 'Only letters and numbers can be used' }),
  [PassphraseFormatEnum.NUMBERS_ONLY]: defineMessage({ defaultMessage: 'Only numbers can be used' })
}

export const defaultAccessLabelMapping: Record<PolicyDefaultAccess, MessageDescriptor> = {
  [PolicyDefaultAccess.ACCEPT]: defineMessage({ defaultMessage: 'ACCEPT' }),
  [PolicyDefaultAccess.REJECT]: defineMessage({ defaultMessage: 'REJECT' })
}

export const serviceTypeLabelMapping: Record<ServiceType, MessageDescriptor> = {
  [ServiceType.PORTAL]: defineMessage({ defaultMessage: 'Portal' }),
  [ServiceType.DHCP]: defineMessage({ defaultMessage: 'DHCP for Wi-Fi' }),
  [ServiceType.EDGE_DHCP]: defineMessage({ defaultMessage: 'DHCP for SmartEdge' }),
  [ServiceType.EDGE_FIREWALL]: defineMessage({ defaultMessage: 'Firewall' }),
  [ServiceType.EDGE_SD_LAN]: defineMessage({ defaultMessage: 'SD-LAN' }),
  [ServiceType.EDGE_SD_LAN_P2]: defineMessage({ defaultMessage: 'SD-LAN P2' }),
  [ServiceType.WIFI_CALLING]: defineMessage({ defaultMessage: 'Wi-Fi Calling' }),
  [ServiceType.MDNS_PROXY]: defineMessage({ defaultMessage: 'mDNS Proxy' }),
  [ServiceType.DPSK]: defineMessage({ defaultMessage: 'DPSK' }),
  [ServiceType.NETWORK_SEGMENTATION]: defineMessage(
    { defaultMessage: 'Personal Identity Network' }),
  [ServiceType.WEBAUTH_SWITCH]: defineMessage(
    { defaultMessage: 'Personal Identity Network Auth Page for Switch' }),
  [ServiceType.RESIDENT_PORTAL]: defineMessage({ defaultMessage: 'Resident Portal' })
}
