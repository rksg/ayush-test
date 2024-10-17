import { MutableRefObject } from 'react'

import { FormInstance } from 'antd'

import { genTimeTicks, shouldStartSelecting, dayIndex, onSelectionChange, parseNonePrefixScheduler, onSelectionEnd } from './utils'

describe('ScheduleCard-utils', () => {
  describe('genTimeTicks', () => {
    it('should generate 12-hour time ticks', () => {
      const result = genTimeTicks(true)
      expect(result).toEqual([
        // eslint-disable-next-line max-len
        'Midnight', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM', 'Noon', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM', 'Midnight'
      ])
    })

    it('should generate 24-hour time ticks', () => {
      const result = genTimeTicks(false)
      expect(result).toEqual(['0', '3', '6', '9', '12', '15', '18', '21', '24'])
    })
  })

  describe('shouldStartSelecting', () => {
    it('should return true if target is not an HTMLElement', () => {
      const result = shouldStartSelecting(null)
      expect(result).toBe(true)
    })

    it('should return true if target does not have disableselect data attribute', () => {
      const div = document.createElement('div')
      const result = shouldStartSelecting(div)
      expect(result).toBe(true)
    })

    it('should return false if target has disableselect data attribute set to true', () => {
      const div = document.createElement('div')
      div.dataset.disableselect = 'true'
      const result = shouldStartSelecting(div)
      expect(result).toBe(false)
    })
  })

  describe('dayIndex', () => {
    it('should have correct day indices', () => {
      expect(dayIndex).toEqual({
        mon: 0,
        tue: 1,
        wed: 2,
        thu: 3,
        fri: 4,
        sat: 5,
        sun: 6
      })
    })
  })

  describe('onSelectionChange', () => {
    it('should update selectedItems based on selection box', () => {
      const selectedItems: MutableRefObject<string[]> = { current: [] }
      const box = { top: 0, left: 0, width: 100, height: 100 }
      const intervalsCount = 24
      // eslint-disable-next-line max-len
      document.body.innerHTML = '<div id="mon_0" style="position:absolute; top:10px; left:10px; width:50px; height:50px;"></div>'

      onSelectionChange(box, false, selectedItems, intervalsCount)
      expect(selectedItems.current).toContain('mon_0')
    })

    it('should update selectedItems based on selection box (disable)', () => {
      const selectedItems: MutableRefObject<string[]> = { current: [] }
      const box = { top: 0, left: 0, width: 100, height: 100 }
      const intervalsCount = 24
      // eslint-disable-next-line max-len
      document.body.innerHTML = '<div id="mon_0" style="position:absolute; top:10px; left:10px; width:50px; height:50px;"></div>'

      onSelectionChange(box, true, selectedItems, intervalsCount)
      expect(selectedItems.current).toEqual([])
    })
  })

  describe('parseNonePrefixScheduler', () => {
    it('should parse values with given key', () => {
      const result = parseNonePrefixScheduler('mon', ['1', '2', '3'])
      expect(result).toEqual(['mon_1', 'mon_2', 'mon_3'])
    })
  })

  describe('onSelectionEnd', () => {
    it('should update form values and check states correctly', () => {
      const form: Partial<FormInstance> = {
        getFieldValue: jest.fn().mockReturnValue([]),
        setFieldValue: jest.fn()
      }
      const fieldNamePath = ['schedule']
      const prefix = true
      const items = ['mon_1', 'mon_2']
      const intervalsCount = 24
      const arrCheckAll = [false, false, false, false, false, false, false]
      const arrIndeterminate = [false, false, false, false, false, false, false]

      // eslint-disable-next-line max-len
      const [updatedCheckAll, updatedIndeterminate] = onSelectionEnd(fieldNamePath, prefix, items, intervalsCount, form as FormInstance, arrCheckAll, arrIndeterminate)

      expect(form.setFieldValue).toHaveBeenCalledWith(['schedule', 'mon'], ['mon_1', 'mon_2'])
      expect(updatedCheckAll[0]).toBe(false)
      expect(updatedIndeterminate[0]).toBe(true)
    })

    it('should update form values and check states correctly (no prefix)', () => {
      const formData = [
        '3', '4', '5',
        '6', '7', '8', '9', '10', '11',
        '12', '13', '14', '15', '16', '17',
        '18', '19', '20', '21', '22', '23']
      const form: Partial<FormInstance> = {
        getFieldValue: jest.fn().mockImplementation((field) => {
          if (field[1] === 'mon') {
            return formData
          }
          return []
        }),
        setFieldValue: jest.fn()
      }
      const fieldNamePath = ['schedule']
      const prefix = false
      const items = ['mon_0','mon_1', 'mon_2']
      const intervalsCount = 24
      const arrCheckAll = [false, false, false, false, false, false, false]
      const arrIndeterminate = [true, false, false, false, false, false, false]

      // eslint-disable-next-line max-len
      const [updatedCheckAll, updatedIndeterminate] = onSelectionEnd(fieldNamePath, prefix, items, intervalsCount, form as FormInstance, arrCheckAll, arrIndeterminate)

      expect(updatedCheckAll[0]).toBe(true)
      expect(updatedIndeterminate[0]).toBe(false)
    })
  })
})
