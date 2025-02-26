/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const messageMappings = {
  description: defineMessage({ defaultMessage: 'Define how this network traffic will be tunnelled at <venueSingular></venueSingular> "{venueName}":' }),
  drawer_description: defineMessage({ defaultMessage: 'Define how this network traffic will be tunneled at <venueSingular></venueSingular>.' }),
  localbreakout_opt_description: defineMessage({ defaultMessage: 'All network traffic will local breakout on this <venueSingular></venueSingular>' }),
  disable_deactivate_last_network: defineMessage({ defaultMessage: 'Cannot deactivate the last network at this <venueSingular></venueSingular>' }),
  disable_pin_network: defineMessage({ defaultMessage: 'This network already used in Personal Identity Network, cannot be SD-LAN traffic network.' }),
  pin_venue_msg: defineMessage({ defaultMessage: '<b>Note</b>: If you\'d like to choose Personal Identity Network as tunnel type for this network, please go to the PIN wizard({pinEditLink})' }),
  softgre_ipsec_setting_info: defineMessage({ defaultMessage: 'A <venueSingular></venueSingular> supports up to 3 SoftGRE activated profiles without IPsec or 1 SoftGRE with IPsec.' })
}
// 'The selected network is a PIN network. Please go to the PIN wizard to configure the network.'