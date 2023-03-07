import React from 'react'

import { IntlShape } from 'react-intl'

import { render, renderHook, fireEvent, act, screen, waitFor } from '@acx-ui/test-utils'

import { renderFilter, useGroupBy }    from './filters'
import { groupTBData, groupByColumns } from './stories/GroupTable'

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
      const { result, rerender } = renderHook(() =>
        useGroupBy(groupables, groupTableAction,groupTBData.length, mockIntl))
      const {
        isGroupByActive,
        clearGroupByFn,
        GroupBySelect,
        expandable,
        finalParentColumns
      } = result.current
      expect(isGroupByActive).toBeFalsy()

      expect(GroupBySelect()).toBeDefined()
      expect(expandable).toBeDefined()
      expect(finalParentColumns).toBeUndefined()

      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        render(<GroupBySelect />)
        const select = await screen.findByRole('combobox', { hidden: true, queryFallbacks: true })
        expect(select).toBeInTheDocument()
        fireEvent.mouseDown(select)
        await waitFor(async () => await screen.findByTestId('option-deviceStatus'))
        fireEvent.click(await screen.findByTestId('option-deviceGroupName'))
      })
      rerender()

      expect(isGroupByActive).toBeTruthy()
      clearGroupByFn()
      expect(groupTableAction.onClear).toBeCalledTimes(1)
    })

    it('render hook correctly with undefined groupable', () => {
      const { result } = renderHook(() =>
        useGroupBy([], groupTableAction,groupTBData.length, mockIntl))
      const { GroupBySelect } = result.current
      expect(GroupBySelect()).toBeNull()
    })

    it('render hook for expandable props', () => {
      const { result } = renderHook(() =>
        useGroupBy(groupables, groupTableAction, groupTBData.length, mockIntl))
      const { expandable } = result.current
      const { rowExpandable } = expandable as
        unknown as { rowExpandable: (data: typeof groupTBData[0]) => boolean }
      expect(rowExpandable).toBeDefined()
      expect(rowExpandable && rowExpandable(groupTBData[0])).toBeTruthy()
    })
  })

  describe('renderFilter', () => {
    it('should render with correct data', () => {
      const filterableCol = jest.fn()
      const view = renderFilter<{ name: string }>(
        {
          key: 'name',
          dataIndex: 'name',
          filterable: true,
          filterMultiple: false
        },
        0,
        [{ name: 'john tan' }, { name: 'dragon den' }],
        {},
        filterableCol,
        false
      )
      expect(view).toBeDefined()
      render(<view/>)
    })

    it('should render with undefined data', () => {
      const filterableCol = jest.fn()
      const view = renderFilter<{ name: string }>(
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
      )
      expect(view).toBeDefined()
      render(<view/>)
    })
  })
})