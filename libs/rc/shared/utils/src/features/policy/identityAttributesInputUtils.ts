

import { cloneDeep } from 'lodash'

import { getIntl } from '@acx-ui/utils'

import { AttributeMapping, IdentityAttributeMappingNameType } from '../../types/policies/identityAttributes'

export const excludedAttributeTypes = [
  IdentityAttributeMappingNameType.DISPLAY_NAME,
  IdentityAttributeMappingNameType.EMAIL,
  IdentityAttributeMappingNameType.PHONE_NUMBER
]

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

export function getValueFromMapping (
  attributeMappings:AttributeMapping[],
  targetType:IdentityAttributeMappingNameType
) {
  return attributeMappings
    .find(
      mapping => mapping.name === targetType
    )?.mappedByName
}

export function splitAttributeMappingsFromData<T extends {
  attributeMappings?: AttributeMapping[],
  identityName?: string,
  identityEmail?: string,
  identityPhone?: string
}> (
  data: T
) {
  if(!data || !data.attributeMappings) {
    return data
  }

  // eslint-disable-next-line max-len
  const idName = getValueFromMapping(data.attributeMappings, IdentityAttributeMappingNameType.DISPLAY_NAME)
  // eslint-disable-next-line max-len
  const idEmail = getValueFromMapping(data.attributeMappings, IdentityAttributeMappingNameType.EMAIL)
  // eslint-disable-next-line max-len
  const idPhone = getValueFromMapping(data.attributeMappings, IdentityAttributeMappingNameType.PHONE_NUMBER)

  // remove above three mappings from attributeMappings
  const filteredMappings = data.attributeMappings.filter(
    mapping => !excludedAttributeTypes.includes(
            mapping.name as IdentityAttributeMappingNameType
    )
  )

  return {
    ...data,
    attributeMappings: filteredMappings,
    identityName: idName,
    identityEmail: idEmail,
    identityPhone: idPhone
  }
}

export function combineAttributeMappingsToData<T extends {
  attributeMappings?: AttributeMapping[],
  identityName?: string,
  identityEmail?: string,
  identityPhone?: string
}> (
  data: T
) {
  if(!data || !data.attributeMappings) {
    return data
  }

  const { ...result } = cloneDeep(data)

  //Add three identity attributes to attributeMappings
  const identityMappings = [
  // eslint-disable-next-line max-len
    result.identityName && { name: IdentityAttributeMappingNameType.DISPLAY_NAME, mappedByName: result.identityName },
    // eslint-disable-next-line max-len
    result.identityEmail && { name: IdentityAttributeMappingNameType.EMAIL, mappedByName: result.identityEmail },
    // eslint-disable-next-line max-len
    result.identityPhone && { name: IdentityAttributeMappingNameType.PHONE_NUMBER, mappedByName: result.identityPhone }
  ].filter(Boolean) as AttributeMapping[]

  result.attributeMappings = [...(result.attributeMappings ?? []), ...identityMappings]
  delete result.identityName
  delete result.identityEmail
  delete result.identityPhone

  return result
}