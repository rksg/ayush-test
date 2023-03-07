import React from 'react'

import { IntlShape } from 'react-intl'

import { cleanup, render, renderHook } from '@acx-ui/test-utils'

import { renderFilter, useGroupBy } from './filters'
import { groupTBData }              from './stories/GroupTable'

describe('Table Filters', () => {
  afterEach(() => cleanup())
  describe('useGroupBy', () => {
    const mockIntl = { $t: jest.fn(({ defaultMessage }:{ defaultMessage: string }) =>
      defaultMessage) } as unknown as IntlShape
    const groupable = {
      selectors: [
        { key: 'deviceGroupName', label: 'AP Group', actionEnable: true },
        { key: 'deviceStatus' , label: 'Status' },
        { key: 'model', label: 'Model' }
      ],
      onChange: jest.fn(),
      actions: [{
        key: 'edit',
        label: <div>Edit</div>,
        callback: jest.fn()
      }],
      onClear: jest.fn(),
      parentColumns: [
        {
          key: 'members',
          label: (record: typeof groupTBData[0]) => <div>Members: {record.members}</div>
        },
        {
          key: 'incidents',
          label: (record: typeof groupTBData[0]) =>
            <div>Incidents (24 hours): {record.incidents}</div>
        },
        {
          key: 'clients',
          label: (record: typeof groupTBData[0]) => <div>Connected Clients: {record.clients}</div>
        },
        {
          key: 'clients',
          label: (record: typeof groupTBData[0]) =>
            <div>Wireless Networks: {record.networks.count}</div>
        }
      ]
    }

    it('render hook correctly with valid data', () => {
      const { result } = renderHook(() => useGroupBy(groupable, groupTBData.length, mockIntl))
      const { isGroupByActive, clearGroupByFn } = result.current
      expect(isGroupByActive).toBeFalsy()
      clearGroupByFn()
    })

    it('render hook correctly with undefined groupable', () => {
      const { result } = renderHook(() => useGroupBy(undefined, groupTBData.length, mockIntl))
      const { isGroupByActive, clearGroupByFn, GroupBySelect } = result.current
      expect(isGroupByActive).toBeFalsy()
      clearGroupByFn()
      expect(GroupBySelect()).toBeNull()
    })

    it('render hook for expandable props', () => {
      const { result } = renderHook(() => useGroupBy(groupable, groupTBData.length, mockIntl))
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