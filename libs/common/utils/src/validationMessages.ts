import { ValidateMessages }         from 'rc-field-form/lib/interface'
import { defineMessage, IntlShape } from 'react-intl'

export const validationMessages = {
  whitespace: defineMessage({
    defaultMessage: 'Spaces are not allowed',
    description: 'Validation - no whitespace checks'
  }),
  ipAddress: defineMessage({
    defaultMessage: 'Please enter a valid IP address',
    description: 'Validiation - IP address checks'
  }),
  duplication: defineMessage({
    defaultMessage: `
      {entityName} with that {key, select,
        name {name}
        other {value}
      } already exists
    `,
    description: 'Validiation - duplication checks'
  }),
  min: defineMessage({
    defaultMessage: "This value should be higher than or equal to $'{min'}",
    description: 'Validiation - min checks'
  }),
  max: defineMessage({
    defaultMessage: "This value should be lower than or equal to $'{max'}",
    description: 'Validiation - max checks'
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
