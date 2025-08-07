/* eslint-disable max-len */
import { IpSecRekeyTimeUnitEnum } from '../../models/IpSecEnum'

import { getRekeyTimeUnitOptions, ipSecPskValidator } from './ipSecUtils'

describe('ipSecPskValidator', () => {
  const errMsg = 'The pre-shared key must contain 44 ~ 128 HEX characters or 8 ~ 64 ASCII characters, including characters from space (char 32) to ~(char 126) except " or ` or $(, or Base64 characters.'

  it('should validate HEX input with valid length', async () => {
    const value = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    await expect(ipSecPskValidator(value)).resolves.toEqual(undefined)
  })

  it('should reject HEX input with invalid length', async () => {
    const value = '0x123'
    await expect(ipSecPskValidator(value)).rejects.toEqual(errMsg)
  })

  it('should reject base64 input', async () => {
    const value = '0s1234567890abcdef'
    await expect(ipSecPskValidator(value)).rejects.toEqual(errMsg)
  })

  it('should reject input with double quotes', async () => {
    const value = '"1234567890abcdef"'
    await expect(ipSecPskValidator(value)).rejects.toEqual(errMsg)
  })

  it('should validate ASCII input with valid length and characters', async () => {
    const value = 'abcdefgh'
    await expect(ipSecPskValidator(value)).resolves.toEqual(undefined)
  })

  it('should reject ASCII input with invalid length', async () => {
    const value = 'a'
    await expect(ipSecPskValidator(value)).rejects.toEqual(errMsg)
  })

  it('should reject ASCII input with invalid characters', async () => {
    const invalidChar = String.fromCharCode(30)
    const value = 'abcde~' + invalidChar
    await expect(ipSecPskValidator(value)).rejects.toEqual(errMsg)
  })

  it('should reject input with grave accent and dollar sign', async () => {
    const value = '`$(1234567890abcdef)'
    await expect(ipSecPskValidator(value)).rejects.toEqual(errMsg)
  })
})


describe('getRekeyTimeUnitOptions', () => {
  it('returns an array of objects with label and value properties', () => {
    const options = getRekeyTimeUnitOptions()
    expect(options).toBeInstanceOf(Array)
    expect(options.length).toBe(3)
    options.forEach((option) => {
      expect(option).toHaveProperty('label')
      expect(option).toHaveProperty('value')
    })
  })

  it('label values are translated using $t function', () => {
    const options = getRekeyTimeUnitOptions()
    expect(options[0].label).toBe('Day(s)')
    expect(options[1].label).toBe('Hour(s)')
    expect(options[2].label).toBe('Minute(s)')
  })

  it('value properties match IpSecRekeyTimeUnitEnum values', () => {
    const options = getRekeyTimeUnitOptions()
    expect(options[0].value).toBe(IpSecRekeyTimeUnitEnum.DAY)
    expect(options[1].value).toBe(IpSecRekeyTimeUnitEnum.HOUR)
    expect(options[2].value).toBe(IpSecRekeyTimeUnitEnum.MINUTE)
  })

  it('returns three options: DAY, HOUR, MINUTE', () => {
    const options = getRekeyTimeUnitOptions()
    expect(options.length).toBe(3)
    expect(options[0].value).toBe(IpSecRekeyTimeUnitEnum.DAY)
    expect(options[1].value).toBe(IpSecRekeyTimeUnitEnum.HOUR)
    expect(options[2].value).toBe(IpSecRekeyTimeUnitEnum.MINUTE)
  })
})