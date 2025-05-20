

import { getIntl } from '@acx-ui/utils'

import { IdentityAttributeMappingNameType } from '../../types/policies/identityAttributes'


export const getIdentityAttributeMappingNameTypeOptions = ()
: Array<{ label: string, value: string }> => {
  return Object.entries(IdentityAttributeMappingNameType)
    .map(([, value]) => ({
      label: getIdentityAttributeMappingNameTypeString(value),
      value: value
    }))
}

// eslint-disable-next-line max-len
export const getIdentityAttributeMappingNameTypeString = (type: IdentityAttributeMappingNameType) => {
  const { $t } = getIntl()
  switch (type) {
    case IdentityAttributeMappingNameType.FIRST_NAME:
      return $t({ defaultMessage: 'First Name' })
    case IdentityAttributeMappingNameType.LAST_NAME:
      return $t({ defaultMessage: 'Last Name' })
    case IdentityAttributeMappingNameType.EMAIL:
      return $t({ defaultMessage: 'Email' })
    case IdentityAttributeMappingNameType.DISPLAY_NAME:
      return $t({ defaultMessage: 'Display Name' })
    case IdentityAttributeMappingNameType.ROLES:
      return $t({ defaultMessage: 'Roles' })
    case IdentityAttributeMappingNameType.GROUPS:
      return $t({ defaultMessage: 'Groups' })
    case IdentityAttributeMappingNameType.PHONE_NUMBER:
      return $t({ defaultMessage: 'Phone Number' })
    default:
      return type
  }
}
