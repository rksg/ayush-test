/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { Input } from 'antd'

import { DeviceConnectionStatus }                                                         from '../../constants'
import { STACK_MEMBERSHIP, SwitchStatusEnum, SwitchViewModel, SwitchClient, SWITCH_TYPE } from '../../types'

import {
  isOperationalSwitch,
  getSwitchModel,
  getSwitchName,
  isStrictOperationalSwitch,
  transformSwitchStatus,
  getSwitchStatusString,
  getPoeUsage,
  getStackMemberStatus,
  getClientIpAddr,
  getAdminPassword,
  transformSwitchUnitStatus,
  isRouter,
  isEmpty,
  getSwitchPortLabel,
  sortPortFunction,
  isSameModelFamily,
  convertInputToUppercase,
  isL3FunctionSupported,
  isFirmwareVersionAbove10,
  isFirmwareSupportAdminPassword,
  isFirmwareVersionAbove10010f,
  isFirmwareVersionAbove10020b,
  isFirmwareVersionAbove10010g2Or10020b,
  vlanPortsParser
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
  describe('Test isOperationalSwitch function', () => {
    it('should render correctly', async () => {
      expect(isOperationalSwitch(SwitchStatusEnum.OPERATIONAL, false)).toBe(false)
      expect(isOperationalSwitch(SwitchStatusEnum.OPERATIONAL, true)).toBe(true)
      expect(isOperationalSwitch(SwitchStatusEnum.DISCONNECTED, false)).toBe(false)
    })
  })
  describe('Test getSwitchModel function', () => {
    it('should render correctly', async () => {
      expect(getSwitchModel('FJN4312T00C')).toBe('ICX7150-48ZP')
      expect(getSwitchModel('EZC4312T00C')).toBe('ICX7650-48ZP')
      expect(getSwitchModel('')).toBe('Unknown')
    })
    it('should check model family correctly', async () => {
      expect(isSameModelFamily('', '')).toBe(true)
      expect(isSameModelFamily('xxxx', '----')).toBe(true)
      expect(isSameModelFamily('FEK3230S0DA', 'FEK3230S3DA')).toBe(true)
      expect(isSameModelFamily('FJN3226U73C', 'FNC3333R015')).toBe(false)
    })
  })

  describe('Test isStrictOperationalSwitch function', () => {
    it('should render correctly', async () => {
      expect(isStrictOperationalSwitch(SwitchStatusEnum.OPERATIONAL, true, true)).toBeTruthy()
    })
  })

  describe('Test isRouter function', () => {
    it('should render correctly', async () => {
      expect(isRouter(SWITCH_TYPE.ROUTER)).toBeTruthy()
    })
  })

  describe('Test isEmpty function', () => {
    it('should render correctly', async () => {
      expect(isEmpty(null)).toBeTruthy()
      expect(isEmpty(undefined)).toBeTruthy()
      expect(isEmpty('undefined')).toBeTruthy()
      expect(isEmpty('')).toBeTruthy()
      expect(isEmpty(1)).toBeFalsy()
    })
  })

  describe('Test getSwitchPortLabel function', () => {
    it('should render correctly', async () => {
      expect(getSwitchPortLabel('ICX7150-C12P', 1)).toEqual('')
    })
  })

  describe('Test sortPortFunction function', () => {
    it('should render correctly', async () => {
      expect([{ id: '1/1/10' }, { id: '1/1/2' }].sort(sortPortFunction))
        .toStrictEqual([{ id: '1/1/2' }, { id: '1/1/10' }])
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

  describe('Test getSwitchName function', () => {
    it('should render correctly', async () => {
      expect(getSwitchName(switchRow)).toBe('FMF2249Q0JT')
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

  describe('Test getPoeUsage function', () => {
    it('should render correctly', async () => {
      const switchDetail_1 = {
        model: 'ICX7150-C08P',
        id: 'FMF2249Q0JT'
      }
      const switchDetail_2 = {
        model: 'ICX7150-C08P',
        id: 'FMF2249Q0JT',
        poeTotal: 2000,
        poeUtilization: 1000
      }
      expect(getPoeUsage(switchDetail_1 as SwitchViewModel)).toStrictEqual({
        used: 0,
        total: 0,
        percentage: '0%'
      })
      expect(getPoeUsage(switchDetail_2 as unknown as SwitchViewModel)).toStrictEqual({
        used: 1,
        total: 2,
        percentage: '50%'
      })
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
      { isSupport8200AV: false,
        isSupport8100: false,
        isSupport8100X: false
      })).toBe('--')

      expect(getAdminPassword({
        ...switchRow,
        configReady: true,
        syncedSwitchConfig: true,
        deviceStatus: SwitchStatusEnum.FIRMWARE_UPD_START
      },
      { isSupport8200AV: false,
        isSupport8100: false,
        isSupport8100X: false
      })).toBe('--')

      expect(getAdminPassword({
        ...switchRow,
        configReady: false,
        syncedSwitchConfig: true,
        deviceStatus: SwitchStatusEnum.NEVER_CONTACTED_CLOUD
      },
      { isSupport8200AV: false,
        isSupport8100: false,
        isSupport8100X: false
      })).toBe('--')

      expect(getAdminPassword({
        ...switchRow,
        id: 'c0:c5:20:aa:24:7b',
        configReady: true,
        syncedSwitchConfig: true,
        deviceStatus: SwitchStatusEnum.OPERATIONAL
      },
      { isSupport8200AV: false,
        isSupport8100: false,
        isSupport8100X: false
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
      { isSupport8200AV: false,
        isSupport8100: false,
        isSupport8100X: false
      }, Input.Password)).not.toBe('Custom')

      expect(getAdminPassword({
        ...switchRow,
        id: 'c0:c5:20:aa:24:7b',
        configReady: true,
        syncedSwitchConfig: true,
        deviceStatus: SwitchStatusEnum.DISCONNECTED
      },
      { isSupport8200AV: false,
        isSupport8100: false,
        isSupport8100X: false
      })).toBe('Custom')

      expect(getAdminPassword({
        ...switchRow,
        id: 'c0:c5:20:aa:24:7b',
        configReady: true,
        syncedSwitchConfig: true,
        deviceStatus: SwitchStatusEnum.FIRMWARE_UPD_START
      },
      { isSupport8200AV: false,
        isSupport8100: false,
        isSupport8100X: false
      })).toBe('Custom')

    })
  })

  describe('Test isFirmwareVersionAbove10 function', () => {
    it('should render correctly', async () => {
      expect(isFirmwareVersionAbove10('SPR09010j_cd1')).toBe(false)
      expect(isFirmwareVersionAbove10('SPR09010j_cd2')).toBe(false)
      expect(isFirmwareVersionAbove10('SPR09010f')).toBe(false)

      expect(isFirmwareVersionAbove10('SPR10020_rc35')).toBe(true)
      expect(isFirmwareVersionAbove10('SPR10010c_cd1')).toBe(true)
      expect(isFirmwareVersionAbove10('SPR10010c_cd2_b4')).toBe(true)
      expect(isFirmwareVersionAbove10('SPR10010b_rc88')).toBe(true)
    })
  })

  describe('Test isFirmwareSupportAdminPassword function', () => {
    it('should render correctly', async () => {
      expect(isFirmwareSupportAdminPassword('SPR09010j_cd1')).toBe(true)
      expect(isFirmwareSupportAdminPassword('SPR09010j_cd2')).toBe(true)
      expect(isFirmwareSupportAdminPassword('SPR09010f')).toBe(false)

      expect(isFirmwareSupportAdminPassword('SPR10020_rc35')).toBe(true)
      expect(isFirmwareSupportAdminPassword('SPR10010c_cd1')).toBe(true)
      expect(isFirmwareSupportAdminPassword('SPR10010c_cd2_b4')).toBe(true)
      expect(isFirmwareSupportAdminPassword('SPR10010b_rc88')).toBe(false)
    })
  })

  describe('Test convertInputToUppercase function', () => {
    it('should render correctly', async () => {
      const inputElement = document.createElement('input')
      inputElement.value = 'fek3224r0ag'
      const mockEvent = {
        target: inputElement
      } as React.ChangeEvent<HTMLInputElement>
      convertInputToUppercase(mockEvent)
      expect(inputElement.value).toBe('FEK3224R0AG')
    })
  })

  describe('Test isL3FunctionSupported function', () => {
    it('returns false for undefined switchType', () => {
      const result = isL3FunctionSupported(undefined)
      expect(result).toBe(false)
    })

    it('returns false for empty string switchType', () => {
      const result = isL3FunctionSupported('')
      expect(result).toBe(false)
    })

    it('returns true for ROUTER switchType', () => {
      const result = isL3FunctionSupported(SWITCH_TYPE.ROUTER)
      expect(result).toBe(true)
    })

    it('returns treu for SWITCH switchType', () => {
      const result = isL3FunctionSupported(SWITCH_TYPE.SWITCH)
      expect(result).toBe(false)
    })
  })
})

describe('Test isFirmwareVersionAbove10010f function', () => {
  it('should render correctly', async () => {
    expect(isFirmwareVersionAbove10010f('SPR09010f')).toBe(false)
    expect(isFirmwareVersionAbove10010f('SPR10010c_cd1')).toBe(false)
    expect(isFirmwareVersionAbove10010f('SPR10020_rc35')).toBe(false)
    expect(isFirmwareVersionAbove10010f('SPR10020a_rc35')).toBe(false)

    expect(isFirmwareVersionAbove10010f('10010f_b467')).toBe(true)
    expect(isFirmwareVersionAbove10010f('SPR10010f_b467')).toBe(true)
    expect(isFirmwareVersionAbove10010f('SPR10020b_rc35')).toBe(true)
  })
})

describe('Test isFirmwareVersionAbove10020b function', () => {
  it('should render correctly', async () => {
    expect(isFirmwareVersionAbove10020b('SPR09010f')).toBe(false)
    expect(isFirmwareVersionAbove10020b('SPR10010c_cd1')).toBe(false)
    expect(isFirmwareVersionAbove10020b('SPR10020_rc35')).toBe(false)
    expect(isFirmwareVersionAbove10020b('SPR10020a_rc35')).toBe(false)

    expect(isFirmwareVersionAbove10020b('10010f_b467')).toBe(false)
    expect(isFirmwareVersionAbove10020b('SPR10010f_b467')).toBe(false)
    expect(isFirmwareVersionAbove10020b('SPR10020b_rc35')).toBe(true)
    expect(isFirmwareVersionAbove10020b('TNR10020b_b205')).toBe(true)
    expect(isFirmwareVersionAbove10020b('TNR10020b_cd1')).toBe(true)
  })
})

describe('Test isFirmwareVersionAbove10010g2Or10020b function', () => {
  it('should render correctly', async () => {
    expect(isFirmwareVersionAbove10010g2Or10020b('SPR09010f')).toBe(false)
    expect(isFirmwareVersionAbove10010g2Or10020b('SPR10010c_cd1')).toBe(false)
    expect(isFirmwareVersionAbove10010g2Or10020b('SPR10020_rc35')).toBe(false)
    expect(isFirmwareVersionAbove10010g2Or10020b('SPR10020a_rc35')).toBe(false)
    expect(isFirmwareVersionAbove10010g2Or10020b('TNR10010f_b467')).toBe(false)
    expect(isFirmwareVersionAbove10010g2Or10020b('TNR10010f_cd1_rc11')).toBe(false)
    expect(isFirmwareVersionAbove10010g2Or10020b('TNR10010f_cd2')).toBe(false)

    expect(isFirmwareVersionAbove10010g2Or10020b('TNR10010g_rc50')).toBe(true)
    expect(isFirmwareVersionAbove10010g2Or10020b('SPR10020b_rc35')).toBe(true)
    expect(isFirmwareVersionAbove10010g2Or10020b('TNR10020b_b205')).toBe(true)
    expect(isFirmwareVersionAbove10010g2Or10020b('TNR10020b_cd1')).toBe(true)
  })
})

describe('Test vlanPortsParser function', () => {
  it('should render correctly', async () => {
    const vlans = '22 66 24 68 26 70 60 62 64'
    const maxRangesToShow = 5
    const title = 'Tagged VLANs'
    expect(vlanPortsParser(vlans, maxRangesToShow, title)).toBe('22, 24, 26, 60, 62, and 4 Tagged VLANs more...')
  })
})