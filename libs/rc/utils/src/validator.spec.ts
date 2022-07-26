import { networkWifiIpRegExp, networkWifiPortRegExp, stringContainSpace, checkObjectNotExists } from './validator'

describe('validator', () => {
  describe('networkWifiIpRegExp', () => {
    it('Should take care of ip address values correctly', async () => {
      await expect(networkWifiIpRegExp('111.111.111.111')).resolves.toEqual(undefined)
    })
    it('Should display error meesage if ip address values incorrectly', async () => {
      await expect(networkWifiIpRegExp('000.000.000.000'))
        .rejects.toEqual('Please enter a valid IP address')
    })
  })
  describe('networkWifiPortRegExp', () => {
    it('Should take care of port values correctly', async () => {
      await expect(networkWifiPortRegExp(80)).resolves.toEqual(undefined)
    })
    it('Should display error message if port values lower than 1', async () => {
      await expect(networkWifiPortRegExp(-1))
        .rejects.toEqual('This value should be higher than or equal to 1')
    })
    it('Should display error meesage if port values greater than 65535', async () => {
      await expect(networkWifiPortRegExp(65536))
        .rejects.toEqual('This value should be lower than or equal to 65535')
    })
  })
  describe('stringContainSpace', () => {
    it('Should take care of string without space', async () => {
      await expect(stringContainSpace('password1')).resolves.toEqual(undefined)
    })
    it('Should display error meesage if string contains space', async () => {
      await expect(stringContainSpace('password 1')).rejects.toEqual('Spaces are not allowed')
    })
  })
  describe('checkObjectNotExists', () => {
    const mockdata = [{ name: 'test01' }]
    it('Should not display error if object does not exist', async () => {
      await expect(checkObjectNotExists(mockdata, 'test02', 'Network')).resolves.toEqual(undefined)
      await expect(checkObjectNotExists(mockdata, 'test01', 'Network', 'pname'))
        .resolves.toEqual(undefined)
    })
    it('Should return false when object exists', async () => {
      await expect(checkObjectNotExists(mockdata, 'test01', 'Network'))
        .rejects.toEqual('Network with that name already exists')
    })
  })
})
