/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { Input } from 'antd'

import { DeviceConnectionStatus }                           from '../../constants'
import { STACK_MEMBERSHIP, SwitchStatusEnum, SwitchClient } from '../../types'

import {
  isStrictOperationalSwitch,
  transformSwitchStatus,
  getSwitchStatusString,
  getStackMemberStatus,
  getClientIpAddr,
  getAdminPassword,
  transformSwitchUnitStatus,
  createSwitchSerialPattern,
  createSwitchSerialPatternForSpecific8100Model
} from '.'

const switchRow ={
  id: 'FMF2249Q0JT',
  model: 'ICX7150-C08P',
  serialNumber: 'FMF2249Q0JT',
  activeSerial: 'FMF2249Q0JT',
  deviceStatus: SwitchStatusEnum.OPERATIONAL,
  switchMac: '',
  isStack: false,
  name: '',
  venueId: '5c05180d54d84e609a4d653a3a8332d1',
  venueName: 'My-Venue',
  configReady: false,
  syncedSwitchConfig: true,
  syncDataEndTime: '',
  cliApplied: false,
  formStacking: false,
  suspendingDeployTime: ''
}

describe('switch.utils', () => {
  describe('Test isStrictOperationalSwitch function', () => {
    it('should render correctly', async () => {
      expect(isStrictOperationalSwitch(SwitchStatusEnum.OPERATIONAL, true, true)).toBeTruthy()
    })
  })

  describe('Test transformSwitchUnitStatus function', () => {
    it('should render correctly', async () => {
      expect(transformSwitchUnitStatus(SwitchStatusEnum.NEVER_CONTACTED_CLOUD)).toEqual('Never contacted cloud')
      expect(transformSwitchUnitStatus(SwitchStatusEnum.INITIALIZING)).toEqual('Initializing')
      expect(transformSwitchUnitStatus(SwitchStatusEnum.FIRMWARE_UPD_START)).toEqual('Firmware Updating')
      expect(transformSwitchUnitStatus(SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_PARAMETERS)).toEqual('Firmware Updating')
      expect(transformSwitchUnitStatus(SwitchStatusEnum.FIRMWARE_UPD_DOWNLOADING)).toEqual('Firmware Updating')
      expect(transformSwitchUnitStatus(SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_IMAGE)).toEqual('Firmware Updating')
      expect(transformSwitchUnitStatus(SwitchStatusEnum.FIRMWARE_UPD_SYNCING_TO_REMOTE)).toEqual('Firmware Updating')
      expect(transformSwitchUnitStatus(SwitchStatusEnum.FIRMWARE_UPD_WRITING_TO_FLASH)).toEqual('Firmware Updating')
      expect(transformSwitchUnitStatus(SwitchStatusEnum.FIRMWARE_UPD_FAIL)).toEqual('Firmware Updating')
      expect(transformSwitchUnitStatus(SwitchStatusEnum.APPLYING_FIRMWARE)).toEqual('Firmware Updating')
      expect(transformSwitchUnitStatus(SwitchStatusEnum.OPERATIONAL, true, true, '1 minute'))
        .toEqual('Applying configuration')
      expect(transformSwitchUnitStatus(SwitchStatusEnum.OPERATIONAL, true, true))
        .toEqual('Operational')
      expect(transformSwitchUnitStatus(SwitchStatusEnum.OPERATIONAL, true, false))
        .toEqual('Synchronizing data')
      expect(transformSwitchUnitStatus(SwitchStatusEnum.OPERATIONAL, false, true))
        .toEqual('Synchronizing')
      expect(transformSwitchUnitStatus(SwitchStatusEnum.DISCONNECTED))
        .toEqual('Disconnected from cloud')
      expect(transformSwitchUnitStatus(SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED))
        .toEqual('Never contacted Active Switch')
      expect(transformSwitchUnitStatus('Default' as SwitchStatusEnum))
        .toEqual('Never contacted cloud')
    })
  })

  describe('Test transformSwitchStatus function', () => {
    it('should render correctly', async () => {
      expect(transformSwitchStatus(SwitchStatusEnum.NEVER_CONTACTED_CLOUD)).toStrictEqual({
        message: 'Never contacted cloud',
        deviceStatus: DeviceConnectionStatus.INITIAL,
        isOperational: false
      })
      expect(transformSwitchStatus(SwitchStatusEnum.INITIALIZING)).toStrictEqual({
        message: 'Initializing',
        deviceStatus: DeviceConnectionStatus.INITIAL,
        isOperational: false
      })
      expect(transformSwitchStatus(SwitchStatusEnum.FIRMWARE_UPD_START)).toStrictEqual({
        message: 'Firmware Updating',
        deviceStatus: DeviceConnectionStatus.ALERTING,
        isOperational: false
      })
      expect(transformSwitchStatus(SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_PARAMETERS)).toStrictEqual({
        message: 'Firmware Update - Validating Parameters',
        deviceStatus: DeviceConnectionStatus.ALERTING,
        isOperational: false
      })
      expect(transformSwitchStatus(SwitchStatusEnum.FIRMWARE_UPD_DOWNLOADING)).toStrictEqual({
        message: 'Firmware Update - Downloading',
        deviceStatus: DeviceConnectionStatus.ALERTING,
        isOperational: false
      })
      expect(transformSwitchStatus(SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_IMAGE)).toStrictEqual({
        message: 'Firmware Update - Validating Image',
        deviceStatus: DeviceConnectionStatus.ALERTING,
        isOperational: false
      })
      expect(transformSwitchStatus(SwitchStatusEnum.FIRMWARE_UPD_SYNCING_TO_REMOTE)).toStrictEqual({
        message: 'Firmware Update - Syncing To Remote',
        deviceStatus: DeviceConnectionStatus.ALERTING,
        isOperational: false
      })
      expect(transformSwitchStatus(SwitchStatusEnum.FIRMWARE_UPD_WRITING_TO_FLASH)).toStrictEqual({
        message: 'Firmware Update - Writing To Flash',
        deviceStatus: DeviceConnectionStatus.ALERTING,
        isOperational: false
      })
      expect(transformSwitchStatus(SwitchStatusEnum.FIRMWARE_UPD_FAIL)).toStrictEqual({
        message: 'Firmware Update - Failed',
        deviceStatus: DeviceConnectionStatus.DISCONNECTED,
        isOperational: false
      })
      expect(transformSwitchStatus(SwitchStatusEnum.APPLYING_FIRMWARE)).toStrictEqual({
        message: 'Firmware updating',
        deviceStatus: DeviceConnectionStatus.ALERTING,
        isOperational: false
      })
      expect(transformSwitchStatus(SwitchStatusEnum.OPERATIONAL, true, true, '1 minute')).toStrictEqual({
        message: 'Applying configuration',
        deviceStatus: DeviceConnectionStatus.CONNECTED,
        isOperational: false
      })
      expect(transformSwitchStatus(SwitchStatusEnum.OPERATIONAL, true, true)).toStrictEqual({
        message: 'Operational',
        deviceStatus: DeviceConnectionStatus.CONNECTED,
        isOperational: true
      })
      expect(transformSwitchStatus(SwitchStatusEnum.OPERATIONAL, true, false)).toStrictEqual({
        message: 'Synchronizing data',
        deviceStatus: DeviceConnectionStatus.CONNECTED,
        isOperational: false
      })
      expect(transformSwitchStatus(SwitchStatusEnum.OPERATIONAL, false, true)).toStrictEqual({
        message: 'Synchronizing',
        deviceStatus: DeviceConnectionStatus.CONNECTED,
        isOperational: false
      })
      expect(transformSwitchStatus(SwitchStatusEnum.DISCONNECTED)).toStrictEqual({
        message: 'Disconnected from cloud',
        deviceStatus: DeviceConnectionStatus.DISCONNECTED,
        isOperational: false
      })
      expect(transformSwitchStatus(SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED)).toStrictEqual({
        message: 'Never contacted Active Switch',
        deviceStatus: DeviceConnectionStatus.INITIAL,
        isOperational: false
      })
      expect(transformSwitchStatus('Default' as SwitchStatusEnum)).toStrictEqual({
        message: 'Never contacted cloud',
        deviceStatus: DeviceConnectionStatus.INITIAL,
        isOperational: false
      })
    })
  })

  describe('Test getSwitchStatusString function', () => {
    it('should Synchronizing correctly', async () => {
      expect(getSwitchStatusString(switchRow)).toBe('Synchronizing')
    })

    it('should Warning correctly', async () => {
      const data = {
        ...switchRow,
        syncDataId: '1',
        configReady: true,
        syncedSwitchConfig: true,
        operationalWarning: true
      }
      expect(getSwitchStatusString(data)).toBe('Synchronizing')
    })
  })

  describe('Test getStackMemberStatus function', () => {
    it('should render correctly', async () => {
      expect(getStackMemberStatus(STACK_MEMBERSHIP.ACTIVE)).toBe('Active')
      expect(getStackMemberStatus(STACK_MEMBERSHIP.STANDBY)).toBe('Standby')
      expect(getStackMemberStatus(STACK_MEMBERSHIP.MEMBER)).toBe('Member')
      expect(getStackMemberStatus(STACK_MEMBERSHIP.STANDALONE)).toBe('Standalone')
      expect(getStackMemberStatus('', true)).toBe('Member')
      expect(getStackMemberStatus('')).toBeFalsy()
    })
  })

  describe('Test getClientIpAddr function', () => {
    const legacyDefaultData = {
      clientIpv4Addr: '0.0.0.0',
      clientIpv6Addr: '0:0:0:0:0:0:0:0'
    } as SwitchClient

    const defaultData = {
      clientIpv4Addr: '',
      clientIpv6Addr: ''
    } as SwitchClient
    it('should render correctly', async () => {
      expect(getClientIpAddr(legacyDefaultData)).toBe('--')
      expect(getClientIpAddr(defaultData)).toBe('--')
      expect(getClientIpAddr({
        ...legacyDefaultData,
        clientIpv4Addr: '192.168.1.1'
      })).toBe('192.168.1.1')
      expect(getClientIpAddr({
        ...legacyDefaultData,
        clientIpv6Addr: '1:0:0:0:0:0:0:0'
      })).toBe('1:0:0:0:0:0:0:0')
      expect(getClientIpAddr({
        ...defaultData,
        clientIpv4Addr: '192.168.1.1'
      })).toBe('192.168.1.1')
      expect(getClientIpAddr({
        ...defaultData,
        clientIpv6Addr: '1:0:0:0:0:0:0:0'
      })).toBe('1:0:0:0:0:0:0:0')
    })
  })

  describe('Test getAdminPassword function', () => {
    it('should render correctly', async () => {
      expect(getAdminPassword({
        ...switchRow,
        configReady: true,
        syncedSwitchConfig: true,
        deviceStatus: SwitchStatusEnum.NEVER_CONTACTED_CLOUD
      },
      { isSupport8100: false,
        isSupport8100X: false,
        isSupport7550Zippy: false
      })).toBe('--')

      expect(getAdminPassword({
        ...switchRow,
        configReady: true,
        syncedSwitchConfig: true,
        deviceStatus: SwitchStatusEnum.FIRMWARE_UPD_START
      },
      { isSupport8100: false,
        isSupport8100X: false,
        isSupport7550Zippy: false
      })).toBe('--')

      expect(getAdminPassword({
        ...switchRow,
        configReady: false,
        syncedSwitchConfig: true,
        deviceStatus: SwitchStatusEnum.NEVER_CONTACTED_CLOUD
      },
      { isSupport8100: false,
        isSupport8100X: false,
        isSupport7550Zippy: false
      })).toBe('--')

      expect(getAdminPassword({
        ...switchRow,
        id: 'c0:c5:20:aa:24:7b',
        configReady: true,
        syncedSwitchConfig: true,
        deviceStatus: SwitchStatusEnum.OPERATIONAL
      },
      {
        isSupport8100: false,
        isSupport8100X: false,
        isSupport7550Zippy: false
      })).toBe('Custom')

      expect(getAdminPassword({
        ...switchRow,
        id: 'c0:c5:20:aa:24:7b',
        configReady: true,
        syncedSwitchConfig: true,
        syncedAdminPassword: true,
        adminPassword: 'test123',
        deviceStatus: SwitchStatusEnum.OPERATIONAL
      },
      { isSupport8100: false,
        isSupport8100X: false,
        isSupport7550Zippy: false
      }, Input.Password)).not.toBe('Custom')

      expect(getAdminPassword({
        ...switchRow,
        id: 'c0:c5:20:aa:24:7b',
        configReady: true,
        syncedSwitchConfig: true,
        deviceStatus: SwitchStatusEnum.DISCONNECTED
      },
      { isSupport8100: false,
        isSupport8100X: false,
        isSupport7550Zippy: false
      })).toBe('Custom')

      expect(getAdminPassword({
        ...switchRow,
        id: 'c0:c5:20:aa:24:7b',
        configReady: true,
        syncedSwitchConfig: true,
        deviceStatus: SwitchStatusEnum.FIRMWARE_UPD_START
      },
      { isSupport8100: false,
        isSupport8100X: false,
        isSupport7550Zippy: false
      })).toBe('Custom')

    })
  })

})

