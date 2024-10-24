/* eslint-disable max-len */
import { IpUtilsService } from '.'

describe('Test IP utils service', () => {
  it('should return value correctly', async () => {
    expect(IpUtilsService.convertIpToLong('255.255.255.255')).toBe(4294967295)
    expect(IpUtilsService.getBitmaskSize('')).toBe(0)
    expect(IpUtilsService.getBitmaskSize('255.0.0.0')).toBe(8)
    expect(IpUtilsService.countIpRangeSize('192.168.0.1', '192.168.0.100')).toBe(100)
    expect(IpUtilsService.isInSameSubnet('192.168.138.1', '255.255.254.0', '192.168.139.253')).toBe(true)
    expect(IpUtilsService.isInSameSubnet('192.168.138.1', '255.255.254.0', '192.168.140.253')).toBe(false)
    expect(IpUtilsService.isBroadcastAddress('192.128.64.255', '255.255.255.0')).toBe(true)
    expect(IpUtilsService.isBroadcastAddress('192.128.64.1', '255.255.255.0')).toBe(false)
    expect(IpUtilsService.validateInTheSameSubnet('192.128.64.1', '255.255.255.0', '')).toBe(false)
    expect(IpUtilsService.validateInTheSameSubnet('192.128.64.1', '255.255.255.0', '192.128.64.10')).toBe(true)
    expect(IpUtilsService.validateInTheSameSubnet('192.128.64.1', '255.255.255.0', '192.128.65.10')).toBe(false)
    expect(IpUtilsService.validateBroadcastAddress('192.128.64.255', '')).toBe(false)
    expect(IpUtilsService.validateBroadcastAddress('192.128.64.255', '255.255.255.0')).toBe(true)
    expect(IpUtilsService.validateBroadcastAddress('192.128.64.1', '255.255.255.0')).toBe(false)
  })
})