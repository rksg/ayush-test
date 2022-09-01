import { defineMessage } from 'react-intl'

export const ccdReasonCodes = [
  {
    id: 0,
    code: 'CCD_REASON_SUCCESS',
    text: defineMessage({ defaultMessage: 'Success' })
  },
  {
    id: 1,
    code: 'CCD_REASON_NOT_AUTHED',
    text: defineMessage({ defaultMessage: '802.11 Auth Failure' })
  },
  {
    id: 2,
    code: 'CCD_REASON_NOT_ASSOCED',
    text: defineMessage({ defaultMessage: 'Assoc Failure' })
  },
  {
    id: 3,
    code: 'CCD_REASON_AUTH_ALG',
    text: defineMessage({ defaultMessage: 'Auth Algorithm Mismatch' })
  },
  {
    id: 4,
    code: 'CCD_REASON_AUTH_WITHHELD',
    text: defineMessage({ defaultMessage: 'Auth Frame Withheld' })
  },
  {
    id: 5,
    code: 'CCD_REASON_AUTH_FILTERED_BY_ACL',
    text: defineMessage({ defaultMessage: 'Client Auth Dropped by Policy/ACL' })
  },
  {
    id: 6,
    code: 'CCD_REASON_AUTH_MDID_MISMATCH',
    text: defineMessage({ defaultMessage: 'Mobility Domain ID Mismatch' })
  },
  {
    id: 7,
    code: 'CCD_REASON_ASSOC_DOS_ATTACK',
    text: defineMessage({ defaultMessage: 'Assoc DoS Prevention' })
  },
  {
    id: 8,
    code: 'CCD_REASON_ASSOC_TOOMANY',
    text: defineMessage({ defaultMessage: 'Association Capacity Reached' })
  },
  {
    id: 9,
    code: 'CCD_REASON_ASSOC_NOT_AUTHED',
    text: defineMessage({ defaultMessage: 'No Auth before Assoc' })
  },
  {
    id: 10,
    code: 'CCD_REASON_ASSOC_RSN_REQUIRED',
    text: defineMessage({ defaultMessage: 'No WPA/RSN IE in Assoc Req' })
  },
  {
    id: 11,
    code: 'CCD_REASON_ASSOC_IE_INVALID',
    text: defineMessage({ defaultMessage: 'Invalid WPA/RSN IE' })
  },
  {
    id: 12,
    code: 'CCD_REASON_ASSOC_RATE_MISMATCH',
    text: defineMessage({ defaultMessage: 'HT or VHT rate set mismatch' })
  },
  {
    id: 13,
    code: 'CCD_REASON_EAPOL_STATE_INVALID',
    text: defineMessage({ defaultMessage: 'EAPOL-Key Msg in Invalid State' })
  },
  {
    id: 14,
    code: 'CCD_REASON_EAPOL_KEY_INVALID',
    text: defineMessage({ defaultMessage: 'Invalid Key Data in EAPOL-Key Msg 2 of 4' })
  },
  {
    id: 15,
    code: 'CCD_REASON_RSN_INCONSISTENT',
    text: defineMessage({ defaultMessage: 'AssocReq WPA IE Mismatch with Msg 2 of 4' })
  },
  {
    id: 16,
    code: 'CCD_REASON_MIC_FAILURE',
    text: defineMessage({ defaultMessage: 'PSK Failure (passphrase mismatch) - Invalid MIC' })
  },
  {
    id: 17,
    code: 'CCD_REASON_NACK',
    text: defineMessage({ defaultMessage: "Recv\\'d DHCP NAK" })
  },
  {
    id: 18,
    code: 'CCD_REASON_TIMEOUT',
    text: defineMessage({ defaultMessage: 'Timeout Expired' })
  },
  {
    id: 19,
    code: 'CCD_REASON_EAP_IDENTIFIER_MISMATCH',
    text: defineMessage({ defaultMessage: 'EAP Identifier Mismatch' })
  },
  {
    id: 20,
    code: 'CCD_REASON_AAA_SERVER_UNAVAILABLE',
    text: defineMessage({ defaultMessage: 'RADIUS Server Unavailable' })
  },
  {
    id: 21,
    code: 'CCD_REASON_AAA_AUTH_FAIL',
    text: defineMessage({ defaultMessage: 'AAA Auth Failure' })
  },
  {
    id: 22,
    code: 'CCD_REASON_8021X_AUTH_FAILURE',
    text: defineMessage({ defaultMessage: 'CCD_REASON_8021X_AUTH_FAILURE' })
  },
  {
    id: 23,
    code: 'CCD_REASON_USER_LOGIN_INVALID',
    text: defineMessage({ defaultMessage: 'Invalid User Login Context' })
  },
  {
    id: 24,
    code: 'CCD_REASON_USER_AUTHORIZED_FAILURE',
    text: defineMessage({ defaultMessage: 'User Failed Authorization' })
  },
  {
    id: 25,
    code: 'CCD_REASON_IDM_AUTHORIZED_FAILURE',
    text: defineMessage({ defaultMessage: 'Guest ID Auth Failure' })
  },
  {
    id: 26,
    code: 'CCD_REASON_ASSOC_SW_FAILED',
    text: defineMessage({ defaultMessage: 'Assoc reject by software internal error' })
  },
  {
    id: 27,
    code: 'CCD_REASON_AUTH_FT_ROAM_FAILURE',
    text: defineMessage({ defaultMessage: 'FT (11r) Roam Failure' })
  },
  {
    id: 28,
    code: 'CCD_REASON_AUTH_BLOCKED_CLIENT',
    text: defineMessage({ defaultMessage: 'Dropped auth frame by blocked client' })
  },
  {
    id: 29,
    code: 'CCD_REASON_AUTH_FILTERED_BY_TCM',
    text: defineMessage({ defaultMessage: 'Dropped auth frame by Transient Client Management' })
  },
  {
    id: 30,
    code: 'CCD_REASON_MAX_VALUE',
    // This is a placeholder code use by AP team, no description for it
    text: defineMessage({ defaultMessage: 'CCD_REASON_MAX_VALUE' })
  }
]
