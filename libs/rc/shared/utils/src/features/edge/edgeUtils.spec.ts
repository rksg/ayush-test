import { EdgeServiceStatusEnum, EdgeStatusEnum } from '../../models/EdgeEnum'

import { EdgeAlarmFixtures } from './__tests__/fixtures'
import {
  allowRebootForStatus,
  allowResetForStatus,
  edgeSerialNumberValidator,
  getEdgeServiceHealth,
  getIpWithBitMask,
  getSuggestedIpRange,
  lanPortsubnetValidator,
  optionSorter,
  validateClusterInterface,
  validateSubnetIsConsistent,
  validateUniqueIp
} from './edgeUtils'

const { requireAttentionAlarmSummary, poorAlarmSummary } = EdgeAlarmFixtures
describe('Edge utils', () => {

  it('should get good service health', () => {
    const serviceHealth = getEdgeServiceHealth([])
    expect(serviceHealth).toBe(EdgeServiceStatusEnum.GOOD)
  })

  it('should get require attention service health', () => {
    const serviceHealth = getEdgeServiceHealth(requireAttentionAlarmSummary)
    expect(serviceHealth).toBe(EdgeServiceStatusEnum.REQUIRES_ATTENTION)
  })

  it('should get poor service health', () => {
    const serviceHealth = getEdgeServiceHealth(poorAlarmSummary)
    expect(serviceHealth).toBe(EdgeServiceStatusEnum.POOR)
  })

  it('should get unknown service health', () => {
    const serviceHealth = getEdgeServiceHealth(undefined)
    expect(serviceHealth).toBe(EdgeServiceStatusEnum.UNKNOWN)
  })

  it('reboot & reset should be allowed only for a set of specific statuses', () => {
    Object.values(EdgeStatusEnum).forEach(status => {
      expect(allowRebootForStatus(status)).toBe(status === EdgeStatusEnum.OPERATIONAL ||
        status === EdgeStatusEnum.APPLYING_CONFIGURATION ||
        status === EdgeStatusEnum.CONFIGURATION_UPDATE_FAILED ||
        status === EdgeStatusEnum.FIRMWARE_UPDATE_FAILED)

      expect(allowResetForStatus(status)).toBe(status === EdgeStatusEnum.OPERATIONAL ||
        status === EdgeStatusEnum.APPLYING_CONFIGURATION ||
        status === EdgeStatusEnum.CONFIGURATION_UPDATE_FAILED ||
        status === EdgeStatusEnum.FIRMWARE_UPDATE_FAILED)
    })
  })

  it('should getIpWithBitMask correctly', () => {
    const result = getIpWithBitMask('192.168.1.2', '255.255.255.0')
    expect(result).toBe('192.168.1.2/ 24')
  })

  it('should getSuggestedIpRange correctly', () => {
    const result = getSuggestedIpRange('192.168.1.2', '255.255.255.0')
    expect(result).toBe('192.168.1.0/ 24')
  })

  it('Test validate serial number success', async () => {
    const result = await edgeSerialNumberValidator('9612345678901234567890111123456110')
    expect(result).toBeUndefined()
  })

  it('Test validate serial number failed', async () => {
    let error
    try {
      await edgeSerialNumberValidator('9612345')
    } catch (ex) {
      error = ex
    }
    expect(error).toBe('Field must be exactly 34 characters')
    try {
      await edgeSerialNumberValidator('123')
    } catch (ex) {
      error = ex
    }
    expect(error).toBe('This field is invalid')
    try {
      await edgeSerialNumberValidator('AB12345678901234567890111123456110')
    } catch (ex) {
      error = ex
    }
    expect(error).toBe('This field is invalid')
  })

  it('Test optionSorter correctly', () => {
    const mockOptions = [
      {
        label: 'Port3',
        value: 'port3'
      },
      {
        label: 'Lag1',
        value: 'lag1'
      }
    ]
    expect(optionSorter(mockOptions[0], mockOptions[1])).toBe(1)
    expect(optionSorter(mockOptions[1], mockOptions[0])).toBe(-1)
    expect(optionSorter(mockOptions[0], mockOptions[0])).toBe(0)
  })

  it('Test lanPortsubnetValidator success', async () => {
    const currentSubnetInfo = {
      ip: '1.1.1.1',
      subnetMask: '255.255.255.0'
    }
    const allSubnetWithoutCurrent = [
      {
        ip: '2.2.2.2',
        subnetMask: '255.255.255.0'
      },
      {
        ip: '3.3.3.3',
        subnetMask: '255.255.255.0'
      }
    ]
    const mockErrorFn = jest.fn()
    try {
      await lanPortsubnetValidator(currentSubnetInfo, allSubnetWithoutCurrent)
    } catch (ex) {
      mockErrorFn()
    }
    expect(mockErrorFn).not.toBeCalled()
  })

  it('Test lanPortsubnetValidator failed', async () => {
    const currentSubnetInfo = {
      ip: '1.1.1.1',
      subnetMask: '255.255.255.0'
    }
    const allSubnetWithoutCurrent = [
      {
        ip: '1.1.1.1',
        subnetMask: '255.255.255.0'
      },
      {
        ip: '3.3.3.3',
        subnetMask: '255.255.255.0'
      }
    ]
    const mockErrorFn = jest.fn()
    try {
      await lanPortsubnetValidator(currentSubnetInfo, allSubnetWithoutCurrent)
    } catch (ex) {
      mockErrorFn(ex)
    }
    expect(mockErrorFn).toBeCalledWith('The ports have overlapping subnets')
  })

  it('Test validateSubnetIsConsistent success', async () => {
    const allIps = [
      {
        ip: '1.1.1.1',
        subnet: '255.255.255.0'
      },
      {
        ip: '1.1.1.5',
        subnet: '255.255.255.0'
      }
    ]
    const mockErrorFn = jest.fn()
    try {
      await validateSubnetIsConsistent(allIps, '1')
    } catch (ex) {
      mockErrorFn()
    }
    expect(mockErrorFn).not.toBeCalled()
  })

  it('Test validateSubnetIsConsistent failed', async () => {
    const allIps = [
      {
        ip: '1.1.1.1',
        subnet: '255.255.255.0'
      },
      {
        ip: '2.2.2.2',
        subnet: '255.255.255.0'
      }
    ]
    const mockErrorFn = jest.fn()
    try {
      await validateSubnetIsConsistent(allIps, '1')
    } catch (ex) {
      mockErrorFn(ex)
    }
    // eslint-disable-next-line max-len
    expect(mockErrorFn).toBeCalledWith('The selected port is not in the same subnet as other nodes.')
  })

  it('Test validateUniqueIp success', async () => {
    const allIps = ['1.1.1.1', '2.2.2.2']
    const mockErrorFn = jest.fn()
    try {
      await validateUniqueIp(allIps, 'true')
    } catch (ex) {
      mockErrorFn()
    }
    expect(mockErrorFn).not.toBeCalled()
  })

  it('Test validateUniqueIp failed', async () => {
    const allIps = ['1.1.1.1', '1.1.1.1']
    const mockErrorFn = jest.fn()
    try {
      await validateUniqueIp(allIps, 'true')
    } catch (ex) {
      mockErrorFn(ex)
    }
    expect(mockErrorFn).toBeCalledWith('IP address cannot be the same as other nodes.')
  })

  it('Test validateClusterInterface success', async () => {
    const allIps = ['port2', 'port1']
    const mockErrorFn = jest.fn()
    try {
      await validateClusterInterface(allIps)
    } catch (ex) {
      mockErrorFn()
    }
    expect(mockErrorFn).not.toBeCalled()
  })

  it('Test validateClusterInterface failed', async () => {
    const allIps = ['port1', 'lag0']
    const mockErrorFn = jest.fn()
    try {
      await validateClusterInterface(allIps)
    } catch (ex) {
      mockErrorFn(ex)
    }
    // eslint-disable-next-line max-len
    expect(mockErrorFn).toBeCalledWith('Make sure you select the same interface type (physical port or LAG) as that of another node in this cluster.')
  })
})
