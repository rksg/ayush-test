import { getIntl } from '@acx-ui/utils'

import { SamlIdpAttributeMappingNameType } from '../../models'
export const getSamlIdpAttributeMappingNameTypeOptions = ()
: Array<{ label: string, value: string }> => {
  return Object.entries(SamlIdpAttributeMappingNameType)
    .map(([, value]) => ({
      label: getSamlIdpAttributeMappingNameTypeString(value),
      value: value
    }))
}


// eslint-disable-next-line max-len
export const getSamlIdpAttributeMappingNameTypeString = (type: SamlIdpAttributeMappingNameType) => {
  const { $t } = getIntl()
  switch (type) {
    case SamlIdpAttributeMappingNameType.FIRST_NAME:
      return $t({ defaultMessage: 'First Name' })
    case SamlIdpAttributeMappingNameType.LAST_NAME:
      return $t({ defaultMessage: 'Last Name' })
    case SamlIdpAttributeMappingNameType.EMAIL:
      return $t({ defaultMessage: 'Email' })
    case SamlIdpAttributeMappingNameType.DISPLAY_NAME:
      return $t({ defaultMessage: 'Display Name' })
    case SamlIdpAttributeMappingNameType.ROLES:
      return $t({ defaultMessage: 'Roles' })
    case SamlIdpAttributeMappingNameType.GROUPS:
      return $t({ defaultMessage: 'Groups' })
    case SamlIdpAttributeMappingNameType.PHONE_NUMBER:
      return $t({ defaultMessage: 'Phone Number' })
    default:
      return type
  }
}
