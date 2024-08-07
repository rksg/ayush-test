

import { getIntl } from '@acx-ui/utils'

import { ApLanPortTypeEnum, EthernetPortAuthType } from '../../models'

export const getEthernetPortTypeOptions = ()
: Array<{ label: string, value: ApLanPortTypeEnum }> => {
  return Object.keys(ApLanPortTypeEnum)
    .map(key => ({
      label: getEthernetPortTypeString(key as ApLanPortTypeEnum),
      value: key as ApLanPortTypeEnum
    }))
}

export const getEthernetPortTypeString = (type?: ApLanPortTypeEnum) => {
  const { $t } = getIntl()
  switch (type) {
    case ApLanPortTypeEnum.ACCESS :
      return $t({ defaultMessage: 'Access' })
    case ApLanPortTypeEnum.GENERAL:
      return $t({ defaultMessage: 'General' })
    case ApLanPortTypeEnum.TRUNK:
      return $t({ defaultMessage: 'Trunk' })
    default:
      return ''
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