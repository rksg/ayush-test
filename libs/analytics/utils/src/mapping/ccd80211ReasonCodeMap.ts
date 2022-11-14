/* eslint-disable max-len */

import { defineMessage } from 'react-intl'

export const ccd80211ReasonCodes = [
  {
    id: 1,
    code: 'CCD_REASON_UNSPECIFIED',
    text: defineMessage({ defaultMessage: 'Unspecified' })
  },
  {
    id: 2,
    code: 'CCD_REASON_PREV_AUTH_NOT_VALID',
    text: defineMessage({ defaultMessage: 'Previous Auth Invalid' })
  },
  {
    id: 3,
    code: 'CCD_REASON_DEAUTH_LEAVING',
    text: defineMessage({ defaultMessage: 'STA Deauth (Leaving)' })
  },
  {
    id: 4,
    code: 'CCD_REASON_DISASSOC_DUE_TO_INACTIVITY',
    text: defineMessage({ defaultMessage: 'Disassoc Due to Inactivity Timeout' })
  },
  {
    id: 5,
    code: 'CCD_REASON_DISASSOC_AP_BUSY',
    text: defineMessage({ defaultMessage: 'Disassoc Due to Busy AP' })
  },
  {
    id: 6,
    code: 'CCD_REASON_CLASS2_FRAME_FROM_NONAUTH_STA',
    text: defineMessage({ defaultMessage: 'Class2 Frame from Non-Auth STA' })
  },
  {
    id: 7,
    code: 'CCD_REASON_CLASS3_FRAME_FROM_NONASSOC_STA',
    text: defineMessage({ defaultMessage: 'Class3 Frame from Non-Assoc STA' })
  },
  {
    id: 8,
    code: 'CCD_REASON_DISASSOC_STA_HAS_LEFT',
    text: defineMessage({ defaultMessage: 'STA Disassoc' })
  },
  {
    id: 9,
    code: 'CCD_REASON_STA_REQ_ASSOC_WITHOUT_AUTH',
    text: defineMessage({ defaultMessage: "Assoc Failure (STA Not Auth\\'d)" })
  },
  {
    id: 12,
    code: 'CCD_REASON_ASSOC_BTM',
    text: defineMessage({ defaultMessage: 'BTM Disassoc' })
  },
  {
    id: 13,
    code: 'CCD_REASON_IE_INVALID',
    text: defineMessage({ defaultMessage: 'IE Invalid' })
  },
  {
    id: 14,
    code: 'CCD_REASON_MICHAEL_MIC_FAILURE',
    text: defineMessage({ defaultMessage: 'MIC Failure' })
  },
  {
    id: 15,
    code: 'CCD_REASON_KICKOUT',
    text: defineMessage({ defaultMessage: 'Station kicked out due to retries' })
  },
  {
    id: 16,
    code: 'CCD_REASON_80211_RSN_INCONSISTENT',
    text: defineMessage({ defaultMessage: 'RSN IE is inconsistent' })
  },
  {
    id: 17,
    code: 'CCD_REASON_MGMT_GROUP_CIPHER_NOT_VALID',
    text: defineMessage({ defaultMessage: 'Mgmt Group Cipher is not valid' })
  },
  {
    id: 18,
    code: 'CCD_REASON_GROUP_CIPHER_NOT_VALID',
    text: defineMessage({ defaultMessage: 'Invalid Group Key Cipher' })
  },
  {
    id: 19,
    code: 'CCD_REASON_PAIRWISE_CIPHER_NOT_VALID',
    text: defineMessage({ defaultMessage: 'Invalid Pairwise Key Cipher' })
  },
  {
    id: 20,
    code: 'CCD_REASON_AKMP_NOT_VALID',
    text: defineMessage({ defaultMessage: 'Invalid Auth/Key Mgmt Protocol' })
  },
  {
    id: 21,
    code: 'CCD_REASON_UNSUPPORTED_RSN_IE_VERSION',
    text: defineMessage({ defaultMessage: 'Unsupported RSN IE Version' })
  },
  {
    id: 22,
    code: 'CCD_REASON_INVALID_RSN_IE_CAPAB',
    text: defineMessage({ defaultMessage: 'Invalid RSN IE Capability' })
  },
  {
    id: 23,
    code: 'CCD_REASON_IEEE_802_1X_AUTH_FAILED',
    text: defineMessage({ defaultMessage: '802.1X Auth Failure' })
  },
  {
    id: 24,
    code: 'CCD_REASON_CIPHER_SUITE_REJECTED',
    text: defineMessage({ defaultMessage: 'Cipher Suite Rejected' })
  },
  {
    // https://jira.ruckuswireless.com/browse/MLSA-5033
    id: 25,
    code: 'SG_DHCP_CCD_REASON_DISASSOC_STA_HAS_LEFT',
    text: defineMessage({ defaultMessage: 'STA Disassoc (DHCP Timeout)' })
  },
  {
    // https://jira.ruckuswireless.com/browse/MLSA-5033
    id: 26,
    code: 'SG_DHCP_CCD_REASON_DEAUTH_LEAVING',
    text: defineMessage({ defaultMessage: 'STA Deauth (Leaving) (DHCP Timeout)' })
  }
]
