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
  name: defineMessage({
    defaultMessage: 'Please enter a valid Name',
    description: 'Validation - Name checks'
  }),
  ospf: defineMessage({
    defaultMessage: 'Please enter a valid OSPF area',
    description: 'Validation - OSPF area checks'
  }),
  dhcpRelayAgent: defineMessage({
    defaultMessage: 'Please enter a valid DHCP relay agent',
    description: 'Validation - DHCP relay agent checks'
  }),
  ipAddress: defineMessage({
    defaultMessage: 'Please enter a valid IP address',
    description: 'Validation - IP address checks'
  }),
  ipDomain: defineMessage({
    defaultMessage: 'Please enter a valid IP address or domain',
    description: 'Validation - IP address checks'
  }),
  domain: defineMessage({
    defaultMessage: 'Please enter a valid domain',
    description: 'Validation - domain checks'
  }),
  domains: defineMessage({
    defaultMessage: 'Please enter valid domain(s)',
    description: 'Validation - domains checks'
  }),
  ipSubnetMask: defineMessage({
    defaultMessage: 'Please enter a valid IP address',
    description: 'Validation - IP address checks'
  }),
  subnetMask: defineMessage({
    defaultMessage: 'Please enter a valid subnet mask',
    description: 'Validation - subnet mask checks'
  }),
  isNotSubnetIp: defineMessage({
    defaultMessage: 'Must be a network address',
    description: 'Validation - subnet address checks'
  }),
  subnetMaskBased255_255: defineMessage({
    defaultMessage: 'Please enter a valid Netmask based on the 255.255 mask prefix',
    description: 'Validation - subnet mask checks'
  }),
  invalid: defineMessage({
    defaultMessage: 'This field is invalid',
    description: 'Validation - invalid checks'
  }),
  invalidHex: defineMessage({
    defaultMessage: 'Please enter a valid Hex Key',
    description: 'Validation - Hex Key checks'
  }),
  duplication: defineMessage({
    defaultMessage: `
      {entityName} with that {key, select,
        name {name}
        other {value}
      } already exists { extra }
    `,
    description: 'Validation - duplication checks'
  }),
  exclusion: defineMessage({
    defaultMessage: 'The {entityName} can not include {exclusionItems}',
    description: 'Validation - exclusion checks'
  }),
  min: defineMessage({
    defaultMessage: "This value should be higher than or equal to $'{min}'",
    description: 'Validation - min checks'
  }),
  max: defineMessage({
    defaultMessage: "This value should be lower than or equal to $'{max}'",
    description: 'Validation - max checks'
  }),
  range: defineMessage({
    defaultMessage: "This value should be between $'{min}' and $'{max}'",
    description: 'Validation - range checks'
  }),
  minStr: defineMessage({
    defaultMessage: "Field must be at least $'{min}' characters",
    description: 'Validation - string min checks'
  }),
  maxStr: defineMessage({
    defaultMessage: "Field exceeds $'{max}' characters",
    description: 'Validation - string max checks'
  }),
  lenStr: defineMessage({
    defaultMessage: "Field must be exactly $'{len}' characters",
    description: 'Validation - string len checks'
  }),
  rangeStr: defineMessage({
    defaultMessage: "Field must be between $'{min}' and $'{max}' characters",
    description: 'Validation - string range checks'
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
    defaultMessage: 'Cannot contain double quote',
    description: 'Validation - Cannot contain double quote'
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
  }),
  gpsCoordinates: defineMessage({
    defaultMessage: 'Please enter valid GPS coordinates',
    description: 'Validation - GPS coordinates checks'
  }),
  gpsLatitudeInvalid: defineMessage({
    // eslint-disable-next-line max-len
    defaultMessage: 'A valid latitude value is between -90 and 90, and contains a maximum of 6-digit decimal',
    description: 'Validation - GPS Latitude checks'
  }),
  gpsLongitudeInvalid: defineMessage({
    // eslint-disable-next-line max-len
    defaultMessage: 'A valid longitude value is between -180 and 180, and contains a maximum of 6-digit decimal',
    description: 'Validation - GPS Longitude checks'
  }),
  targetHost: defineMessage({
    defaultMessage: 'Please enter valid target host or IP address',
    description: 'Validation - target host checks'
  }),
  diffVenueCountry: defineMessage({
    defaultMessage: 'Cannot move AP to another venue in different country',
    description: 'Validation - Venue Country checks'
  }),
  cellularApDhcpLimitation: defineMessage({
    defaultMessage: `The cellular AP cannot
      be moved to the venue which doesn’t enable DHCP service`,
    description: 'Validation - Cellular AP Dhcp checks'
  }),
  emailAddress: defineMessage({
    defaultMessage: 'Please enter a valid email address',
    description: 'Validation - email address checks'
  }),
  walledGarden: defineMessage({
    defaultMessage: `Please make sure that all destinations comply to
      allowed formats. For more information see the help information`,
    description: 'Validation - walled garden checks'
  }),
  ipRangeInvalid: defineMessage({
    defaultMessage: 'The End IP address should swap Start IP address',
    description: 'Validation - IP address range'
  }),
  ipRangeExceed: defineMessage({
    defaultMessage: 'The DHCP pool size should not exceed {range}',
    description: 'Validation - Cellular IP pool size'
  }),
  ipNotInSubnetPool: defineMessage({
    defaultMessage: 'IP address is not in the subnet pool',
    description: 'Validation - Cellular IP pool size'
  }),
  phoneNumber: defineMessage({
    defaultMessage: 'Please enter a valid phone number',
    description: 'Validation - phone number checks'
  }),
  poeBudget: defineMessage({
    defaultMessage: 'Poe Budget can only be from 1000 - 30000',
    description: 'Validation - PoE Budget checks'
  }),
  dscp: defineMessage({
    defaultMessage: 'Enter a valid number between 0 and 63',
    description: 'Validation - dscp checks'
  }),
  priority: defineMessage({
    defaultMessage: 'Enter a valid number between 0 and 7',
    description: 'Validation - priority checks'
  }),
  whitespaceOnly: defineMessage({
    defaultMessage: 'Whitespace chars only are not allowed',
    description: 'Validation - Whitespace chars check'
  }),
  numberRangeInvalid: defineMessage({
    defaultMessage: 'Enter a valid number between {from} and {to}',
    description: 'Validation - range check'
  }),
  agree: defineMessage({
    defaultMessage: 'Please type “AGREE”',
    description: 'Validation - Please type “AGREE”'
  }),
  nameCannotStartWithNumber: defineMessage({
    defaultMessage: 'Name cannot start with a number',
    description: 'Validation - name checks'
  }),
  nameInvalid: defineMessage({
    defaultMessage: 'Name may include only letters and numbers',
    description: 'Validation - name checks'
  }),
  startRangeInvalid: defineMessage({
    defaultMessage: 'Start value must be lower than end value',
    description: 'Validation - range checks'
  }),
  endRangeInvalid: defineMessage({
    defaultMessage: 'End value must be higher than start value',
    description: 'Validation - range checks'
  }),
  specialCharactersInvalid: defineMessage({
    defaultMessage: 'Special characters (other than space, $, -, . and _) are not allowed',
    description: 'Validation - special characters checks'
  }),
  minValueInvalid: defineMessage({
    defaultMessage: 'Minimal value is {value}',
    description: 'Validation - min value checks'
  }),
  maxValueInvalid: defineMessage({
    defaultMessage: 'Maximal value is {value}',
    description: 'Validation - max value checks'
  }),
  oneRadioChannel: defineMessage({
    defaultMessage: 'Please select one channel',
    description: 'Validation - radio channel checks'
  }),
  twoRadioChannels: defineMessage({
    defaultMessage: 'Please select at least two channels',
    description: 'Validation - radio channel checks'
  }),
  recoveryPassphrasePart: defineMessage({
    defaultMessage: 'Passphrase part must be exactly 4 digits long',
    description: 'Validation - recovery passphrase part'
  }),
  recoveryPassphrasePartSpace: defineMessage({
    defaultMessage: 'Passphrase cannot have space',
    description: 'Validation - recovery passphrase part cannot have space'
  }),
  vlanMembersMaxLength: defineMessage({
    defaultMessage: 'You can define up to 64 VLAN members',
    description: 'Validation - VLAN members max length checks'
  }),
  vlanMembersMaxSize: defineMessage({
    defaultMessage: 'Number of single VLANs and ranges can\'t exceed 16',
    description: 'Validation - VLAN members max size checks'
  }),
  invalidVlanMember: defineMessage({
    defaultMessage: 'Valid VLAN member ID is between 2 and 4094',
    description: 'Validation - VLAN ID invalid checks'
  }),
  vlanMembersOverlapping: defineMessage({
    defaultMessage: 'Overlapping VLAN found',
    description: 'Validation - VLAN Overlapping checks'
  }),
  invalidVlanMemberRange: defineMessage({
    defaultMessage: 'Start value must be less than end value',
    description: 'Validation - VLAN MemberRange checks'
  }),
  switchIpInvalid: defineMessage({
    defaultMessage: 'Enter a valid IPv4 address and not broadcast address',
    description: 'Validation - switch ip checks'
  }),
  switchSubnetInvalid: defineMessage({
    defaultMessage: 'Subnet mask is invalid',
    description: 'Validation - switch subnet'
  }),
  switchDefaultGatewayInvalid: defineMessage({
    defaultMessage: 'Gateway is invalid',
    description: 'Validation - switch gateway'
  }),
  switchBroadcastAddressInvalid: defineMessage({
    defaultMessage: 'Can not be a broadcast address',
    description: 'Validation - switch broadcast address'
  }),
  switchSameSubnetInvalid: defineMessage({
    defaultMessage: 'IP and gateway are not in the same subnet',
    description: 'Validation - switch same subnet'
  }),
  switchStaticRouteIpInvalid: defineMessage({
    defaultMessage: 'Enter a valid subnet (e.g. 1.1.1.1/24)',
    description: 'Validation - switch static route ip'
  }),
  switchStaticRouteNextHopInvalid: defineMessage({
    defaultMessage: 'NextHop IP address is invalid.',
    description: 'Validation - switch static route ip'
  }),
  switchStaticRouteAdminDistanceInvalid: defineMessage({
    defaultMessage: 'Enter a valid number between 0 and 255',
    description: 'Validation - switch static route admin distance'
  }),
  aclStandardNumericValueInvalid: defineMessage({
    defaultMessage: 'Standard ACL Numeric Value Must Be 1-99',
    description: 'Validation - Standard ACL Numeric Value Must Be 1-99'
  }),
  aclExtendedNumericValueInvalid: defineMessage({
    defaultMessage: 'Extended ACL Numeric Value Must Be 100-199',
    description: 'Validation - Extended ACL Numeric Value Must Be 100-199'
  }),
  aclNameSpecialCharacterInvalid: defineMessage({
    defaultMessage: 'An ACL name cannot contain special characters such as a double quote (")',
    description: 'Validation - ACL name cannot contain special characters'
  }),
  aclNameContainsTestInvalid: defineMessage({
    defaultMessage: 'The ACL name cannot be \'test\'',
    description: 'Validation - The ACL name cannot be \'test\''
  }),
  aclNameStartWithoutAlphabetInvalid: defineMessage({
    defaultMessage: 'Name should start with an alphabet',
    description: 'Validation - Name should start with an alphabet'
  }),
  aclNameDuplicateInvalid: defineMessage({
    defaultMessage: 'The ACL name already exists',
    description: 'Validation - The ACL name already exists'
  }),
  aclRuleSequenceInvalid: defineMessage({
    defaultMessage: 'The Sequence already exists',
    description: 'Validation - The Sequence already exists'
  }),
  vlanNameInvalid: defineMessage({
    defaultMessage: 'Enter a valid number between 1 and 4095, except 4087, 4090-4094',
    description: 'Validation - validate vlan name'
  }),
  vlanIdInvalid: defineMessage({
    defaultMessage: 'The VLAN ID already exists',
    description: 'Validation - validate vlan id'
  }),
  vlanNameInvalidWithDefaultVlans: defineMessage({
    defaultMessage: 'DEFAULT-VLAN is reserved word',
    description: 'Validation - DEFAULT-VLAN is reserved word'
  }),
  subnetOverlapping: defineMessage({
    defaultMessage: 'The ports have overlapping subnets',
    description: 'Validation - subnet range'
  }),
  tagMaxLengthInvalid: defineMessage({
    defaultMessage: 'No more than 24 Tags are allowed',
    description: 'Validation - max tags'
  }),
  tagInvalid: defineMessage({
    defaultMessage: 'Tag is invalid',
    description: 'Validation - tags'
  }),
  servicePolicyNameInvalid: defineMessage({
    defaultMessage: 'Avoid spaces at the beginning/end, and do not use "`" or "$(" characters.',
    description: 'Validation - name for service and policy'
  }),
  specialCharacterNameInvalid: defineMessage({
    defaultMessage: 'Special character is invalid',
    description: 'Validation - name for service and policy'
  }),
  colonSeparatedMacInvalid: defineMessage({
    defaultMessage: 'Please provide a valid MAC address in colon-separated format.',
    description: 'Validation - colon separated MAC address checks'
  }),
  dscpRangeValue: defineMessage({
    defaultMessage: '[DSCP Range] The DSCP Range value is between 0 and 63, or 255.',
    description: 'Validation - dscp range value'
  }),
  dscpHighValue: defineMessage({
    defaultMessage: '[DSCP Range] The DSCP High value must be large than DSCP Low value.',
    description: 'Validation - dscp high value'
  }),
  dscp255Value: defineMessage({
    defaultMessage: '[DSCP Range] If DSCP High or Low value is 255. Another value must be 255.',
    description: 'Validation - dscp 255 value'
  }),
  dscpRangeOverlap: defineMessage({
    defaultMessage: 'The DSCP range overlaps with user priority',
    description: 'Validation - dscp range overlap'
  }),
  dscpAndExceptionDscpAlreadyMapped: defineMessage({
    // eslint-disable-next-line max-len
    defaultMessage: 'A DSCP value that is already mapped to user priority cannot be set as the DSCP exception.',
    description: 'Validation - dscp and exception dscp already mapped'
  }),
  exceptionDscpRangeValue: defineMessage({
    defaultMessage: '[Exception DSCP Values] Type an integer between 0 and 63.',
    description: 'Validation - exception dscp range value'
  }),
  exceptionDscpValueExists: defineMessage({
    defaultMessage: 'The exception DSCP already exists.',
    description: 'Validation - exception dscp value exists'
  })
}

export function prepareAntdValidateMessages ({ $t }: IntlShape): ValidateMessages {
  return {
    whitespace: $t(validationMessages.whitespace),
    number: {
      min: $t(validationMessages.min),
      max: $t(validationMessages.max),
      range: $t(validationMessages.range)
    },
    string: {
      len: $t(validationMessages.lenStr),
      min: $t(validationMessages.minStr),
      max: $t(validationMessages.maxStr),
      range: $t(validationMessages.rangeStr)
    }
  }
}
