import { compareSwitchVersion } from './switch.firmware.utils'


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
  })


})
