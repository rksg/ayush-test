import {
  checkVersionAtLeast10010b,
  checkVersionAtLeast10010c,
  checkVersionAtLeast09010h,
  compareSwitchVersion,
  convertSwitchVersionFormat,
  getStackUnitsMinLimitationV1002,
  getSwitchModelGroup,
  isVerGEVer,
  invalidVersionFor82Av,
  invalidVersionFor81X,
  invalidVersionFor75Zippy,
  versionAbove10020a
} from './switch.firmware.utils'

describe('switch.firmware.utils', () => {
  it('should compare switch versions', () => {
    expect(compareSwitchVersion('09010e', '09010f_b5') < 0).toBe(true)
    expect(compareSwitchVersion('09010e_b5', '09010e_b392') < 0).toBe(true)
    expect(compareSwitchVersion('', '') === 0).toBe(true)

    // compare rc with others
    expect(compareSwitchVersion('10010_rc2', '10010_rc3')).toBe(-1)
    expect(compareSwitchVersion('10010_rc2', '10010_b3')).toBe(1)
    expect(compareSwitchVersion('10010_rc2', '10010e')).toBe(-1)
    expect(compareSwitchVersion('10010_rc2', '10010_cd2')).toBe(-1)
    expect(compareSwitchVersion('10010_rc2', 'RDR10010')).toBe(0)

    expect(compareSwitchVersion('10010_cd2', '10010_b10')).toBe(1)
    expect(compareSwitchVersion('10010_cd2_b11', '10010_cd3_b10')).toBe(-1)
    expect(compareSwitchVersion('10010_cd3_b11', '10010_cd3')).toBe(-1)
    expect(compareSwitchVersion('10010_cd3_b11', '10010_cd3_b22')).toBe(-1)

    // copy form VersionUtilTest.java
    expect(compareSwitchVersion('10010a_b3', '10010a_cd1_b3')).toBe(-1)
    expect(compareSwitchVersion('10010b_b36', '10010a_cd1_b3')).toBe(1)
    expect(compareSwitchVersion('10010b_b36', '10010b_cd1')).toBe(-1)

    expect(compareSwitchVersion('10010b_b36', '9010')).toBe(1)
    expect(compareSwitchVersion('09010f_b19', '10010a')).toBe(-1)
    expect(compareSwitchVersion('10010b_b36', '10010a')).toBe(1)
    expect(compareSwitchVersion('10010b_b36', '10000')).toBe(1)

    expect(compareSwitchVersion('09010h_rc80', '9010h')).toBe(0)
    expect(compareSwitchVersion('09010h_rc80', '9010i')).toBe(-1)
    expect(compareSwitchVersion('09010h_rc80', '09010h_b28')).toBe(1)
    expect(compareSwitchVersion('09010h_rc80', '09010h_rc3')).toBe(1)
    expect(compareSwitchVersion('09010h_rc80', '09010h_rc200')).toBe(-1)
    expect(compareSwitchVersion('09010h_b333', '09010h_b28')).toBe(1)
    expect(compareSwitchVersion('09010h_rc80', '09010h_cd1_b2')).toBe(-1)
    expect(compareSwitchVersion('09010h_cd1_rc80', '09010h_cd1_b2')).toBe(1)

    expect(compareSwitchVersion('SPR09010j_cd1', '09010h_cd1_b2')).toBe(1)
    expect(compareSwitchVersion('SPR09010j_cd1.bin', '09010h_cd1_b2')).toBe(1)
  })

  it('should check version', () => {
    expect(isVerGEVer('SPR09010f_b28.bin', '09010f_b401', true)).toBe(false)
    expect(isVerGEVer('TNR09010f.bin', '09010f_b19', true)).toBe(true)
    expect(isVerGEVer('09010e_b392.bin', '09010f_b19', true)).toBe(false)
    expect(isVerGEVer('10.0.10f', '9.0.10h', true)).toBe(true)
    expect(isVerGEVer('RDR10010.bin', '10010_rc2', true)).toBe(true)
    expect(isVerGEVer('RDR10010a.bin', '10010b_b36', true)).toBe(false)
    expect(isVerGEVer('RDR10010a.bin', '10010a_cd1_b3', true)).toBe(false)
    expect(isVerGEVer('10010a_b3', '10010a_cd1_b3', true)).toBe(false)
    expect(isVerGEVer('10010b_b36', '10010a_cd1_b3', true)).toBe(true)
    expect(isVerGEVer('10010b_b36', '10010b_cd1', true)).toBe(false)

    expect(isVerGEVer('10010b_b36', '9010', false)).toBe(true)
    expect(isVerGEVer('09010f_b19', '10010a', false)).toBe(false)
    expect(isVerGEVer('10010b_b36', '10010a', false)).toBe(true)
    expect(isVerGEVer('10010b_b36', '10000', false)).toBe(true)

    expect(isVerGEVer('SPS09010f.bin', '9010', true)).toBe(true)
    expect(isVerGEVer('SPS09010f.bin', '9010h', false)).toBe(false)
    expect(isVerGEVer('SPR09010h.bin', '9010h', false)).toBe(true)
    expect(isVerGEVer('SPR09010h.bin', '10000', false)).toBe(false)
    expect(isVerGEVer('RDR10010a.bin', '9010h', true)).toBe(true)

    expect(isVerGEVer('09010h_rc80', '9010h', true)).toBe(true)
    expect(isVerGEVer('09010h_rc80', '9010i', true)).toBe(false)
    expect(isVerGEVer('09010h_rc80', '09010h_b28', true)).toBe(true)
    expect(isVerGEVer('09010h_rc80', '09010h_rc3', true)).toBe(true)
    expect(isVerGEVer('09010h_b28', '09010h_rc80', true)).toBe(false)
    expect(isVerGEVer('09010h_rc200', '09010h_rc80', true)).toBe(true)
    expect(isVerGEVer('09010h_b333', '09010h_b28', true)).toBe(true)
    expect(isVerGEVer('09010h_rc80', '09010h_cd1_b2', true)).toBe(false)
    expect(isVerGEVer('09010h_cd1_rc80', '09010h_cd1_b2', true)).toBe(true)
    expect(isVerGEVer('10010f_b467', '10010f', false)).toBe(true)
    expect(isVerGEVer('SPR10010f_b467', '10010f', false)).toBe(true)
    expect(isVerGEVer('10010f_b467', '10020', false)).toBe(false)
    expect(isVerGEVer('SPR10010f_b467', '10020', false)).toBe(false)
  })

  it('should check unsupported versions of ICX8200AV switch', () => {
    expect(invalidVersionFor82Av('')).toBe(false)
    expect(invalidVersionFor82Av('09010h_cd1_rc80')).toBe(true)
    expect(invalidVersionFor82Av('10010b_b36')).toBe(true)
    expect(invalidVersionFor82Av('10020a_cd1_rc22')).toBe(true)


    expect(invalidVersionFor82Av('10010f_b467')).toBe(false)
    expect(invalidVersionFor82Av('10010f_cd1_rc11')).toBe(false)
    expect(invalidVersionFor82Av('10020b_cd2')).toBe(false)
    expect(invalidVersionFor82Av('10020c_cd2_rc11')).toBe(false)
  })

  it('should check unsupported versions of ICX8100X switch', () => {
    expect(invalidVersionFor81X('')).toBe(false)
    expect(invalidVersionFor81X('09010h_cd1_rc80')).toBe(true)
    expect(invalidVersionFor81X('10010b_b36')).toBe(true)
    expect(invalidVersionFor81X('10010f_cd2')).toBe(true)
    expect(invalidVersionFor81X('10020a_cd1_rc22')).toBe(true)
    expect(invalidVersionFor81X('10020b_cd2')).toBe(true)
    expect(invalidVersionFor81X('10010g_b123')).toBe(true)
    expect(invalidVersionFor81X('10010g_rc641')).toBe(true)

    expect(invalidVersionFor81X('10010g_cd1_rc13')).toBe(false)
    expect(invalidVersionFor81X('10020c_cd2_rc11')).toBe(false)
  })

  it('should check unsupported versions of ICX7550 Zippy switch', () => {
    expect(invalidVersionFor75Zippy('')).toBe(false)
    expect(invalidVersionFor75Zippy('09010h_cd1_rc80')).toBe(true)
    expect(invalidVersionFor75Zippy('10010b_b36')).toBe(true)
    expect(invalidVersionFor75Zippy('10010f_cd2')).toBe(true)
    expect(invalidVersionFor75Zippy('10010g_b123')).toBe(true)
    expect(invalidVersionFor75Zippy('10020_rc55')).toBe(true)
    expect(invalidVersionFor75Zippy('10020b_b555')).toBe(true)

    expect(invalidVersionFor75Zippy('10020b_cd1_rc11')).toBe(false)
    expect(invalidVersionFor75Zippy('10020c_cd2_rc11')).toBe(false)
  })

  it('should check that the firmware version is at least 9010h', () => {
    expect(checkVersionAtLeast09010h('10010b_b37')).toBe(true)
    expect(checkVersionAtLeast09010h('09010h_cd2_b4')).toBe(true)
    expect(checkVersionAtLeast09010h('09010f_b401')).toBe(false)
  })

  it('should check that the firmware version is at least 10020a', () => {
    expect(versionAbove10020a('10020a_cd1_rc22')).toBe(true)
    expect(versionAbove10020a('10010b_b37')).toBe(false)
  })

  it('should check that the firmware version is at least 10010b', () => {
    expect(checkVersionAtLeast10010b('10010f_cd2')).toBe(true)
    expect(checkVersionAtLeast10010b('10010b_b37')).toBe(true)
    expect(checkVersionAtLeast10010b('10010a_b3')).toBe(false)
  })

  it('should check that the firmware version is at least 10010c', () => {
    expect(checkVersionAtLeast10010c('10010f_cd2')).toBe(true)
    expect(checkVersionAtLeast10010c('10010c_cd3_rc36')).toBe(true)
    expect(checkVersionAtLeast10010c('10010b_b37')).toBe(false)
    expect(checkVersionAtLeast10010c('10010a_b3')).toBe(false)
  })

  it('should get the minimum limitation of stack units correctly', () => {
    expect(getStackUnitsMinLimitationV1002('ICX7150-C12P', '09010h_cd2_b4')).toBe(4)
    expect(getStackUnitsMinLimitationV1002('ICX7150-C12P', '09010f_b401')).toBe(2)
    expect(getStackUnitsMinLimitationV1002('ICX8200-24P', '10010b_b37')).toBe(12)
    expect(getStackUnitsMinLimitationV1002('ICX8200-24P', '10010a_b3')).toBe(4)
    expect(getStackUnitsMinLimitationV1002('ICX7550-48', '10010f_cd2')).toBe(12)
    expect(getStackUnitsMinLimitationV1002('ICX7650-48ZP', '10010a_b3')).toBe(8)
    expect(getStackUnitsMinLimitationV1002('ICX7850-48FS', '09010f_b401')).toBe(4)
    expect(getStackUnitsMinLimitationV1002('ICX7150-C12P', '10010g_cd1')).toBe(8)
  })

  it('should convert switch version format correctly', () => {
    expect(convertSwitchVersionFormat('09010h_cd2')).toBe('9.0.10h_cd2')
    expect(convertSwitchVersionFormat('10020a_cd1')).toBe('10.0.20a_cd1')
    expect(convertSwitchVersionFormat('10010f_cd2')).toBe('10.0.10f_cd2')
    expect(convertSwitchVersionFormat('100_10f_cd2')).toBe('100_10f_cd2')
  })

  it('should get switch model group correctly', () => {
    expect(getSwitchModelGroup('ICX7150-C12P')).toBe('ICX71')
    expect(getSwitchModelGroup('ICX7450-32P')).toBe('ICX7X')
    expect(getSwitchModelGroup('ICX7550-48')).toBe('ICX7X')
    expect(getSwitchModelGroup('ICX7650-48ZP')).toBe('ICX7X')
    expect(getSwitchModelGroup('ICX8100-48-X')).toBe('ICX81')
    expect(getSwitchModelGroup('ICX8200-24P')).toBe('ICX82')
  })

})

