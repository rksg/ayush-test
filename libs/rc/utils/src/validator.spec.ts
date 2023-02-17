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
  serialNumberRegExp,
  targetHostRegExp,
  validateRecoveryPassphrasePart
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
      await expect(result).rejects.toEqual('This field is invalid')
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
      await expect(result1).rejects.toEqual('Network with that name already exists')
      const result2 = checkObjectNotExists(mockdata, 'test01', 'Network', 'pname')
      await expect(result2).rejects.toEqual('Network with that value already exists')
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
    it('Should display error message if GPS values incorrectly', async () => {
      const result = gpsRegExp('51.507558', '-0.126095xxxx')
      await expect(result).rejects.toEqual('Please enter valid GPS coordinates')
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
})
