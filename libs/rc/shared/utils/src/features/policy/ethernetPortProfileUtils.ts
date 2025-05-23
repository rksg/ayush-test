

import { getIntl, noDataDisplay } from '@acx-ui/utils'

import { EthernetPortAuthType, EthernetPortSupplicantType, EthernetPortType } from '../../models'

export const getEthernetPortTypeOptions = ()
: Array<{ label: string, value: EthernetPortType }> => {
  return Object.keys(EthernetPortType)
    .map(key => ({
      label: getEthernetPortTypeString(key as EthernetPortType),
      value: key as EthernetPortType
    }))
}

export const getEthernetPortTypeString = (type?: EthernetPortType) => {
  const { $t } = getIntl()
  switch (type) {
    case EthernetPortType.ACCESS :
      return $t({ defaultMessage: 'Access' })
    case EthernetPortType.SELECTIVE_TRUNK:
      return $t({ defaultMessage: 'Selective Trunk' })
    case EthernetPortType.TRUNK:
      return $t({ defaultMessage: 'Trunk' })
    default:
      return noDataDisplay
  }
}

export const getEthernetPortAuthTypeOptions = ()
: Array<{ label: string, value: EthernetPortAuthType }> => {
  return Object.values(EthernetPortAuthType)
    .map(key => ({
      label: getEthernetPortAuthTypeString(key as EthernetPortAuthType),
      value: key as EthernetPortAuthType
    }))
    .filter(item => {
      return item.label !== ''
    })
}


export const getEthernetPortAuthTypeString = (type?: EthernetPortAuthType) => {
  const { $t } = getIntl()

  switch (type) {
    case EthernetPortAuthType.MAC_BASED :
      return $t({ defaultMessage: 'MAC-based Authenticator' })
    case EthernetPortAuthType.PORT_BASED:
      return $t({ defaultMessage: 'Port-based Authenticator' })
    case EthernetPortAuthType.SUPPLICANT:
      return $t({ defaultMessage: 'Supplicant' })
    case EthernetPortAuthType.DISABLED:
    default:
      return ''
  }
}

export const getEthernetPortCredentialTypeOptions = ()
: Array<{ label: string, value: EthernetPortSupplicantType }> => {
  return Object.values(EthernetPortSupplicantType)
    .map(key => ({
      label: getEthernetPortCredentialTypeString(key as EthernetPortSupplicantType),
      value: key as EthernetPortSupplicantType
    }))
    .filter(item => {
      return item.label !== ''
    })
}

export const getEthernetPortCredentialTypeString = (type?: EthernetPortSupplicantType) => {
  const { $t } = getIntl()

  switch (type) {
    case EthernetPortSupplicantType.CUSTOM :
      return $t({ defaultMessage: 'Custom Auth' })
    case EthernetPortSupplicantType.MAC_AUTH:
      return $t({ defaultMessage: 'Use AP MAC Address Auth' })
    default:
      return ''
  }
}