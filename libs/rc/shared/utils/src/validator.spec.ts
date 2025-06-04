import {
  networkWifiIpRegExp,
  networkWifiDualModeIpRegExp,
  serverIpAddressRegExp,
  dualModeServerIpAddressRegExp,
  domainNameRegExp,
  domainNameWithIPv6RegExp,
  passphraseRegExp,
  checkObjectNotExists,
  checkItemNotIncluded,
  hasGraveAccentAndDollarSign,
  checkVlanMember,
  checkValues,
  checkAclName,
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
  specialCharactersWithNewLineRegExp,
  serialNumberRegExp,
  targetHostRegExp,
  validateSwitchIpAddress,
  validateSwitchSubnetIpAddress,
  validateSwitchGatewayIpAddress,
  validateRecoveryPassphrasePart,
  validateVlanId,
  validateVlanExcludingReserved,
  validateVlanRangeFormat,
  ipv6RegExp,
  validateTags,
  multicastIpAddressRegExp,
  URLProtocolRegExp,
  radiusIpAddressRegExp,
  checkTaggedVlan,
  validateDuplicateName
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

  describe('dualModeIpRegExp', () => {
    it('Should take care of ipv4 address values correctly', async () => {
      const result = networkWifiDualModeIpRegExp('111.111.111.111')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should take care of ipv6 address values correctly', async () => {
      const result = networkWifiDualModeIpRegExp('2001:db8:3333:4444:5555:6666:7777:8888')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if ipv4 address values incorrectly', async () => {
      const result = networkWifiIpRegExp('000.000.000.000')
      await expect(result).rejects.toEqual('Please enter a valid IP address')
    })
    it('Should display error message if ipv6 address values incorrectly', async () => {
      const result = networkWifiIpRegExp('127::0::1')
      await expect(result).rejects.toEqual('Please enter a valid IP address')
    })
  })

  describe('serverIpRegExp', () => {
    it('Should take care of ipv4 address values correctly', async () => {
      const result = serverIpAddressRegExp('111.111.111.111')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if ipv4 address values incorrectly', async () => {
      const result = serverIpAddressRegExp('000.000.000.000')
      await expect(result).rejects.toEqual('Please enter a valid IP address')
    })
  })

  describe('dualModelServerIpRegExp', () => {
    it('Should take care of ipv4 address values correctly', async () => {
      const result = dualModeServerIpAddressRegExp('111.111.111.111')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should take care of ipv6 address values correctly', async () => {
      const result = dualModeServerIpAddressRegExp('2001:db8:3333:4444:5555:6666:7777:8888')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if ipv4 address values incorrectly', async () => {
      const result = dualModeServerIpAddressRegExp('000.000.000.000')
      await expect(result).rejects.toEqual('Please enter a valid IP address')
    })
    it('Should display error message if ipv6 address values incorrectly', async () => {
      const result = dualModeServerIpAddressRegExp('127::0::1')
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

  describe('domainNameWithIPv6RegExp', () => {
    it('Should take care of ipv4 address values correctly', async () => {
      const result = domainNameWithIPv6RegExp('111.111.111.111')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should take care of ipv6 address values correctly', async () => {
      const result = domainNameWithIPv6RegExp('2001:db8:3333:4444:5555:6666:7777:8888')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if ipv4 address values incorrectly', async () => {
      const result = domainNameWithIPv6RegExp('000.000.000.000')
      await expect(result).rejects.toEqual('Please enter a valid domain')
    })
    it('Should display error message if ipv6 address values incorrectly', async () => {
      const result = domainNameWithIPv6RegExp('127::0::1')
      await expect(result).rejects.toEqual('Please enter a valid domain')
    })
  })

  describe('URLProtocolRegExp', () => {
    it('Should take care of url protocol and domain name values correctly', async () => {
      const result = URLProtocolRegExp('http://test.com')
      await expect(result).resolves.toEqual(undefined)
    })
    // eslint-disable-next-line max-len
    it('Should take care of url protocol and domain name values correctly with top domain name is more than 5 characters', async () => {
      const result = URLProtocolRegExp('http://test.comcomcom')
      await expect(result).resolves.toEqual(undefined)
    })
    // eslint-disable-next-line max-len
    it('Should display error message if url protocol or domain name values incorrectly', async () => {
      const result = URLProtocolRegExp('testcom')
      await expect(result).rejects.toEqual('Please enter a valid URL')
    })

    // should also cover ipv4 validation
    it('Should take care of ip address values correctly', async () => {
      const result = URLProtocolRegExp('http://111.111.111.111')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if ip address values incorrectly', async () => {
      const result = URLProtocolRegExp('000.000.000.000')
      await expect(result).rejects.toEqual('Please enter a valid URL')
    })
    it('Should take care of auth info value within url correctlty', async () => {
      const result = URLProtocolRegExp('http://auth:pass@domain.com:1111/path/a/b/c?query=AAA')
      await expect(result).resolves.toEqual(undefined)
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

  describe('validateVlanExcludingReserved', () => {
    it('Should take care of Vlan ID with valid value', async () => {
      const result = validateVlanExcludingReserved('100')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should take care of Vlan ID with invalid number', async () => {
      const result = validateVlanExcludingReserved('4099')
      // eslint-disable-next-line max-len
      await expect(result).rejects.toEqual('Enter a valid number between 1 and 4095, except 4087, 4090, 4091, 4092, 4094')
    })
    it('Should take care of Vlan ID with reserved vlan', async () => {
      const result1 = validateVlanExcludingReserved('4092')
      // eslint-disable-next-line max-len
      await expect(result1).rejects.toEqual('Enter a valid number between 1 and 4095, except 4087, 4090, 4091, 4092, 4094')
    })
  })

  describe('validateVlanRangeFormat', () => {
    it('should render correctly', async () => {
      await expect(validateVlanRangeFormat('20')).resolves.toEqual(undefined)
      await expect(validateVlanRangeFormat('1-20,22,30-100')).resolves.toEqual(undefined)
      await expect(validateVlanRangeFormat('1-20,22, 30-100')).resolves.toEqual(undefined)
      await expect(validateVlanRangeFormat('1-20, 22, 30-100')).resolves.toEqual(undefined)
      await expect(validateVlanRangeFormat('1-20, 22,  30-100')).rejects.toMatch(/Invalid format/)
      await expect(validateVlanRangeFormat('1-20, 22,, 30-100')).rejects.toMatch(/Invalid format/)
      await expect(validateVlanRangeFormat('1-2 0, 22, 30-100')).rejects.toMatch(/Invalid format/)
      await expect(validateVlanRangeFormat('1--20, 22, 30-100')).rejects.toMatch(/Invalid format/)
      await expect(validateVlanRangeFormat('1-20, 22,')).rejects.toMatch(/Invalid format/)
      await expect(validateVlanRangeFormat(',1-20, 22')).rejects.toMatch(/Invalid format/)
      await expect(validateVlanRangeFormat('1-20, -22, 33')).rejects.toMatch(/Invalid format/)
      await expect(validateVlanRangeFormat('1-20, 0.1, 33')).rejects.toMatch(/Invalid format/)
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

  describe('checkAclName', () => {
    it('Should take care of ACL name values correctly', async () => {
      const result1 = checkAclName('acl_1', 'standard')
      await expect(result1).resolves.toEqual(undefined)

      const result2 = checkAclName('ac1Name1', 'extended')
      await expect(result2).resolves.toEqual(undefined)

      const result3 = checkAclName('test', 'standard')
      await expect(result3).rejects.toEqual('The ACL name cannot be \'test\'')

      const result4 = checkAclName('_underscore', 'standard')
      await expect(result4).rejects.toEqual('Name should start with an alphabet')

      const result5 = checkAclName('1acl', 'standard')
      await expect(result5).rejects.toEqual('Name should start with an alphabet')

      const result6 = checkAclName('12 wrong acl name', 'standard')
      await expect(result6).rejects.toEqual('Name should start with an alphabet')

      const result7 = checkAclName('10.1.12', 'standard')
      await expect(result7).rejects.toEqual('Name should start with an alphabet')

      const result8 = checkAclName('aclName"1', 'standard')
      // eslint-disable-next-line max-len
      await expect(result8).rejects.toEqual('An ACL name cannot contain special characters such as a double quote (")')
    })

    it('Should take care of ACL name as numeric range values correctly', async () => {
      const result1 = checkAclName('10', 'standard')
      await expect(result1).resolves.toEqual(undefined)

      const result2 = checkAclName('120', 'standard')
      await expect(result2).rejects.toEqual('Standard ACL Numeric Value Must Be 1-99')

      const result3 = checkAclName('120', 'extended')
      await expect(result3).resolves.toEqual(undefined)

      const result4 = checkAclName('50', 'extended')
      await expect(result4).rejects.toEqual('Extended ACL Numeric Value Must Be 100-199')

      const result5 = checkAclName('250', 'extended')
      await expect(result5).rejects.toEqual('Extended ACL Numeric Value Must Be 100-199')
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

  /* eslint-disable max-len */
  describe('cliIpAddressRegExp', () => {
    it('Should take care of IP value correctly', async () => {
      await expect(cliIpAddressRegExp('1.0.0.1')).resolves.toEqual(undefined)
      await expect(cliIpAddressRegExp('1.1.1.255')).resolves.toEqual(undefined)
      await expect(cliIpAddressRegExp('10.0.16.255')).resolves.toEqual(undefined)
      await expect(cliIpAddressRegExp('192.0.0.1')).resolves.toEqual(undefined)
      await expect(cliIpAddressRegExp('192.8.0.1')).resolves.toEqual(undefined)
      await expect(cliIpAddressRegExp('192.28.0.1')).resolves.toEqual(undefined)
      await expect(cliIpAddressRegExp('192.38.48.1')).resolves.toEqual(undefined)
      await expect(cliIpAddressRegExp('192.0.10.1')).resolves.toEqual(undefined)
      await expect(cliIpAddressRegExp('223.255.255.255')).resolves.toEqual(undefined)
    })
    it('Should display error message if IP value incorrectly', async () => {
      await expect(cliIpAddressRegExp('0.0.0.0')).rejects.toEqual('Please enter a valid IP address')
      await expect(cliIpAddressRegExp('1.0.0.0')).rejects.toEqual('Please enter a valid IP address')
      await expect(cliIpAddressRegExp('192.00.0.1')).rejects.toEqual('Please enter a valid IP address')
      await expect(cliIpAddressRegExp('192.168.00.1')).rejects.toEqual('Please enter a valid IP address')
      await expect(cliIpAddressRegExp('192.168.0.256')).rejects.toEqual('Please enter a valid IP address')
      await expect(cliIpAddressRegExp('224.1.1.255')).rejects.toEqual('Please enter a valid IP address')
      await expect(cliIpAddressRegExp('256.255.255.255')).rejects.toEqual('Please enter a valid IP address')
      await expect(cliIpAddressRegExp('example.com')).rejects.toEqual('Please enter a valid IP address')
    })
  })

  describe('validateSwitchIpAddress', () => {
    it('Should take care of IP value correctly', async () => {
      await expect(validateSwitchIpAddress('1.1.1.1')).resolves.toEqual(undefined)
      await expect(validateSwitchIpAddress('1.1.1.255')).resolves.toEqual(undefined)
      await expect(validateSwitchIpAddress('example.com')).resolves.toEqual(undefined)
      await expect(validateSwitchIpAddress('sub.example.com')).resolves.toEqual(undefined)
    })
    it('Should display error message if IP value incorrectly', async () => {
      await expect(validateSwitchIpAddress('0.0.0.0')).rejects.toEqual('Enter a valid IPv4 address and not broadcast address')
      await expect(validateSwitchIpAddress('192.168.0.256')).rejects.toEqual('Enter a valid IPv4 address and not broadcast address')
      await expect(validateSwitchIpAddress('256.255.255.255')).rejects.toEqual('Enter a valid IPv4 address and not broadcast address')
    })
  })

  describe('validateSwitchSubnetIpAddress', () => {
    it('Should take care of IP value correctly', async () => {
      await expect(validateSwitchSubnetIpAddress('192.168.1.10', '255.255.255.252')).resolves.toEqual(undefined)
      await expect(validateSwitchSubnetIpAddress('192.168.1.10', '255.255.240.0')).resolves.toEqual(undefined)
      await expect(validateSwitchSubnetIpAddress('192.168.1.10', '255.254.0.0')).resolves.toEqual(undefined)
      await expect(validateSwitchSubnetIpAddress('192.168.1.10', '224.0.0.0')).resolves.toEqual(undefined)
    })
    it('Should display error message if IP value incorrectly', async () => {
      await expect(validateSwitchSubnetIpAddress('192.168.1.10', '255.255.255.254')).rejects.toEqual('Enter a valid IPv4 address and not broadcast address')
      await expect(validateSwitchSubnetIpAddress('192.168.1.10', '255.255.0.1')).rejects.toEqual('Enter a valid IPv4 address and not broadcast address')
      await expect(validateSwitchSubnetIpAddress('192.168.1.10', '255.0.1.0')).rejects.toEqual('Enter a valid IPv4 address and not broadcast address')
      await expect(validateSwitchSubnetIpAddress('192.168.1.10', '192.0.1.0')).rejects.toEqual('Enter a valid IPv4 address and not broadcast address')
      await expect(validateSwitchSubnetIpAddress('223.255.255.255', '255.255.0.0')).rejects.toEqual('Can not be a broadcast address')
    })
  })

  describe('validateSwitchGatewayIpAddress', () => {
    it('Should take care of IP value correctly', async () => {
      await expect(validateSwitchGatewayIpAddress('192.168.1.10', '255.255.0.0', '192.168.1.20')).resolves.toEqual(undefined)
      await expect(validateSwitchGatewayIpAddress('192.168.1.10', '255.255.0.0', '192.168.2.20')).resolves.toEqual(undefined)
    })
    it('Should display error message if IP value incorrectly', async () => {
      await expect(validateSwitchGatewayIpAddress('192.168.1.10', '255.255.255.252', '0.0.0.0')).rejects.toEqual('Gateway is invalid')
      await expect(validateSwitchGatewayIpAddress('192.168.1.10', '255.255.0.0', '256.1.1.1')).rejects.toEqual('Gateway is invalid')
      await expect(validateSwitchGatewayIpAddress('192.168.1.10', '255.255.255.252', '192.168.1.20')).rejects.toEqual('IP and gateway are not in the same subnet')
    })
  })
  /* eslint-enable max-len */

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
  describe('specialCharactersWithNewLineRegExp', () => {
    it('Should take care of string with special characters correctly', async () => {
      const result = specialCharactersWithNewLineRegExp('test t$t-t._t\n\n')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should display error message if string value incorrectly', async () => {
      const result1 = specialCharactersWithNewLineRegExp('test t@$t-t._t')
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


  describe('radiusIpAddressRegExp', () => {
    it('Should take care of IP value correctly', async () => {
      await expect(radiusIpAddressRegExp('10.1.1.1')).resolves.toEqual(undefined)
      await expect(radiusIpAddressRegExp('192.168.0.1')).resolves.toEqual(undefined)
    })
    it('Should display error message if IP value incorrectly', async () => {
      await expect(
        radiusIpAddressRegExp('192.168.1.256')).rejects.toEqual('Please enter a valid IP address')
      await expect(
        radiusIpAddressRegExp('256.256.256.256')).rejects.toEqual('Please enter a valid IP address')
    })
  })

  describe('checkTaggedVlan', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should reject invalid format', async () => {
      await expect(checkTaggedVlan('1,2,3a')).rejects.toEqual('This field is invalid')
      await expect(checkTaggedVlan('1,2,')).rejects.toEqual('This field is invalid')
      await expect(checkTaggedVlan('1,,3')).rejects.toEqual('This field is invalid')
    })

    it('should reject duplicate VLANs', async () => {
      await expect(checkTaggedVlan('1,2,2,3')).rejects.toEqual(
        'Tagged VLAN with that value already exists ')
    })

    it('should reject VLANs outside the valid range', async () => {
      await expect(checkTaggedVlan('0,1,2')).rejects.toEqual(
        'Enter a valid number between 1 and 4095, except 4087, 4090, 4091, 4092, 4094')
      await expect(checkTaggedVlan('1,4096,2')).rejects.toEqual(
        'Enter a valid number between 1 and 4095, except 4087, 4090, 4091, 4092, 4094')
    })

    it('should reject reserved VLANs', async () => {
      await expect(checkTaggedVlan('1,4087,4090')).rejects.toEqual(
        'Enter a valid number between 1 and 4095, except 4087, 4090, 4091, 4092, 4094')
    })

    it('should accept valid VLAN ranges', async () => {
      await expect(checkTaggedVlan('1,10,100,1000,4095')).resolves.toBeUndefined()
      await expect(checkTaggedVlan('1')).resolves.toBeUndefined()
      await expect(checkTaggedVlan('1,2,3,4,5')).resolves.toBeUndefined()
    })
  })

  describe('validateDuplicateName', () => {
    it('Should validate duplicate name correctly', async () => {
      await expect(validateDuplicateName({ name: '1', id: '1' }, [{ name: '2', id: '1' }]))
        .resolves.toEqual(undefined)
      await expect(validateDuplicateName({ name: '1', id: '1' }, [{ name: '1', id: '2' }]))
        .rejects.toEqual('The name already exists')
    })
  })
})
