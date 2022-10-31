import { ValidateMessages }         from 'rc-field-form/lib/interface'
import { defineMessage, IntlShape } from 'react-intl'

export const validationMessages = {
  whitespace: defineMessage({
    defaultMessage: 'Spaces are not allowed',
    description: 'Validation - no whitespace checks'
  }),
  leadingTrailingWhitespace: defineMessage({
    defaultMessage: 'No leading or trailing spaces allowed',
    description: 'Validation - no leading/trailing whitespace checks'
  }),
  ipAddress: defineMessage({
    defaultMessage: 'Please enter a valid IP address',
    description: 'Validation - IP address checks'
  }),
  subnetMask: defineMessage({
    defaultMessage: 'Please enter a valid subnet mask',
    description: 'Validation - subnet mask checks'
  }),
  invalid: defineMessage({
    defaultMessage: 'This field is invalid',
    description: 'Validation - invalid checks'
  }),
  invalidHex: defineMessage({
    defaultMessage: 'Please enter a valid IP address',
    description: 'Validation - IP address checks'
  }),
  duplication: defineMessage({
    defaultMessage: `
      {entityName} with that {key, select,
        name {name}
        other {value}
      } already exists
    `,
    description: 'Validation - duplication checks'
  }),
  exclusion: defineMessage({
    defaultMessage: 'The {entityName} can not include {exclusionItems}',
    description: 'Validation - exclusion checks'
  }),
  min: defineMessage({
    defaultMessage: "This value should be higher than or equal to $'{min'}",
    description: 'Validation - min checks'
  }),
  max: defineMessage({
    defaultMessage: "This value should be lower than or equal to $'{max'}",
    description: 'Validation - max checks'
  }),
  hasGraveAccentAndDollarSign: defineMessage({
    defaultMessage: '"`" and "$(" are not allowed',
    description: 'Validation - grave accent and dollar sign checks'
  }),
  hasGraveAccent: defineMessage({
    defaultMessage: '"`" is not allowed',
    description: 'Validation - grave accent checks'
  }),
  hasDollarSign: defineMessage({
    defaultMessage: '"$(" is not allowed',
    description: 'Validation - dollar sign checks'
  }),
  invalidNotAllDigits: defineMessage({
    defaultMessage: 'Cannot be composed of ALL digits, e.g., 12345',
    description: 'Validation - Cannot be composed of ALL digits'
  }),
  excludeExclamationRegExp: defineMessage({
    defaultMessage: 'Cannot contain Exclamation mark(!), double quotes and space',
    description: 'Validation - Cannot contain Exclamation mark(!), double quotes and space'
  }),
  excludeQuoteRegExp: defineMessage({
    defaultMessage: 'Cannot contain double quote and space',
    description: 'Validation - Cannot contain double quote and space'
  }),
  excludeSpaceRegExp: defineMessage({
    defaultMessage: 'Cannot contain space',
    description: 'Validation - Cannot contain space'
  }),
  excludeSpaceExclamationRegExp: defineMessage({
    defaultMessage: 'Cannot contain Exclamation mark(!) and space',
    description: 'Validation - Cannot contain Exclamation mark(!) and space'
  }),
  portRegExp: defineMessage({
    defaultMessage: 'Please enter a valid number between 0 and 65535',
    description: 'Validation - Please enter a valid port number between 0 and 65535'
  }),
  validateUsername: defineMessage({
    defaultMessage: 'The local username cannot be \'admin\'',
    description: 'Validation - The local username cannot be \'admin\''
  }),
  validateUserPassword: defineMessage({
    defaultMessage: 'Please enter a valid password',
    description: 'Validation - Please enter a valid password'
  }),
  vlanRange: defineMessage({
    defaultMessage: 'VLAN ID must be between 1 and 4094',
    description: 'Validation - VLAN range checks'
  }),
  validateURL: defineMessage({
    defaultMessage: 'Please enter a valid URL',
    description: 'Validation - Please enter a valid URL'
  }),
  validateEqualOne: defineMessage({
    defaultMessage: 'This value should be higher than or equal to 1',
    description: 'Validation - This value should be higher than or equal to 1'
  }),
  validateLowerThan65535: defineMessage({
    defaultMessage: 'This value should be lower than or equal to 65535',
    description: 'Validation - This value should be lower than or equal to 65535'
  })
}

export function prepareAntdValidateMessages ({ $t }: IntlShape): ValidateMessages {
  return {
    whitespace: $t(validationMessages.whitespace),
    number: {
      min: $t(validationMessages.min),
      max: $t(validationMessages.max)
    }
  }
}
