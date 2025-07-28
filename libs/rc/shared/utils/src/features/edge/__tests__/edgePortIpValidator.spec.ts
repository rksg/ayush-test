import { edgePortIpValidator } from '../edgeValidators'

describe('edgePortIpValidator', () => {
  describe('IP validation', () => {
    it('should resolve when IP is valid and subnet is available but not broadcast address',
      async () => {
      // Arrange
        const ip = '192.168.1.100'
        const subnetMask = '255.255.255.0'

        // Act
        const result = await edgePortIpValidator(ip, subnetMask)

        // Assert
        expect(result).toBeUndefined()
      })

    it('should reject when IP validation fails', async () => {
      // Arrange
      const ip = '256.1.1.1'
      const subnetMask = '255.255.255.0'

      // Act & Assert
      await expect(edgePortIpValidator(ip, subnetMask))
        .rejects.toEqual('Please enter a valid IP address')
    })

    it('should reject when IP is broadcast address and subnet is available', async () => {
      // Arrange
      const ip = '192.168.1.255'
      const subnetMask = '255.255.255.0'

      // Act & Assert
      await expect(edgePortIpValidator(ip, subnetMask))
        .rejects.toBe('Can not be a broadcast address')
    })
  })

  describe('Subnet validation', () => {
    it('should resolve when subnet is unavailable (empty string)', async () => {
      // Arrange
      const ip = '192.168.1.100'
      const subnetMask = ''

      // Act
      const result = await edgePortIpValidator(ip, subnetMask)

      // Assert
      expect(result).toBeUndefined()
    })

    it('should resolve when subnet is unavailable (invalid subnet)', async () => {
      // Arrange
      const ip = '192.168.1.100'
      const subnetMask = 'invalid-subnet'

      // Act
      const result = await edgePortIpValidator(ip, subnetMask)

      // Assert
      expect(result).toBeUndefined()
    })

    it('should resolve when subnet is unavailable and IP is broadcast address', async () => {
      // Arrange
      const ip = '192.168.1.255'
      const subnetMask = 'invalid-subnet'

      // Act
      const result = await edgePortIpValidator(ip, subnetMask)

      // Assert
      expect(result).toBeUndefined()
    })
  })

  describe('Corner cases', () => {
    it('should resolve when handling empty IP string', async () => {
      // Arrange
      const ip = ''
      const subnetMask = '255.255.255.0'

      // Act & Assert
      await expect(edgePortIpValidator(ip, subnetMask)).resolves.toEqual(undefined)
    })

    it('should handle null IP', async () => {
      // Arrange
      const ip = null as unknown as string
      const subnetMask = '255.255.255.0'

      // Act & Assert
      await expect(edgePortIpValidator(ip, subnetMask)).resolves.toEqual(undefined)
    })

    it('should handle undefined IP', async () => {
      // Arrange
      const ip = undefined as unknown as string
      const subnetMask = '255.255.255.0'

      // Act & Assert
      await expect(edgePortIpValidator(ip, subnetMask)).resolves.toEqual(undefined)
    })

    it('should handle empty subnet mask', async () => {
      // Arrange
      const ip = '192.168.1.100'
      const subnetMask = ''

      // Assert
      await expect(edgePortIpValidator(ip, subnetMask)).resolves.toEqual(undefined)
    })

    it('should handle undefined subnet mask', async () => {
      // Arrange
      const ip = '192.168.1.100'
      const subnetMask = undefined as unknown as string

      // Assert
      await expect(edgePortIpValidator(ip, subnetMask)).resolves.toEqual(undefined)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle typical valid configuration', async () => {
      // Arrange
      const ip = '10.0.0.50'
      const subnetMask = '255.255.255.0'

      // Act
      const result = await edgePortIpValidator(ip, subnetMask)

      // Assert
      expect(result).toBeUndefined()
    })

    it('should handle broadcast address in different subnet ranges', async () => {
      // Arrange
      const testCases = [
        { ip: '192.168.1.255', subnet: '255.255.255.0' },
        { ip: '10.0.0.255', subnet: '255.255.255.0' },
        { ip: '172.16.0.255', subnet: '255.255.255.0' }
      ]

      for (const testCase of testCases) {
        // Act & Assert
        await expect(edgePortIpValidator(testCase.ip, testCase.subnet))
          .rejects.toBe('Can not be a broadcast address')
      }
    })

    it('should handle different subnet mask formats', async () => {
      // Arrange
      const ip = '192.168.1.100'
      const subnetMasks = ['255.255.255.0', '255.255.0.0', '255.0.0.0']

      for (const subnetMask of subnetMasks) {
        // Act
        const result = await edgePortIpValidator(ip, subnetMask)

        // Assert
        expect(result).toBeUndefined()
      }
    })
  })
})