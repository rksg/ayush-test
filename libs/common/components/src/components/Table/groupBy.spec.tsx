import { useState } from 'react'

import { fireEvent, render, renderHook, screen } from '@testing-library/react'
import { act }                                   from 'react-dom/test-utils'
import { IntlShape }                             from 'react-intl'

import { GroupSelect, useGroupBy }     from './groupBy'
import { groupByColumns, groupTBData } from './stories/GroupTable'

describe('Table Groupby', () => {
  const groupables = groupByColumns.filter(cols => cols.groupable)
  describe('useGroupBy', () => {

    const mockIntl = { $t: jest.fn(({ defaultMessage }:{ defaultMessage: string }) =>
      defaultMessage) } as unknown as IntlShape

    it('render hook correctly with valid data', async () => {
      const mockedValue = jest.fn(((val: string | undefined) => val))
      const { result } = renderHook(() => {
        const [value, setValue] = useState<string | undefined>(undefined)
        const handleValue = (val: string | undefined) => {
          setValue(val)
          mockedValue(val)
        }
        return useGroupBy(groupables, value, handleValue, groupTBData.length, mockIntl)
      })
      const {
        isGroupByActive,
        GroupBySelect,
        expandable,
        parentColumns,
        groupActionColumns
      } = result.current
      expect(isGroupByActive).toBeFalsy()
      expect(GroupBySelect).toBeDefined()
      expect(expandable).toBeUndefined()
      expect(parentColumns).toMatchObject([])
      expect(groupActionColumns).toMatchObject([])
    })

    it('render hook correctly with empty array groupable', () => {
      const mockedValue = jest.fn(((val: string | undefined) => val))
      const { result } = renderHook(() => {
        const [value, setValue] = useState<string | undefined>(undefined)
        const handleValue = (val: string | undefined) => {
          setValue(val)
          mockedValue(val)
        }
        return useGroupBy([], value, handleValue, groupTBData.length, mockIntl)
      })
      const {
        isGroupByActive,
        GroupBySelect,
        expandable,
        parentColumns,
        groupActionColumns
      } = result.current
      expect(isGroupByActive).toBeFalsy()
      expect(GroupBySelect).toBeDefined()
      expect(GroupBySelect()).toBeNull()
      expect(expandable).toBeUndefined()
      expect(parentColumns).toMatchObject([])
      expect(groupActionColumns).toMatchObject([])
    })

    it('render hook for expandable props', () => {
      const mockedValue = jest.fn(((val: string | undefined) => val))
      const { result } = renderHook(() => {
        const [value, setValue] = useState<string | undefined>('deviceName')
        const handleValue = (val: string | undefined) => {
          setValue(val)
          mockedValue(val)
        }
        return useGroupBy(groupables, value, handleValue, groupTBData.length, mockIntl)
      })

      act(() => {result.current.isGroupByActive = true})
      const { expandable } = result.current
      const { rowExpandable } = expandable as
      unknown as { rowExpandable: (data: typeof groupTBData[0]) => boolean }
      expect(rowExpandable).toBeDefined()
      expect(rowExpandable(groupTBData[0])).toBeTruthy()
    })
  })

  describe('GroupBySelect', () => {
    it('should handle onClear correctly', async () => {
      const mock$t = jest.fn() as unknown as IntlShape['$t']
      const mockedSetVal = jest.fn()
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
          groupables={groupables}
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