/* eslint-disable max-len */

import { defineMessage } from 'react-intl'

export const ccd80211ReasonCodes = [
  { id: 0,
    code: 0,
    text: defineMessage({ defaultMessage: 'Reserved' })
  },
  { id: 1,
    code: 1,
    text: defineMessage({ defaultMessage: 'Unspecified reason' })
  },
  { id: 2,
    code: 2,
    text: defineMessage({ defaultMessage: 'Previous authentication no longer valid' })
  },
  { id: 3,
    code: 3,
    text: defineMessage({ defaultMessage: 'Deauthenticated because sending STA is leaving (or has left) IBSS or ESS' })
  },
  { id: 4,
    code: 4,
    text: defineMessage({ defaultMessage: 'Disassociated due to inactivity' })
  },
  { id: 5,
    code: 5,
    text: defineMessage({ defaultMessage: 'Disassociated because AP is unable to handle all currently associated STAs' })
  },
  { id: 6,
    code: 6,
    text: defineMessage({ defaultMessage: 'Class 2 frame received from nonauthenticated STA' })
  },
  { id: 7,
    code: 7,
    text: defineMessage({ defaultMessage: 'Class 3 frame received from nonassociated STA' })
  },
  { id: 8,
    code: 8,
    text: defineMessage({ defaultMessage: 'Disassociated because sending STA is leaving (or has left) BSS' })
  },
  { id: 9,
    code: 9,
    text: defineMessage({ defaultMessage: 'STA requesting (re)association is not authenticated with responding STA' })
  },
  { id: 10,
    code: 10,
    text: defineMessage({ defaultMessage: 'Disassociated because the information in the Power Capability element is unacceptable' })
  },
  { id: 11,
    code: 11,
    text: defineMessage({ defaultMessage: 'Disassociated because the information in the Supported Channels element is unacceptable' })
  },
  { id: 12,
    code: 12,
    text: defineMessage({ defaultMessage: 'Disassociated due to BSS Transition Management' })
  },
  { id: 13,
    code: 13,
    text: defineMessage({ defaultMessage: 'Invalid RSN IE' })
  },
  { id: 14,
    code: 14,
    text: defineMessage({ defaultMessage: 'Message integrity code (MIC) failure' })
  },
  { id: 15,
    code: 15,
    text: defineMessage({ defaultMessage: '4-Way Handshake timeout' })
  },
  { id: 16,
    code: 16,
    text: defineMessage({ defaultMessage: 'Group Key Handshake timeout' })
  },
  { id: 17,
    code: 17,
    text: defineMessage({ defaultMessage: 'Element in 4-Way Handshake different from (Re)Association Request/Probe Response/Beacon frame' })
  },
  { id: 18,
    code: 18,
    text: defineMessage({ defaultMessage: 'Invalid group cipher' })
  },
  { id: 19,
    code: 19,
    text: defineMessage({ defaultMessage: 'Invalid pairwise cipher' })
  },
  { id: 20,
    code: 20,
    text: defineMessage({ defaultMessage: 'Invalid AKMP' })
  },
  { id: 21,
    code: 21,
    text: defineMessage({ defaultMessage: 'Unsupported RSNE version' })
  },
  { id: 22,
    code: 22,
    text: defineMessage({ defaultMessage: 'Invalid RSNE capabilities' })
  },
  { id: 23,
    code: 23,
    text: defineMessage({ defaultMessage: 'IEEE 802.1X authentication failed' })
  },
  { id: 24,
    code: 24,
    text: defineMessage({ defaultMessage: 'Cipher suite rejected because of the security policy' })
  },
  { id: 25,
    code: 25,
    text: defineMessage({ defaultMessage: 'TDLS direct-link teardown due to TDLS peer STA unreachable via the TDLS direct link' })
  },
  { id: 26,
    code: 26,
    text: defineMessage({ defaultMessage: 'TDLS direct-link teardown for unspecified reason' })
  },
  { id: 27,
    code: 27,
    text: defineMessage({ defaultMessage: 'Disassociated because session terminated by SSP request' })
  },
  { id: 28,
    code: 28,
    text: defineMessage({ defaultMessage: 'Disassociated because of lack of SSP roaming agreement' })
  },
  { id: 29,
    code: 29,
    text: defineMessage({ defaultMessage: 'Requested service rejected because of SSP cipher suite or AKM requirement' })
  },
  { id: 30,
    code: 30,
    text: defineMessage({ defaultMessage: 'Requested service not authorized in this location' })
  },
  { id: 31,
    code: 31,
    text: defineMessage({ defaultMessage: 'TS deleted because QoS AP lacks sufficient bandwidth for this QoS STA due to change in BSS service characteristics or operational mode (e.g. an HT BSS change from 40 MHz channel to 20 MHz channel' })
  },
  { id: 32,
    code: 32,
    text: defineMessage({ defaultMessage: 'Disassociated for unspecified, QoS-related reason' })
  },
  { id: 33,
    code: 33,
    text: defineMessage({ defaultMessage: 'Disassociated because QoS AP lacks sufficient bandwidth for this QoS STA' })
  },
  { id: 34,
    code: 34,
    text: defineMessage({ defaultMessage: 'Disassociated because excessive number of frames need to be acknowledged, but are not acknowledged due to AP transmissions and/or poor channel conditions' })
  },
  { id: 35,
    code: 35,
    text: defineMessage({ defaultMessage: 'Disassociated because STA is transmitting outside the limits of TXOPs' })
  },
  { id: 36,
    code: 36,
    text: defineMessage({ defaultMessage: 'Requested from peer STA as the STA is leaving the BSS (or resetting)' })
  },
  { id: 37,
    code: 37,
    text: defineMessage({ defaultMessage: 'Requested from peer STA as the STA does not want to use the mechanism' })
  },
  { id: 38,
    code: 38,
    text: defineMessage({ defaultMessage: 'Requested from peer STA as the STA received frames using the mechanism for which setup is required' })
  },
  { id: 39,
    code: 39,
    text: defineMessage({ defaultMessage: 'Requested from peer STA due to timeout' })
  },
  { id: 45,
    code: 45,
    text: defineMessage({ defaultMessage: 'Peer STA does not support the requested cipher suite' })
  },
  { id: 46,
    code: 46,
    text: defineMessage({ defaultMessage: 'Disassociated because authorized access limit reached' })
  },
  { id: 47,
    code: 47,
    text: defineMessage({ defaultMessage: 'Disassociated due to external service requirements' })
  },
  { id: 48,
    code: 48,
    text: defineMessage({ defaultMessage: 'Invalid FT Action frame count' })
  },
  { id: 49,
    code: 49,
    text: defineMessage({ defaultMessage: 'Invalid pairwise master key identified (PMKI)' })
  },
  { id: 50,
    code: 50,
    text: defineMessage({ defaultMessage: 'Invalid MDE' })
  },
  { id: 51,
    code: 51,
    text: defineMessage({ defaultMessage: 'Invalid FTE' })
  },
  { id: 52,
    code: 52,
    text: defineMessage({ defaultMessage: 'SME cancels the mesh peering instance with the reason other than reaching the maximum number of peer mesh STAs' })
  },
  { id: 53,
    code: 53,
    text: defineMessage({ defaultMessage: 'The mesh STA has reached the supported maximum number of peer STAs' })
  },
  { id: 54,
    code: 54,
    text: defineMessage({ defaultMessage: 'The received information violates the Mesh Configuration policy configured in the mesh STA profile' })
  },
  { id: 55,
    code: 55,
    text: defineMessage({ defaultMessage: 'The mesh STA has received a Mesh Peering Close message requesting to close the mesh peering' })
  },
  { id: 56,
    code: 56,
    text: defineMessage({ defaultMessage: 'The mesh STA has resent dot11MeshMaxRetries Mesh Peering Open messages, without receiving a Mesh Peering Confirm message' })
  },
  { id: 57,
    code: 57,
    text: defineMessage({ defaultMessage: 'The confirmTimer for the mesh peering instance times out' })
  },
  { id: 58,
    code: 58,
    text: defineMessage({ defaultMessage: 'The mesh STA fails to unwrap the GTK or the values in the wrapped contents do not match' })
  },
  { id: 59,
    code: 59,
    text: defineMessage({ defaultMessage: 'The mesh STA receives inconsistent information about the mesh parameters between Mesh Peering Management frames' })
  },
  { id: 60,
    code: 60,
    text: defineMessage({ defaultMessage: 'The mesh STA fails the authenticated mesh peering exchange because due to failure in selecting either the pairwise ciphersuite or group ciphersuite' })
  },
  { id: 61,
    code: 61,
    text: defineMessage({ defaultMessage: 'The mesh STA does not have proxy information for this external destination' })
  },
  { id: 62,
    code: 62,
    text: defineMessage({ defaultMessage: 'The mesh STA does not have forwarding information for this destination' })
  },
  { id: 63,
    code: 63,
    text: defineMessage({ defaultMessage: 'The mesh STA determines that the link to the next hop of an active path in its forwarding information is no longer usable' })
  },
  { id: 64,
    code: 64,
    text: defineMessage({ defaultMessage: 'The Deauthentication frame was sent because the MAC address of the STA already exists in the mesh BSS.' })
  },
  { id: 65,
    code: 65,
    text: defineMessage({ defaultMessage: 'The mesh STA performs channel switch to meet regulatory requirements' })
  },
  { id: 66,
    code: 66,
    text: defineMessage({ defaultMessage: 'The mesh STA performs channel switch with unspecified reason' })
  }
]
