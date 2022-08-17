import { useCallback, useEffect, useMemo, useState } from 'react'

import _ from 'lodash'

import type {
  TableColumn,
  ColumnState,
  ColumnStateOption,
  TableColumnState
} from './types'

export interface UseColumnsStateOptions <RecordType> {
  columns: TableColumn<RecordType>[]
  columnState?: ColumnStateOption
}

export function useColumnsState <RecordType> (options: UseColumnsStateOptions<RecordType>) {
  const { columnState } = options
  const { defaultState, initialState } = useDefaultAndInitialState(options)
  const [state, setState] = useState(defaultState)

  useEffect(() => setState(initialState), [setState, initialState])

  const onChange = useCallback((state: TableColumnState) => {
    columnState?.onChange?.(stateToUserState(state))
    setState(state)
  }, [setState, columnState])

  const resetState = useCallback(
    () => onChange(defaultState),
    [onChange, defaultState]
  )

  return {
    value: state,
    onChange,
    resetState
  }
}

function useDefaultAndInitialState <RecordType> ({
  columns,
  columnState
}: UseColumnsStateOptions<RecordType>) {
  return useMemo(() => {
    const defaultState = columns.reduce<TableColumnState>((state, column, order) => {
      const key = (column.key ?? column.dataIndex ?? order).toString()
      state[key] = {
        order,
        fixed: column.fixed ?? undefined,
        show: column.fixed ? Boolean(column.fixed) : column.show ?? true,
        disable: column.fixed ? Boolean(column.fixed) : column.disable ?? false
      }
      return state
    }, {})

    let initialState = defaultState

    if (columnState?.defaultValue) {
      initialState = _.merge({}, defaultState, _(columnState?.defaultValue)
        .toPairs()
        .filter(([key]) => defaultState.hasOwnProperty(key))
        .map(([key, show], order) => [key, { show, order }])
        .filter()
        .fromPairs()
        .value()
      )
    }

    return { defaultState, initialState }
  }, [columns, columnState])
}

function stateToUserState (states: TableColumnState): ColumnState {
  const pairs = _(states).toPairs()
  const fixed = pairs
    .filter(pair => Boolean(pair[1].fixed))
    .reduce<ColumnState>((agg, [key]) => ({ ...agg, [key]: true }), {})
  return pairs
    .filter(pair => !Boolean(pair[1].fixed))
    .sort((a, b) => a[1].order! - b[1].order!)
    .reduce<ColumnState>((agg, [key, state]) => ({
      ...agg,
      [key]: state.show!
    }), fixed)
}