describe('Test createSwitchSerialPattern function', () => {
  it('support all models', async () => {
    const supportModels = {
      isSupport8100: true,
      isSupport8100X: true,
      isSupport7550Zippy: true
    }

    const patten = createSwitchSerialPattern(supportModels)
    expect(patten.test('FEA3237U209')).toBe(true) //ICX7150
    expect(patten.test('EZC3319R006')).toBe(true) //ICX7650
    expect(patten.test('FNC4352S01D')).toBe(true) //ICX8200
    expect(patten.test('FPG4324V00H')).toBe(true) //ICX8200-AV
    expect(patten.test('FNX4830V014')).toBe(true) //ICX8100
    expect(patten.test('FPQ4828V00X')).toBe(true) //ICX8100-X
    expect(patten.test('FPH4439V00X')).toBe(true) //ICX7550 Zippy
  })

  it('support specific 8100 model', async () => {
    const patten = createSwitchSerialPatternForSpecific8100Model()
    expect(patten.test('FNX4898W00Z')).toBe(true)
    expect(patten.test('FNX4808W00Z')).toBe(true)
    expect(patten.test('FNY4898W0LP')).toBe(true)
    expect(patten.test('FNY4833W0LP')).toBe(true)
    expect(patten.test('FNZ4898W0F7')).toBe(true)
    expect(patten.test('FPA4898W00E')).toBe(true)

    expect(patten.test('FNX4888W00Z')).toBe(false)
    expect(patten.test('FNY4896W0LP')).toBe(false)
    expect(patten.test('FNZ4897W0F7')).toBe(false)
    expect(patten.test('FPA4899W00E')).toBe(false)
  })

  it('ICX8100 not supported', async () => {
    const supportModels = {
      isSupport8100: false,
      isSupport8100X: true,
      isSupport7550Zippy: true
    }
    const patten = createSwitchSerialPattern(supportModels)

    expect(patten.test('FEA3237U209')).toBe(true) //ICX7150
    expect(patten.test('EZC3319R006')).toBe(true) //ICX7650
    expect(patten.test('FNC4352S01D')).toBe(true) //ICX8200
    expect(patten.test('FPG4324V00H')).toBe(true) //ICX8200-AV
    expect(patten.test('FPQ4828V00X')).toBe(true) //ICX8100-X
    expect(patten.test('FPH4439V00X')).toBe(true) //ICX7550 Zippy

    expect(patten.test('FNX4830V014')).toBe(false) //ICX8100
  })

  it('ICX8100-X not supported', async () => {
    const supportModels = {
      isSupport8100: true,
      isSupport8100X: false,
      isSupport7550Zippy: true
    }
    const patten = createSwitchSerialPattern(supportModels)

    expect(patten.test('FEA3237U209')).toBe(true) //ICX7150
    expect(patten.test('EZC3319R006')).toBe(true) //ICX7650
    expect(patten.test('FNC4352S01D')).toBe(true) //ICX8200
    expect(patten.test('FPG4324V00H')).toBe(true) //ICX8200-AV
    expect(patten.test('FNX4830V014')).toBe(true) //ICX8100
    expect(patten.test('FPH4439V00X')).toBe(true) //ICX7550 Zippy

    expect(patten.test('FPQ4828V00X')).toBe(false) //ICX8100-X
  })

  it('ICX8100 and ICX8100-X not supported', async () => {
    const supportModels = {
      isSupport8100: false,
      isSupport8100X: false,
      isSupport7550Zippy: true
    }
    const patten = createSwitchSerialPattern(supportModels)

    expect(patten.test('FEA3237U209')).toBe(true) //ICX7150
    expect(patten.test('EZC3319R006')).toBe(true) //ICX7650
    expect(patten.test('FNC4352S01D')).toBe(true) //ICX8200
    expect(patten.test('FPG4324V00H')).toBe(true) //ICX8200-AV
    expect(patten.test('FPH4439V00X')).toBe(true) //ICX7550 Zippy

    expect(patten.test('FPQ4828V00X')).toBe(false) //ICX8100-X
    expect(patten.test('FNX4830V014')).toBe(false) //ICX8100
  })

  it('ICX7550 Zippy not supported', async () => {
    const supportModels = {
      isSupport8100: true,
      isSupport8100X: true,
      isSupport7550Zippy: false
    }
    const patten = createSwitchSerialPattern(supportModels)

    expect(patten.test('FEA3237U209')).toBe(true) //ICX7150
    expect(patten.test('EZC3319R006')).toBe(true) //ICX7650
    expect(patten.test('FNC4352S01D')).toBe(true) //ICX8200
    expect(patten.test('FPG4324V00H')).toBe(true) //ICX8200-AV
    expect(patten.test('FPQ4828V00X')).toBe(true) //ICX8100-X
    expect(patten.test('FNX4830V014')).toBe(true) //ICX8100

    expect(patten.test('FPH4439V00X')).toBe(false) //ICX7550 Zippy
  })
})
