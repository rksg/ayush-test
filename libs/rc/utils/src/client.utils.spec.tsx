import '@testing-library/jest-dom'
import { useIntl } from 'react-intl'

import { renderHook } from '@acx-ui/test-utils'

import {
  convertClientOsType,
  getOsTypeIcon,
  getRssiStatus,
  getNoiseFloorStatus
} from '.'

describe('client.utils', () => {
  describe('convertClientOsType', () => {
    it('Should take care of known OS type value correctly', async () => {
      const result = convertClientOsType('linux xxx xxx')
      await expect(result).toEqual('linux')
    })
    it('Should take care of OS type value of apple correctly', async () => {
      const result = convertClientOsType('macOS')
      await expect(result).toEqual('apple')
    })
    it('Should take care of unknown OS type value correctly', async () => {
      const result = convertClientOsType('xxxxxxxx')
      await expect(result).toEqual('xxxxxxxx')
    })
    it('Should take care of empty values correctly', async () => {
      const result = convertClientOsType('')
      await expect(result).toEqual('')
    })
  })

  describe('getOsTypeIcon', () => {
    it('Should take care of known OS type icons correctly', async () => {
      const result = getOsTypeIcon('android')
      await expect(result).toBeDefined()
    })
    it('Should take care of unknown OS type icons correctly', async () => {
      const result = getOsTypeIcon('xxxxx')
      await expect(result).toBe('')
    })
  })

  describe('getRssiStatus', () => {
    it('Should take care of poor value correctly', async () => {
      expect(renderHook(() => getRssiStatus(useIntl(), -90)).result.current).toEqual({
        tooltip: 'Poor',
        color: '#ED1C24'
      })
    })
    it('Should take care of acceptable value correctly', async () => {
      expect(renderHook(() => getRssiStatus(useIntl(), -78)).result.current).toEqual({
        tooltip: 'Acceptable',
        color: '#F9C34B'
      })
    })
    it('Should take care of good value correctly', async () => {
      expect(renderHook(() => getRssiStatus(useIntl(), -30)).result.current).toEqual({
        tooltip: 'Good',
        color: '#23AB36'
      })
    })
    it('Should take care of empty value correctly', async () => {
      expect(renderHook(() => getRssiStatus(useIntl(), null)).result.current).toEqual({
        tooltip: '',
        color: ''
      })
    })
  })

  describe('getNoiseFloorStatus', () => {
    it('Should take care of low value correctly', async () => {
      expect(renderHook(() => getNoiseFloorStatus(useIntl(), -80)).result.current).toEqual({
        tooltip: 'Low',
        color: '#23AB36'
      })
    })
    it('Should take care of high value correctly', async () => {
      expect(renderHook(() => getNoiseFloorStatus(useIntl(), -60)).result.current).toEqual({
        tooltip: 'High',
        color: '#ED1C24'
      })
    })
  })
})
