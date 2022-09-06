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
