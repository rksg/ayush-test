/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { macAclRulesParser }                                          from './switch.utils'
import { SwitchStatusEnum, SwitchViewModel, SWITCH_TYPE, MacAclRule } from './types'

import {
  isOperationalSwitch,
  getSwitchModel,
  getSwitchName,
  isStrictOperationalSwitch,
  getPoeUsage,
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
  isFirmwareVersionAbove10010gOr10020b,
  isFirmwareVersionAbove10010gCd1Or10020bCd1,
  vlanPortsParser,
  getFamilyAndModel,
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

  describe('Test getSwitchName function', () => {
    it('should render correctly', async () => {
      expect(getSwitchName(switchRow)).toBe('FMF2249Q0JT')
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

describe('Test isFirmwareVersionAbove10010gOr10020b function', () => {
  it('should render correctly', async () => {
    expect(isFirmwareVersionAbove10010gOr10020b('SPR09010f')).toBe(false)
    expect(isFirmwareVersionAbove10010gOr10020b('SPR10010c_cd1')).toBe(false)
    expect(isFirmwareVersionAbove10010gOr10020b('SPR10020_rc35')).toBe(false)
    expect(isFirmwareVersionAbove10010gOr10020b('SPR10020a_rc35')).toBe(false)
    expect(isFirmwareVersionAbove10010gOr10020b('TNR10010f_b467')).toBe(false)
    expect(isFirmwareVersionAbove10010gOr10020b('TNR10010f_cd1_rc11')).toBe(false)
    expect(isFirmwareVersionAbove10010gOr10020b('TNR10010f_cd2')).toBe(false)

    expect(isFirmwareVersionAbove10010gOr10020b('TNR10010g_rc50')).toBe(true)
    expect(isFirmwareVersionAbove10010gOr10020b('SPR10020b_rc35')).toBe(true)
    expect(isFirmwareVersionAbove10010gOr10020b('TNR10020b_b205')).toBe(true)
    expect(isFirmwareVersionAbove10010gOr10020b('TNR10020b_cd1')).toBe(true)
  })
})

describe('Test isFirmwareVersionAbove10010gCd1Or10020bCd1 function', () => {
  it('should render correctly', async () => {
    expect(isFirmwareVersionAbove10010gCd1Or10020bCd1('SPR09010f')).toBe(false)
    expect(isFirmwareVersionAbove10010gCd1Or10020bCd1('SPR10010c_cd1')).toBe(false)
    expect(isFirmwareVersionAbove10010gCd1Or10020bCd1('SPR10020_rc35')).toBe(false)
    expect(isFirmwareVersionAbove10010gCd1Or10020bCd1('SPR10020a_rc35')).toBe(false)
    expect(isFirmwareVersionAbove10010gCd1Or10020bCd1('TNR10010f_b467')).toBe(false)
    expect(isFirmwareVersionAbove10010gCd1Or10020bCd1('TNR10010f_cd1_rc11')).toBe(false)
    expect(isFirmwareVersionAbove10010gCd1Or10020bCd1('TNR10010f_cd2')).toBe(false)
    expect(isFirmwareVersionAbove10010gCd1Or10020bCd1('TNR10010g')).toBe(false)
    expect(isFirmwareVersionAbove10010gCd1Or10020bCd1('TNR10010g_rc50')).toBe(false)
    expect(isFirmwareVersionAbove10010gCd1Or10020bCd1('SPR10020b_rc35')).toBe(false)
    expect(isFirmwareVersionAbove10010gCd1Or10020bCd1('TNR10020b_b205')).toBe(false)

    expect(isFirmwareVersionAbove10010gCd1Or10020bCd1('TNR10010g_cd1')).toBe(true)
    expect(isFirmwareVersionAbove10010gCd1Or10020bCd1('TNR10020b_cd1')).toBe(true)
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

describe('Test createSwitchSerialPattern function', () => {
  it('support all models', async () => {
    const supportModels = {
      isSupport8200AV: true,
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

  it('ICX8200-AV not supported', async () => {
    const supportModels = {
      isSupport8200AV: false,
      isSupport8100: true,
      isSupport8100X: true,
      isSupport7550Zippy: true
    }
    const patten = createSwitchSerialPattern(supportModels)

    expect(patten.test('FEA3237U209')).toBe(true) //ICX7150
    expect(patten.test('EZC3319R006')).toBe(true) //ICX7650
    expect(patten.test('FNC4352S01D')).toBe(true) //ICX8200
    expect(patten.test('FNX4830V014')).toBe(true) //ICX8100
    expect(patten.test('FPQ4828V00X')).toBe(true) //ICX8100-X
    expect(patten.test('FPH4439V00X')).toBe(true) //ICX7550 Zippy

    expect(patten.test('FPG4324V00H')).toBe(false) //ICX8200-AV
  })

  it('ICX8100 not supported', async () => {
    const supportModels = {
      isSupport8200AV: true,
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
      isSupport8200AV: true,
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
      isSupport8200AV: true,
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
      isSupport8200AV: true,
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

describe('Test getFamilyAndModel function', () => {
  it('should render correctly', async () => {
    expect(getFamilyAndModel('ICX7150-24P')).toEqual(['ICX7150', '24P'])
    expect(getFamilyAndModel('ICX7550-48ZP')).toEqual(['ICX7550', '48ZP'])
    expect(getFamilyAndModel('ICX7550-24XZP')).toEqual(['ICX7550', '24XZP'])
    expect(getFamilyAndModel('ICX7650-48P')).toEqual(['ICX7650', '48P'])
    expect(getFamilyAndModel('ICX8100-24P')).toEqual(['ICX8100', '24P'])
    expect(getFamilyAndModel('ICX8100-24P-X')).toEqual(['ICX8100', '24P-X'])
    expect(getFamilyAndModel('ICX8100-48-X')).toEqual(['ICX8100', '48-X'])
    expect(getFamilyAndModel('ICX8200-48PF2')).toEqual(['ICX8200', '48PF2'])
    expect(getFamilyAndModel('ICX8200-24PV')).toEqual(['ICX8200', '24PV'])
  })
})

describe('macAclRulesParser', () => {
  it('should return zero counts when no rules are provided', () => {
    const result = macAclRulesParser([])
    expect(result).toEqual({ permit: 0, deny: 0 })
  })

  it('should return zero counts when rules is undefined', () => {
    const result = macAclRulesParser(undefined as unknown as MacAclRule[])
    expect(result).toEqual({ permit: 0, deny: 0 })
  })

  it('should count permit rules correctly', () => {
    const rules: MacAclRule[] = [
      { id: '1', action: 'permit', sourceAddress: '00:11:22:33:44:55' },
      { id: '2', action: 'permit', sourceAddress: '66:77:88:99:AA:BB' }
    ]

    const result = macAclRulesParser(rules)
    expect(result).toEqual({ permit: 2, deny: 0 })
  })

  it('should count deny rules correctly', () => {
    const rules: MacAclRule[] = [
      { id: '1', action: 'deny', sourceAddress: '00:11:22:33:44:55' },
      { id: '2', action: 'deny', sourceAddress: '66:77:88:99:AA:BB' }
    ]

    const result = macAclRulesParser(rules)
    expect(result).toEqual({ permit: 0, deny: 2 })
  })

  it('should count mixed permit and deny rules correctly', () => {
    const rules: MacAclRule[] = [
      { id: '1', action: 'permit', sourceAddress: '00:11:22:33:44:55' },
      { id: '2', action: 'deny', sourceAddress: '66:77:88:99:AA:BB' },
      { id: '3', action: 'permit', sourceAddress: 'CC:DD:EE:FF:00:11' },
      { id: '4', action: 'deny', sourceAddress: '22:33:44:55:66:77' }
    ]

    const result = macAclRulesParser(rules)
    expect(result).toEqual({ permit: 2, deny: 2 })
  })
})
