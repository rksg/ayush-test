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

describe('Table Groupby', () => {
  describe('useGroupBy', () => {
    it('render hook correctly with valid data', async () => {
      const { result } = renderHook(() => useGroupBy(groupByColumns, [], undefined, columnState))
      const {
        isGroupByActive,
        expandable
      } = result.current
      expect(isGroupByActive).toBeFalsy()
      expect(expandable).toBeUndefined()
    })

    it('render hook correctly with empty array groupable', () => {
      const { result } = renderHook(() => useGroupBy([], [], undefined, columnState))
      const {
        isGroupByActive,
        expandable
      } = result.current
      expect(isGroupByActive).toBeFalsy()
      expect(expandable).toBeUndefined()
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