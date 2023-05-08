/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { DeviceConnectionStatus }                                           from '../../constants'
import { STACK_MEMBERSHIP, SwitchStatusEnum, SwitchViewModel, SWITCH_TYPE } from '../../types'

import {
  isOperationalSwitch,
  getSwitchModel,
  getSwitchName,
  isStrictOperationalSwitch,
  transformSwitchStatus,
  getSwitchStatusString,
  getPoeUsage,
  getStackMemberStatus,
  transformSwitchUnitStatus,
  isRouter,
  isEmpty,
  getSwitchPortLabel,
  sortPortFunction
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
      expect(getStackMemberStatus('', true)).toBe('Member')
      expect(getStackMemberStatus('')).toBeFalsy()
    })
  })

})
