import {
  compareSwitchVersion,
  isVerGEVer,
  invalidVersionFor82Av,
  invalidVersionFor81X,
  invalidVersionFor75Zippy
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
    expect(invalidVersionFor82Av('09010h_cd1_rc80')).toBe(true)
    expect(invalidVersionFor82Av('10010b_b36')).toBe(true)
    expect(invalidVersionFor82Av('10020a_cd1_rc22')).toBe(true)


    expect(invalidVersionFor82Av('10010f_b467')).toBe(false)
    expect(invalidVersionFor82Av('10010f_cd1_rc11')).toBe(false)
    expect(invalidVersionFor82Av('10020b_cd2')).toBe(false)
    expect(invalidVersionFor82Av('10020c_cd2_rc11')).toBe(false)
  })

  it('should check unsupported versions of ICX8100X switch', () => {
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
    expect(invalidVersionFor75Zippy('09010h_cd1_rc80')).toBe(true)
    expect(invalidVersionFor75Zippy('10010b_b36')).toBe(true)
    expect(invalidVersionFor75Zippy('10010f_cd2')).toBe(true)
    expect(invalidVersionFor75Zippy('10010g_b123')).toBe(true)
    expect(invalidVersionFor75Zippy('10020_rc55')).toBe(true)
    expect(invalidVersionFor75Zippy('10020b_b555')).toBe(true)

    expect(invalidVersionFor75Zippy('10020b_cd1_rc11')).toBe(false)
    expect(invalidVersionFor75Zippy('10020c_cd2_rc11')).toBe(false)
  })
})
