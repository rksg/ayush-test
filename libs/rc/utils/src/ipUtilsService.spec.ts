import { IpUtilsService } from '.'

describe('Test IP utils service', () => {
  it('should return value correctly', async () => {
    IpUtilsService.convertIpToLong('255.255.255.255')
    IpUtilsService.getBitmaskSize('255.0.0.0')
    IpUtilsService.countIpRangeSize('192.168.0.1', '192.168.0.100')
  })
})