import { defineMessage } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

import {
  IpSecAdvancedOptionEnum, IpSecFailoverModeEnum,
  IpSecProposalTypeEnum, IpSecRekeyTimeUnitEnum,
  IpSecRetryDurationEnum
} from '../../models/IpSecEnum'

export const defaultIpsecFields = [
  'id',
  'name',
  'serverAddress',
  'authenticationType',
  'activations',
  'preSharedKey',
  'ikeProposalType',
  'ikeProposals',
  'espProposalType',
  'espProposals'
]

export const defaultIpsecFormData = {
  advancedOption: {
    retryLimit: 5,
    replayWindow: 32,
    ipcompEnable: IpSecAdvancedOptionEnum.DISABLED,
    enforceNatt: IpSecAdvancedOptionEnum.DISABLED,
    dpdDelay: 30,
    keepAliveInterval: 20,
    failoverRetryInterval: 1,
    failoverMode: IpSecFailoverModeEnum.NON_REVERTIVE,
    failoverPrimaryCheckInterval: 1,
    dhcpOpt43Subcode: 7,
    failoverRetryPeriod: 3
  },
  ikeSecurityAssociation: {
    ikeProposalType: IpSecProposalTypeEnum.DEFAULT,
    ikeProposals: []
  },
  espSecurityAssociation: {
    espProposalType: IpSecProposalTypeEnum.DEFAULT,
    espProposals: []
  },
  ikeRekeyTimeEnabledCheckbox: true, // UI only
  ikeRekeyTime: 4,
  ikeRekeyTimeUnit: IpSecRekeyTimeUnitEnum.HOUR,
  espRekeyTimeEnabledCheckbox: true, // UI only
  espRekeyTime: 1,
  espRekeyTimeUnit: IpSecRekeyTimeUnitEnum.HOUR,
  retryLimitEnabledCheckbox: true, // UI only
  retryDuration: IpSecRetryDurationEnum.FOREVER,
  espReplayWindowEnabledCheckbox: true,
  deadPeerDetectionDelayEnabledCheckbox: true, // UI only
  nattKeepAliveIntervalEnabledCheckbox: true, // UI only
  failoverRetryPeriodIsForever: true
}
export  const getRekeyTimeUnitOptions = () => {
  const { $t } = getIntl()

  return [
    { label: $t({ defaultMessage: 'Day(s)' }), value: IpSecRekeyTimeUnitEnum.DAY },
    { label: $t({ defaultMessage: 'Hour(s)' }), value: IpSecRekeyTimeUnitEnum.HOUR },
    { label: $t({ defaultMessage: 'Minute(s)' }), value: IpSecRekeyTimeUnitEnum.MINUTE }
  ]
}

export const ipSecPskValidator = (value: string) => {
  const { $t } = getIntl()

  let pass = false
  if (value.startsWith('0x')) { // HEX
    pass = new RegExp('0x[A-Fa-f0-9]{44,128}$').test(value)
  } else if (value.startsWith('0s') || value.indexOf('"') !== -1) { // No base64 and exclude double-quote
    pass = false
  } else if (value.length >= 8 && value.length <= 64) { // ASCII
    pass = validateASCII(value) && validateAPConfigInput(value)
  }

  return pass? Promise.resolve() :
    Promise.reject($t(messageMapping.psk_invalid_message))
}

//A valid ascii character must from (space)(char 32) to ~(char 126)
const validateASCII = (v: string) => {
  for (let i = 0; i < v.length; i++) {
    let character = v.charCodeAt(i)
    if (character < 32 || character > 126) {
      return false
    }
  }
  return true
}

//AP's configuration will reject any input containing ` or $(
const validateAPConfigInput = (v: string) => {
  if(v && v.indexOf('`') === -1 && v.indexOf('$(') === -1) {
    return true
  }
  return false
}

const messageMapping = {
  // eslint-disable-next-line max-len
  psk_invalid_message: defineMessage({ defaultMessage: 'The pre-shared key must contain 44 ~ 128 HEX characters or  8 ~ 64 ASCII characters, including characters from space (char 32) to ~(char 126) except " or ` or $(, or Base64 characters.' })

}
