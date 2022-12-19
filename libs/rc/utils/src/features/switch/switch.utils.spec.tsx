import '@testing-library/jest-dom'

import { SwitchStatusEnum } from '../../types'

import {
  isOperationalSwitch,
  getSwitchModel
} from '.'

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
})