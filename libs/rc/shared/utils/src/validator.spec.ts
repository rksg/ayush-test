import {
  networkWifiIpRegExp,
  domainNameRegExp,
  passphraseRegExp,
  checkObjectNotExists,
  checkItemNotIncluded,
  hasGraveAccentAndDollarSign,
  checkVlanMember,
  checkValues,
  apNameRegExp,
  dscpRegExp,
  gpsRegExp,
  poeBudgetRegExp,
  priorityRegExp,
  whitespaceOnlyRegExp,
  agreeRegExp,
  nameCannotStartWithNumberRegExp,
  cliVariableNameRegExp,
  cliIpAddressRegExp,
  subnetMaskPrefixRegExp,
  specialCharactersRegExp,
  serialNumberRegExp,
  targetHostRegExp,
  validateRecoveryPassphrasePart,
  validateVlanId,
  ipv6RegExp,
  validateTags,
  multicastIpAddressRegExp
} from './validator'

describe('validator', () => {
  describe('ipV4RegExp', () => {
    it('Should take care of ip address values correctly', async () => {
      const result = networkWifiIpRegExp('111.111.111.111')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if ip address values incorrectly', async () => {
      const result = networkWifiIpRegExp('000.000.000.000')
      await expect(result).rejects.toEqual('Please enter a valid IP address')
    })
  })

  describe('domainNameRegExp', () => {
    it('Should take care of domain name values correctly', async () => {
      const result = domainNameRegExp('test.com')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if domain name values incorrectly', async () => {
      const result = domainNameRegExp('testcom')
      await expect(result).rejects.toEqual('Please enter a valid domain')
    })
  })

  describe('hasGraveAccentAndDollarSign', () => {
    it('Should take care of value do not have grave accent and dollar sign', async () => {
      const result = hasGraveAccentAndDollarSign('test')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if value contains dollar sign', async () => {
      const result = hasGraveAccentAndDollarSign('$(test')
      await expect(result).rejects.toEqual('"$(" is not allowed')
    })
    it('Should display error message if value contains grave accent', async () => {
      const result = hasGraveAccentAndDollarSign('test`')
      await expect(result).rejects.toEqual('"`" is not allowed')
    })
    it('Should display error message if value contains grave accent and dollar sign', async () => {
      const result = hasGraveAccentAndDollarSign('$(test`')
      await expect(result).rejects.toEqual('"`" and "$(" are not allowed')
    })
  })

  describe('passphraseRegExp', () => {
    it('Should take care of passphrase values correctly', async () => {
      const result = passphraseRegExp('test passphrase')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if passphrase values incorrectly', async () => {
      // eslint-disable-next-line max-len
      const result = passphraseRegExp('122333444455555666666777777788888888999999999000000000012233344z')
      await expect(result).rejects.toEqual('This field is invalid')
    })
  })

  describe('checkObjectNotExists', () => {
    const mockdata = ['test01']
    it('Should not display error if object does not exist', async () => {
      const result = checkObjectNotExists(mockdata, 'test02', 'Network')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should return false when object exists', async () => {
      const result1 = checkObjectNotExists(mockdata, 'test01', 'Network')
      await expect(result1).rejects.toEqual('Network with that name already exists ')
      const result2 = checkObjectNotExists(mockdata, 'test01', 'Network', 'pname')
      await expect(result2).rejects.toEqual('Network with that value already exists ')
    })
  })

  describe('checkItemNotIncluded', () => {
    const mockdata = ['excluded1', 'excluded2']
    const exclusionItems = mockdata.join(', ')
    it('Should not display error if item does not include', async () => {
      const result = checkItemNotIncluded(mockdata, 'testItem', 'entityName', exclusionItems)
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should return false when item includes', async () => {
      const result1 = checkItemNotIncluded(mockdata, 'excluded1 test', 'entityName', exclusionItems)
      await expect(result1).rejects.toEqual('The entityName can not include excluded1, excluded2')
    })
  })

  describe('checkVlanMember', () => {
    it('Should take care of Vlan Member values correctly', async () => {
      const result = checkVlanMember('2,3,4')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should take care of Vlan Member range values correctly', async () => {
      const result = checkVlanMember('1,2-99')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if Vlan Member values incorrectly', async () => {
      const result1 = checkVlanMember('1-5000')
      await expect(result1).rejects.toEqual('This field is invalid')
    })
  })

  describe('check Vlan ID', () => {
    it('Should take care of Vlan ID with valid value', async () => {
      const result = validateVlanId('100')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should take care of Vlan ID with invalid number', async () => {
      const result = validateVlanId('4099')
      await expect(result).rejects.toEqual('VLAN ID must be between 1 and 4094')
    })
    it('Should take care of Vlan ID with alphabet', async () => {
      const result1 = validateVlanId('abc')
      await expect(result1).rejects.toEqual('VLAN ID must be between 1 and 4094')
    })
  })

  describe('checkValues', () => {
    it('Should not display error if values are not equal', async () => {
      const result = checkValues('name', 'test')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should return false when values are equal', async () => {
      const result = checkValues('test', 'test')
      await expect(result).rejects.toEqual('This field is invalid')
    })
    it('Should not display error when values are equal', async () => {
      const result = checkValues('test', 'test', true)
      await expect(result).resolves.toEqual(undefined)
    })
  })

  describe('apNameRegExp', () => {
    it('Should take care of AP name values correctly', async () => {
      const result = apNameRegExp('test apname')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if AP name values incorrectly', async () => {
      const result = apNameRegExp('test apname ')
      await expect(result).rejects.toEqual('This field is invalid')
    })
  })

  describe('gpsRegExp', () => {
    it('Should take care of GPS values correctly', async () => {
      const result = gpsRegExp('51.507558', '-0.126095')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if the GPS longitude value is incorrect', async () => {
      const result = gpsRegExp('51.507558', '-0.126095xxxx')
      // eslint-disable-next-line max-len
      await expect(result).rejects.toEqual('A valid longitude value is between -180 and 180, and contains a maximum of 6-digit decimal')
    })

    it('Should display error message if the GPS latitude value is incorrect', async () => {
      const result = gpsRegExp('999.507558', '-0.126095')
      // eslint-disable-next-line max-len
      await expect(result).rejects.toEqual('A valid latitude value is between -90 and 90, and contains a maximum of 6-digit decimal')
    })
  })

  describe('serialNumberRegExp', () => {
    it('Should take care of Serial Number values correctly', async () => {
      const result = serialNumberRegExp('123456789000')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if Serial Number values incorrectly', async () => {
      const result1 = serialNumberRegExp('1234567890000')
      await expect(result1).rejects.toEqual('This field is invalid')
    })
  })

  describe('validate recovery passphrase part', () => {
    it('Should take care of recovery passphrase part correctly', async () => {
      const result = validateRecoveryPassphrasePart('1234')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if recovery passphrase part is empty', async () => {
      const result1 = validateRecoveryPassphrasePart('')
      await expect(result1).rejects.toEqual('This field is invalid')
    })

    it('Should display error message if recovery passphrase part is only space', async () => {
      const result1 = validateRecoveryPassphrasePart(' ')
      await expect(result1).rejects.toEqual('Passphrase cannot have space')
    })

    it('Should display error message if recovery passphrase part contains space', async () => {
      const result1 = validateRecoveryPassphrasePart('12 55')
      await expect(result1).rejects.toEqual('Passphrase cannot have space')
    })

    it('Should display error message if recovery passphrase part incorrectly', async () => {
      const result1 = validateRecoveryPassphrasePart('125')
      await expect(result1).rejects.toEqual('Passphrase part must be exactly 4 digits long')
    })
  })

  describe('targetHostRegExpExp', () => {
    it('Should take care of Serial Number values correctly', async () => {
      const result = targetHostRegExp('1.1.1.1')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if Serial Number values incorrectly', async () => {
      const result1 = targetHostRegExp('1.1.1.1.1')
      await expect(result1).rejects.toEqual('Please enter valid target host or IP address')
    })
  })

  describe('poeBudgetRegExp', () => {
    it('Should take care of Poe Budget values correctly', async () => {
      const result = poeBudgetRegExp('2000')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if Poe Budget values incorrectly', async () => {
      const result1 = poeBudgetRegExp('10')
      await expect(result1).rejects.toEqual('Poe Budget can only be from 1000 - 30000')
    })
  })

  describe('dscpRegExp', () => {
    it('Should take care of DSCP values correctly', async () => {
      const result = dscpRegExp('6')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if DSCP values incorrectly', async () => {
      const result1 = dscpRegExp('66')
      await expect(result1).rejects.toEqual('Enter a valid number between 0 and 63')
    })
  })

  describe('priorityRegExp', () => {
    it('Should take care of Priority values correctly', async () => {
      const result = priorityRegExp('6')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if Priority values incorrectly', async () => {
      const result1 = priorityRegExp('66')
      await expect(result1).rejects.toEqual('Enter a valid number between 0 and 7')
    })
  })

  describe('whitespaceOnlyRegExp', () => {
    it('Should take care of string with only white space correctly', async () => {
      const result = whitespaceOnlyRegExp(' t e s t')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if value incorrectly', async () => {
      const result1 = whitespaceOnlyRegExp(' ')
      await expect(result1).rejects.toEqual('Whitespace chars only are not allowed')
    })
  })

  describe('agreeRegExp', () => {
    it('Should take care of agree value correctly', async () => {
      const result = agreeRegExp('agree')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if agree value incorrectly', async () => {
      const result1 = agreeRegExp('test')
      await expect(result1).rejects.toEqual('Please type “AGREE”')
    })
  })

  describe('nameCannotStartWithNumberRegExp', () => {
    it('Should take care of name value correctly', async () => {
      const result = nameCannotStartWithNumberRegExp('test')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if name value incorrectly', async () => {
      const result1 = nameCannotStartWithNumberRegExp('87test')
      await expect(result1).rejects.toEqual('Name cannot start with a number')
    })
  })

  describe('cliVariableNameRegExp', () => {
    it('Should take care of name value correctly', async () => {
      const result = cliVariableNameRegExp('test')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if name value incorrectly', async () => {
      const result1 = cliVariableNameRegExp('Q@Q')
      await expect(result1).rejects.toEqual('Name may include only letters and numbers')
    })
  })

  describe('cliIpAddressRegExp', () => {
    it('Should take care of IP value correctly', async () => {
      const result = cliIpAddressRegExp('1.1.1.1')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if IP value incorrectly', async () => {
      const result1 = cliIpAddressRegExp('1.1.1.255')
      await expect(result1).rejects.toEqual('Please enter a valid IP address')
    })
  })

  describe('subnetMaskPrefixRegExp', () => {
    it('Should take care of subnet mask value correctly', async () => {
      const result = subnetMaskPrefixRegExp('255.255.255.0')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if subnet mask value incorrectly', async () => {
      const result1 = subnetMaskPrefixRegExp('254.255.255.0')
      await expect(result1).rejects.toEqual(
        'Please enter a valid Netmask based on the 255.255 mask prefix')
    })
  })

  describe('specialCharactersRegExp', () => {
    it('Should take care of string with special characters correctly', async () => {
      const result = specialCharactersRegExp('test t$t-t._t')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if string value incorrectly', async () => {
      const result1 = specialCharactersRegExp('test t@$t-t._t')
      await expect(result1).rejects.toEqual(
        'Special characters (other than space, $, -, . and _) are not allowed')
    })
  })

  describe('ipv6RegExp', () => {
    it('Should take care of IP value correctly', async () => {
      const result = ipv6RegExp('2001:db8:3333:4444:5555:6666:7777:8888')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if IP value incorrectly', async () => {
      const result1 = ipv6RegExp('1.1.1.255')
      await expect(result1).rejects.toEqual('Please enter a valid IP address')
    })
  })


  describe('validateTags', () => {
    it('Should take care of tags value correctly', async () => {
      const result = validateTags(['test'])
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if tags value incorrectly', async () => {
      const result1 = validateTags(['1'])
      await expect(result1).rejects.toEqual('Tag is invalid')
    })
    it('Should display error message if tags array more than 24 tags', async () => {
      // eslint-disable-next-line max-len
      const result1 = validateTags(['11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'])
      await expect(result1).rejects.toEqual('No more than 24 Tags are allowed')
    })
  })

  describe('multicast IP address', () => {
    it('Should take care of value correctly', async () => {
      const result = multicastIpAddressRegExp('224.0.1.0')
      await expect(result).resolves.toEqual(undefined)

      const reservedIp1 = multicastIpAddressRegExp('235.1.1.1')
      await expect(reservedIp1).resolves.toEqual(undefined)

      const reservedIp2 = multicastIpAddressRegExp('224.00.1.1')
      await expect(reservedIp2).resolves.toEqual(undefined)
    })

    it('Should check value inverted', async () => {
      const result = multicastIpAddressRegExp('224.0.1.0', true)
      await expect(result).rejects.toEqual('Please exclude multicast IP address')

      const reservedIp1 = multicastIpAddressRegExp('235.1.1.1', true)
      await expect(reservedIp1).rejects.toEqual('Please exclude multicast IP address')
    })

    it('Should display error message if ip address values incorrectly', async () => {
      const result = multicastIpAddressRegExp('8.8.8.8')
      await expect(result).rejects.toEqual('Please enter a valid multicast IP address')
    })
  })
})