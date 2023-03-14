import { useState } from 'react'

import { fireEvent, render, renderHook, screen } from '@testing-library/react'
import { act }                                   from 'react-dom/test-utils'
import { IntlShape }                             from 'react-intl'

import { GroupSelect, useGroupBy }     from './groupBy'
import { groupByColumns, groupTBData } from './stories/GroupTable'

describe('Table Groupby', () => {
  describe('useGroupBy', () => {
    it('render hook correctly with valid data', async () => {
      const { result } = renderHook(() => useGroupBy(groupByColumns, undefined))
      const {
        isGroupByActive,
        expandable,
        parentColumns,
        groupActionColumns
      } = result.current
      expect(isGroupByActive).toBeFalsy()
      expect(expandable).toBeUndefined()
      expect(parentColumns).toMatchObject([])
      expect(groupActionColumns).toMatchObject([])
    })

    it('render hook correctly with empty array groupable', () => {
      const { result } = renderHook(() => useGroupBy([], undefined))
      const {
        isGroupByActive,
        expandable,
        parentColumns,
        groupActionColumns
      } = result.current
      expect(isGroupByActive).toBeFalsy()
      expect(expandable).toBeUndefined()
      expect(parentColumns).toMatchObject([])
      expect(groupActionColumns).toMatchObject([])
    })

    it('render hook for expandable props', () => {
      const { result } = renderHook(() => useGroupBy(groupByColumns, 'deviceName'))
      act(() => {result.current.isGroupByActive = true})
      const { expandable } = result.current
      const { rowExpandable } = expandable as
      unknown as { rowExpandable: (data: typeof groupTBData[0]) => boolean }
      expect(rowExpandable).toBeDefined()
      expect(rowExpandable(groupTBData[0])).toBeTruthy()
    })
  })

  describe('GroupSelect', () => {
    it('should handle onClear correctly', async () => {
      const mock$t = jest.fn() as unknown as IntlShape['$t']
      const mockedSetVal = jest.fn()
      const groupable = groupByColumns.filter(cols => cols.groupable)
      const Test = () => {
        const [value, setValue] = useState<string | undefined>(undefined)
        const handleValue = (val: string | undefined) => {
          mockedSetVal(val)
          setValue(val)
        }
        return <GroupSelect
          $t={mock$t}
          value={value}
          setValue={handleValue}
          groupable={groupable}
        />
      }
      render(<Test />)

      const select = await screen.findByRole('combobox', { hidden: true , queryFallbacks: true })
      fireEvent.mouseDown(select)
      const deviceStatus = await screen.findByText('Status')
      fireEvent.click(deviceStatus)
      expect(mockedSetVal).toBeCalledWith('deviceStatus')
      const downArrow =
      await screen.findByRole('img', { name: 'down', hidden: true, queryFallbacks: true })
      fireEvent.mouseOver(downArrow)
      const cross =
      await screen.findByRole('img', { name: 'close-circle', hidden: true, queryFallbacks: true })
      fireEvent.mouseDown(cross)
      expect(mockedSetVal).toBeCalledWith('deviceStatus')
    })
  })
})