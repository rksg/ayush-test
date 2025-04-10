import { SamlIdpAttributeMappingNameType } from '../../models'

import {
  getSamlIdpAttributeMappingNameTypeOptions,
  getSamlIdpAttributeMappingNameTypeString
} from './samlIdpUtils'

describe('samlIdpUtils', () => {
  describe('getSamlIdpAttributeMappingNameTypeOptions', () => {
    it('should return the map of attribute mapping options', () => {
      expect(getSamlIdpAttributeMappingNameTypeOptions()).toStrictEqual([
        { label: 'Display Name', value: SamlIdpAttributeMappingNameType.DISPLAY_NAME },
        { label: 'First Name', value: SamlIdpAttributeMappingNameType.FIRST_NAME },
        { label: 'Last Name', value: SamlIdpAttributeMappingNameType.LAST_NAME },
        { label: 'Email', value: SamlIdpAttributeMappingNameType.EMAIL },
        { label: 'Roles', value: SamlIdpAttributeMappingNameType.ROLES },
        { label: 'Groups', value: SamlIdpAttributeMappingNameType.GROUPS },
        { label: 'Phone Number', value: SamlIdpAttributeMappingNameType.PHONE_NUMBER }
      ])
    })
  })

  describe('getSamlIdpAttributeMappingNameTypeString', () => {
    it('should return correct string for each attribute type', () => {
      const testCases = [
        { type: SamlIdpAttributeMappingNameType.FIRST_NAME, expected: 'First Name' },
        { type: SamlIdpAttributeMappingNameType.LAST_NAME, expected: 'Last Name' },
        { type: SamlIdpAttributeMappingNameType.EMAIL, expected: 'Email' },
        { type: SamlIdpAttributeMappingNameType.DISPLAY_NAME, expected: 'Display Name' },
        { type: SamlIdpAttributeMappingNameType.ROLES, expected: 'Roles' },
        { type: SamlIdpAttributeMappingNameType.GROUPS, expected: 'Groups' },
        { type: SamlIdpAttributeMappingNameType.PHONE_NUMBER, expected: 'Phone Number' }
      ]

      testCases.forEach(({ type, expected }) => {
        expect(getSamlIdpAttributeMappingNameTypeString(type)).toBe(expected)
      })
    })

    it('should return the type string for unknown types', () => {
      const unknownType = 'unknownType' as SamlIdpAttributeMappingNameType
      expect(getSamlIdpAttributeMappingNameTypeString(unknownType)).toBe(unknownType)
    })
  })
})