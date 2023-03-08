import { useState } from 'react'

import { IntlShape } from 'react-intl'

import { render, renderHook, screen, fireEvent, act } from '@acx-ui/test-utils'

import { GroupSelect, renderFilter, useGroupBy } from './filters'
import { groupTBData, groupByColumns }           from './stories/GroupTable'

describe('Table Filters', () => {
  afterEach(() => jest.resetAllMocks())
  describe('useGroupBy', () => {
    const mockIntl = { $t: jest.fn(({ defaultMessage }:{ defaultMessage: string }) =>
      defaultMessage) } as unknown as IntlShape
    const groupTableAction = {
      onChange: jest.fn(),
      onClear: jest.fn()
    }
    const groupables = groupByColumns.filter(cols => cols.groupable)

    it('render hook correctly with valid data', async () => {
      const { result } = renderHook(() =>
        useGroupBy(groupables, groupTableAction, groupTBData.length, mockIntl))
      const {
        isGroupByActive,
        GroupBySelect,
        expandable,
        finalParentColumns
      } = result.current
      expect(isGroupByActive).toBeFalsy()
      expect(GroupBySelect).toBeDefined()
      expect(expandable).toBeDefined()
      expect(finalParentColumns).toBeUndefined()
    })

    it('render hook correctly with empty actions data', async () => {
      const { result } = renderHook(() =>
        useGroupBy(groupables, undefined, groupTBData.length, mockIntl))
      const { clearGroupByFn } = result.current
      clearGroupByFn()
      expect(groupTableAction.onClear).toBeCalledTimes(0)
    })

    it('render hook correctly with undefined groupable', () => {
      const { result } = renderHook(() =>
        useGroupBy([], groupTableAction,groupTBData.length, mockIntl))
      const { GroupBySelect, clearGroupByFn } = result.current
      expect(GroupBySelect).toBeDefined()
      expect(GroupBySelect()).toBeNull()
      clearGroupByFn()
    })

    it('render hook for expandable props', () => {
      const { result } = renderHook(() =>
        useGroupBy(groupables, groupTableAction, groupTBData.length, mockIntl))

      act(() => {result.current.isGroupByActive = true})
      const { expandable } = result.current
      const { rowExpandable } = expandable as
        unknown as { rowExpandable: (data: typeof groupTBData[0]) => boolean }
      expect(rowExpandable).toBeDefined()
      expect(rowExpandable(groupTBData[0])).toBeTruthy()
    })
  })

  describe('renderFilter', () => {
    it('should handle unchecking selected data with correct data', async () => {
      const filterableCol = jest.fn()
      render(renderFilter<{ name: string }>(
        {
          key: 'name',
          dataIndex: 'name',
          filterable: true,
          filterValueNullable: false,
          filterMultiple: false
        },
        0,
        [{ name: 'john tan' }, { name: 'dragon den' }],
        { xd: true as unknown as boolean[] },
        filterableCol,
        false
      )())
      const select = await screen.findByRole('combobox', { hidden: true , queryFallbacks: true })
      fireEvent.mouseDown(select)
      fireEvent.click((await screen.findAllByText('john tan'))[0])
    })

    it('should render with undefined data', () => {
      const filterableCol = jest.fn()
      render(renderFilter<{ name: string }>(
        {
          key: 'name',
          dataIndex: 'name',
          filterable: true,
          filterMultiple: false
        },
        0,
        undefined,
        {},
        filterableCol,
        false
      )())
    })

    it('should render with filterable array data', () => {
      const filterableCol = jest.fn()
      render(renderFilter<{ name: string }>(
        {
          key: 'name',
          dataIndex: 'name',
          filterable: [{ key: 'john', value: 'tan' }],
          filterMultiple: false
        },
        0,
        undefined,
        {},
        filterableCol,
        false
      )())
    })
  })

  describe('GroupBySelect', () => {
    it('should handle onClear correctly', async () => {
      const mock$t = jest.fn() as unknown as IntlShape['$t']
      const onChange = jest.fn()
      const onClear = jest.fn()
      const mockedSetVal = jest.fn()
      const selectors = [{ key: 'test', label: 'soy' }]
      const Test = () => {
        const [value, setValue] = useState<{
          key: string, value: string
        } | undefined>(undefined)
        const handleValue = (val: { key: string, value: string } | undefined) => {
          mockedSetVal(val)
          setValue(val)
        }
        return <GroupSelect
          $t={mock$t}
          value={value}
          setValue={handleValue}
          onClear={onClear}
          onChange={onChange}
          selectors={selectors}
        />
      }
      render(<Test />)

      const select = await screen.findByRole('combobox', { hidden: true , queryFallbacks: true })
      fireEvent.mouseDown(select)
      const soy = await screen.findByText('soy')
      fireEvent.click(soy)
      expect(onChange).toBeCalled()
      const downArrow =
        await screen.findByRole('img', { name: 'down', hidden: true, queryFallbacks: true })
      fireEvent.mouseOver(downArrow)
      const cross =
        await screen.findByRole('img', { name: 'close-circle', hidden: true, queryFallbacks: true })
      fireEvent.mouseDown(cross)
      expect(mockedSetVal).toBeCalledWith({ key: 'test', value: 'soy' })
      expect(onClear).toBeCalled()
    })
  })
})