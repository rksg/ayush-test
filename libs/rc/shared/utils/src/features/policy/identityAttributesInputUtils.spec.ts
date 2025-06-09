import { IdentityAttributeMappingNameType } from '../../types/policies/identityAttributes'

import {
  getIdentityAttributeMappingNameTypeOptions,
  getIdentityAttributeMappingNameTypeString
} from './identityAttributesInputUtils'

describe('IdentityAttributeInputUtils', () => {
  describe('getIdentityAttributeMappingNameTypeOptions', () => {
    it('should return the map of attribute mapping options', () => {
      expect(getIdentityAttributeMappingNameTypeOptions()).toStrictEqual([
        { label: 'Display Name', value: IdentityAttributeMappingNameType.DISPLAY_NAME },
        { label: 'First Name', value: IdentityAttributeMappingNameType.FIRST_NAME },
        { label: 'Last Name', value: IdentityAttributeMappingNameType.LAST_NAME },
        { label: 'Email', value: IdentityAttributeMappingNameType.EMAIL },
        { label: 'Roles', value: IdentityAttributeMappingNameType.ROLES },
        { label: 'Groups', value: IdentityAttributeMappingNameType.GROUPS },
        { label: 'Phone Number', value: IdentityAttributeMappingNameType.PHONE_NUMBER }
      ])
    })
  })

  describe('getIdentityAttributeMappingNameTypeString', () => {
    it('should return correct string for each attribute type', () => {
      const testCases = [
        { type: IdentityAttributeMappingNameType.FIRST_NAME, expected: 'First Name' },
        { type: IdentityAttributeMappingNameType.LAST_NAME, expected: 'Last Name' },
        { type: IdentityAttributeMappingNameType.EMAIL, expected: 'Email' },
        { type: IdentityAttributeMappingNameType.DISPLAY_NAME, expected: 'Display Name' },
        { type: IdentityAttributeMappingNameType.ROLES, expected: 'Roles' },
        { type: IdentityAttributeMappingNameType.GROUPS, expected: 'Groups' },
        { type: IdentityAttributeMappingNameType.PHONE_NUMBER, expected: 'Phone Number' }
      ]

      testCases.forEach(({ type, expected }) => {
        expect(getIdentityAttributeMappingNameTypeString(type)).toBe(expected)
      })
    })

    it('should return the type string for unknown types', () => {
      const unknownType = 'unknownType' as IdentityAttributeMappingNameType
      expect(getIdentityAttributeMappingNameTypeString(unknownType)).toBe(unknownType)
    })
  })
})