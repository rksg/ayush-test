import { networkWifiIpRegExp, networkWifiPortRegExp, stringContainSpace, checkObjectNotExists } from './validator'

describe('validator', () => {
  it('Should take care of ip address values correctly', () => {
    expect(networkWifiIpRegExp('111.111.111.111')).toMatchObject({})
  })
  it('Should display error meesage if ip address values incorrectly', async () => {
    await expect(networkWifiIpRegExp('000.000.000.000'))
      .rejects.toEqual('Please enter a valid IP address')
  })
  it('Should take care of port values correctly', () => {
    expect(networkWifiPortRegExp(80)).toMatchObject({})
  })
  it('Should display error message if port values lower than 1', async () => {
    await expect(networkWifiPortRegExp(-1))
      .rejects.toEqual('This value should be higher than or equal to 1')
  })
  it('Should display error meesage if port values greater than 65535', async () => {
    await expect(networkWifiPortRegExp(65536))
      .rejects.toEqual('This value should be lower than or equal to 65535')
  })
  it('Should take care of string without space', () => {
    expect(stringContainSpace('password1')).toMatchObject({})
  })
  it('Should display error meesage if string contains space', async () => {
    await expect(stringContainSpace('password 1')).rejects.toEqual('Spaces are not allowed')
  })
  describe('checkObjectNotExists', () => {
    const mockdata = [{ name: 'test01' }]
    it('Should return false when object exists', async () => {
      expect(checkObjectNotExists(mockdata, 'test01')).toBeFalsy()
    })
    it('Should return true when object does not exists', async () => {
      expect(checkObjectNotExists(mockdata, 'test01', 'pname')).toBeTruthy()
      expect(checkObjectNotExists(mockdata, 'test02')).toBeTruthy()
    })
  })
})
