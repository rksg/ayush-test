import { useState } from 'react'

import { fireEvent, render, renderHook, screen } from '@testing-library/react'
import { IntlShape }                             from 'react-intl'

import { GroupSelect, useGroupBy } from './groupBy'
import { groupByColumns }          from './stories/GroupTable'

const columnState = {
  'name': {},
  'deviceStatus': {},
  'model': {},
  'ip': {},
  'apMac': {},
  'venueName': {},
  'switchName': {},
  'clients': {},
  'deviceGroupName': {},
  'rf-channels': {},
  'tags': {}
}
const rowKey = 'id'

describe('Table Groupby', () => {
  describe('useGroupBy', () => {
    it('render hook correctly with valid data', async () => {
      const { result } = renderHook(() =>
        useGroupBy(groupByColumns, [], undefined, columnState, rowKey)
      )
      const {
        isGroupByActive,
        expandable
      } = result.current
      expect(isGroupByActive).toBeFalsy()
      expect(expandable).toBeUndefined()
    })

    it('render hook correctly with empty array groupable', () => {
      const { result } = renderHook(() => useGroupBy([], [], undefined, columnState,rowKey))
      const {
        isGroupByActive,
        expandable
      } = result.current
      expect(isGroupByActive).toBeFalsy()
      expect(expandable).toBeUndefined()
    })
    it('onExpand expands and collapses rows correctly', () => {
      const columns = []
      const expandedRowKeys = [1, 2, 3]
      const groupByValue = 'someValue'
      const columnsState = {}
      const rowKey = 'id'
      const { result } = renderHook(() =>
        useGroupBy(columns, expandedRowKeys, groupByValue, columnsState, rowKey)
      )
      const { onExpand } = result.current
      const record = { id: 1, children: [] }
      const expanded = true

      onExpand(expanded, record)
      expect(expandedRowKeys).toEqual([1, 2, 3, 1])
      onExpand(!expanded, record)
      expect(expandedRowKeys).toEqual([2, 3, 1])

    })
    it('onExpand expands and collapses rows correctly when rowkey is function', () => {
      const columns = []
      const expandedRowKeys = [1, 2, 3]
      const groupByValue = 'someValue'
      const columnsState = {}
      const rowKey = (record) => record['id']
      const { result } = renderHook(() =>
        useGroupBy(columns, expandedRowKeys, groupByValue, columnsState, rowKey)
      )
      const { onExpand } = result.current
      const record = { id: 1, children: [] }
      const expanded = true

      onExpand(expanded, record)
      expect(expandedRowKeys).toEqual([1, 2, 3, 1])
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