import {
  networkWifiIpRegExp,
  domainNameRegExp,
  passphraseRegExp,
  checkObjectNotExists,
  checkItemNotIncluded,
  hasGraveAccentAndDollarSign,
  checkVlanMember,
  checkValuesNotEqual,
  apNameRegExp,
  gpsRegExp,
  serialNumberRegExp
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

  describe('checkValuesNotEqual', () => {
    it('Should not display error if values are not equal', async () => {
      const result = checkValuesNotEqual('name', 'test')
      await expect(result).resolves.toEqual(undefined)
    })
    it('Should return false when values are equal', async () => {
      const result1 = checkValuesNotEqual('test', 'test')
      await expect(result1).rejects.toEqual('This field is invalid')
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
})
