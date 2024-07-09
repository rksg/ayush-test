import _                                    from 'lodash'
import { MessageDescriptor, defineMessage } from 'react-intl'

import { get } from '@acx-ui/config'

import { stage } from './stages'
import {
  AuthenticationMethod,
  ClientType,
  TestStage
} from './types'

enum Deployment {
  SA = 'SA',
  R1 = 'R1'
}

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
  deployments: Deployment[]
}

const deployment = get('IS_MLISA_SA')
  ? Deployment.SA
  : Deployment.R1

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
    title: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'WPA2-Personal' })
      : defineMessage({ defaultMessage: 'Pre-Shared Key (PSK)' }),
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
    ],
    deployments: [Deployment.SA, Deployment.R1]
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
    clientTypes: [ClientType.VirtualWirelessClient],
    deployments: [Deployment.SA, Deployment.R1]
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
    clientTypes: [ClientType.VirtualWirelessClient],
    deployments: [Deployment.SA, Deployment.R1]
  },
  {
    code: AuthenticationMethod.WPA2_ENTERPRISE,
    title: get('IS_MLISA_SA')
      ? defineMessage({ defaultMessage: 'WPA2-Enterprise' })
      : defineMessage({ defaultMessage: 'Enterprise AAA (802.1X)' }),
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
    ],
    deployments: [Deployment.SA, Deployment.R1]
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
    ],
    deployments: [Deployment.SA, Deployment.R1]
  },
  {
    code: AuthenticationMethod.WISPR_8021X,
    title: defineMessage({ defaultMessage: '802.1X with WISPr' }),
    fields: [
      usernameField,
      passwordField
    ],
    stages: [
      stage('auth'),
      stage('assoc'),
      stage('eap'),
      stage('radius'),
      stage('dhcp'),
      stage('userAuth')
    ],
    clientTypes: [
      ClientType.VirtualClient,
      ClientType.VirtualWirelessClient
    ],
    deployments: [Deployment.SA]
  },
  {
    code: AuthenticationMethod.WISPR,
    title: defineMessage({ defaultMessage: 'WISPr' }),
    fields: [
      usernameField,
      passwordField
    ],
    stages: [
      stage('auth'),
      stage('assoc'),
      stage('dhcp'),
      stage('userAuth')
    ],
    clientTypes: [
      ClientType.VirtualClient,
      ClientType.VirtualWirelessClient
    ],
    deployments: [Deployment.SA]
  },
  {
    code: AuthenticationMethod.WEB_AUTHENTICATION,
    title: defineMessage({ defaultMessage: 'Web Authentication' }),
    fields: [
      usernameField,
      passwordField
    ],
    stages: [
      stage('auth'),
      stage('assoc'),
      stage('dhcp'),
      stage('userAuth')
    ],
    clientTypes: [
      ClientType.VirtualClient,
      ClientType.VirtualWirelessClient
    ],
    deployments: [Deployment.SA]
  },
  {
    code: AuthenticationMethod.GUEST_ACCESS,
    title: defineMessage({ defaultMessage: 'Guest Access' }),
    fields: [
      passwordField
    ],
    stages: [
      stage('auth'),
      stage('assoc'),
      stage('dhcp'),
      stage('userAuth')
    ],
    clientTypes: [
      ClientType.VirtualClient,
      ClientType.VirtualWirelessClient
    ],
    deployments: [Deployment.SA]
  }
].filter(item => item.deployments.includes(deployment))

export const authMethodsByCode = _.keyBy(specs, 'code')
export const authMethodsByClientType = _(specs)
  .flatMap(set => set.clientTypes.map(clientType => ({
    ..._.omit(set, 'clientTypes'),
    clientType
  })))
  .groupBy('clientType')
  .value()
