/* eslint-disable max-len */
import { MessageDescriptor, defineMessage } from 'react-intl'

import { ChallengePasswordType, ScepKeyCommonNameType } from '@acx-ui/rc/utils'


export const challengePasswordTypeLabel: Record<ChallengePasswordType, MessageDescriptor> = {
  [ChallengePasswordType.STATIC]: defineMessage({
    defaultMessage: 'Static'
  }),
  [ChallengePasswordType.NONE]: defineMessage({
    defaultMessage: 'None'
  }),
  [ChallengePasswordType.MICROSOFT]: defineMessage({
    defaultMessage: 'Microsoft Intune'
  })
}

export const scepKeyCommonNameTypeLabel: Record<ScepKeyCommonNameType, MessageDescriptor> = {
  [ScepKeyCommonNameType.IGNORE]: defineMessage({
    defaultMessage: 'Ignore'
  }),
  [ScepKeyCommonNameType.MAC_ADDRESS]: defineMessage({
    defaultMessage: 'MAC address, usable as $\'{MAC_ADDRESS} in the certificate template'
  }),
  [ScepKeyCommonNameType.USERNAME]: defineMessage({
    defaultMessage: 'Username, usable as $\'{USERNAME} in the certificate template'
  }),
  [ScepKeyCommonNameType.DEVICE_NAME]: defineMessage({
    defaultMessage: 'Device identifier, usable as $\'{ROLLUP_DEVICE_NAME} in the certificate template'
  }),
  [ScepKeyCommonNameType.EMAIL]: defineMessage({
    defaultMessage: 'Email, usable as $\'{EMAIL} in the certificate template'
  }),
  [ScepKeyCommonNameType.LOCATION]: defineMessage({
    defaultMessage: 'Location, usable as $\'{LOCATION} in the certificate template'
  })
}

export const scepKeysDescription: Record<string, MessageDescriptor> = {
  SCEP_KEY: defineMessage({
    defaultMessage: 'The SCEP Key acts as a shared secret known by the caller and the server. The SCEP key is included in the URL, so it must be in a URL-safe format'
  }),
  VALIDITY_INFO: defineMessage({
    defaultMessage: 'When possible, access to the SCEP server should be restricted as much as possible. When not in use, the SCEP key should be disabled.'
  }),
  CONFIG_INFO: defineMessage({
    defaultMessage: 'When certificates are issued using the SCEP key, the following settings will control the characteristics of the issued certificate.'
  })
}