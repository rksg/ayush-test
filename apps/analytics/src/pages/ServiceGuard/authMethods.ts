import _                                    from 'lodash'
import { MessageDescriptor, defineMessage } from 'react-intl'

import { stage } from './stages'
import {
  AuthenticationMethod,
  ClientType,
  TestStage
} from './types'

type AuthMethodField = {
  key: 'wlanUsername' | 'wlanPassword'
  preConfigured?: boolean
}

type AuthMethodSpec = {
  code: AuthenticationMethod
  title: MessageDescriptor
  fields: AuthMethodField[]
  stages: Array<{ key: TestStage, title: MessageDescriptor }>
  clientTypes: ClientType[]
}

const usernameField: AuthMethodField = {
  key: 'wlanUsername'
}
const passwordField: AuthMethodField = {
  key: 'wlanPassword'
}
const presharedKeyField: AuthMethodField = {
  key: 'wlanPassword',
  preConfigured: true
}

const specs: AuthMethodSpec[] = [
  {
    code: AuthenticationMethod.WPA2_PERSONAL,
    title: defineMessage({ defaultMessage: 'Pre-Shared Key (PSK)' }),
    fields: [
      presharedKeyField
    ],
    stages: [
      stage('auth'),
      stage('assoc'),
      stage('eap', defineMessage({ defaultMessage: 'PSK' })),
      stage('dhcp')
    ],
    clientTypes: [
      ClientType.VirtualClient,
      ClientType.VirtualWirelessClient
    ]
  },
  {
    code: AuthenticationMethod.WPA3_PERSONAL,
    title: defineMessage({ defaultMessage: 'WPA3-Personal' }),
    fields: [
      presharedKeyField
    ],
    stages: [
      stage('auth'),
      stage('assoc'),
      stage('eap', defineMessage({ defaultMessage: 'PSK' })),
      stage('dhcp')
    ],
    clientTypes: [ClientType.VirtualWirelessClient]
  },
  {
    code: AuthenticationMethod.WPA2_WPA3_PERSONAL,
    title: defineMessage({ defaultMessage: 'WPA2/WPA3-Personal' }),
    fields: [
      presharedKeyField
    ],
    stages: [
      stage('auth'),
      stage('assoc'),
      stage('eap', defineMessage({ defaultMessage: 'PSK' })),
      stage('dhcp')
    ],
    clientTypes: [ClientType.VirtualWirelessClient]
  },
  {
    code: AuthenticationMethod.WPA2_ENTERPRISE,
    title: defineMessage({ defaultMessage: 'Enterprise AAA (802.1X)' }),
    fields: [
      usernameField,
      passwordField
    ],
    stages: [
      stage('auth'),
      stage('assoc'),
      stage('eap'),
      stage('radius'),
      stage('dhcp')
    ],
    clientTypes: [
      ClientType.VirtualClient,
      ClientType.VirtualWirelessClient
    ]
  },
  {
    code: AuthenticationMethod.OPEN_AUTH,
    title: defineMessage({ defaultMessage: 'Open Network' }),
    fields: [],
    stages: [
      stage('auth'),
      stage('assoc'),
      stage('dhcp')
    ],
    clientTypes: [
      ClientType.VirtualClient,
      ClientType.VirtualWirelessClient
    ]
  }
]

export const authMethodsByCode = _.keyBy(specs, 'code')
export const authMethodsByClientType = _(specs)
  .flatMap(set => set.clientTypes.map(clientType => ({
    ..._.omit(set, 'clientTypes'),
    clientType
  })))
  .groupBy('clientType')
  .value()
