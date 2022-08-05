export class IpUtilsService {

  constructor () { }

  /**
   * Whether the ip address is a broadcast address or not
   * @param ipAddress
   * @param subnetMask, can be either single number like '24' or '255.255.255.0'
   */
  // static isBroadcastAddress(ipAddress: string, subnetMask: string): boolean {
  //   const network = new Netmask(ipAddress + '/' + subnetMask);
  //   return (network.broadcast === ipAddress);
  // }

  /**
   * Whether the additional ip address is in the same subnet as the subnet specified by ipAddress/subnetMask
   * @param ipAddress
   * @param subnetMask, can be either single number like '24' or '255.255.255.0'
   * @param additionalIpAddress
   */
  // static isInSameSubnet(ipAddress: string, subnetMask: string, additionalIpAddress: string): boolean {
  //   const network = new Netmask(ipAddress + '/' + subnetMask);
  //   return (network.contains(additionalIpAddress));
  // }

  /**
   * Get subnet information like size,  broadcast address...etc.
   * Check https://www.npmjs.com/package/netmask for more detail
   * @param ipAddress
   * @param subnetMask, can be either single number like '24' or '255.255.255.0'
   */
  // static getSubnetInfo(ipAddress: string, subnetMask: string): any {
  //   return new Netmask(ipAddress + '/' + subnetMask);
  // }

  /**
   * Convert IP Address To Long value
   * @param ipAddress IP address
   */
  static convertIpToLong (ipAddress: string): number {
    const ipArray = ipAddress.split('.').map(ip => parseInt(ip, 10))
    return ipArray[0] * 16777216 + ipArray[1] * 65536 + ipArray[2] * 256 + ipArray[3]
  }

  /**
   * Get bitmask size from netmask (255.0.0.0 => 8)
   * @param netmask The netmask as a string (eg: 255.255.255.0)
   * @returns The netmask as a number of bits (eg: 24)
   */
  static getBitmaskSize (netmask: string): number {
    if (!netmask) return 0
    const maskLong = this.convertIpToLong(netmask)

    for (let i = 32; i >= 0; i--) {
      const calculatedResult = (0xffffffff << (32 - i)) >>> 0
      if (maskLong === calculatedResult) {
        return i
      }
    }
    return 0
  }

  static countIpRangeSize (startIpAddress: string, endIpAddress: string): number {
    const startLong = IpUtilsService.convertIpToLong(startIpAddress)
    const endLong = IpUtilsService.convertIpToLong(endIpAddress)

    return endLong - startLong + 1
  }
}
