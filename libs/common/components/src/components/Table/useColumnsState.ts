import { useCallback, useEffect, useMemo, useState } from 'react'

import _ from 'lodash'

import type {
  TableColumn,
  ColumnState,
  ColumnStateOption,
  TableColumnState
} from './types'

export const settingsKey = 'acx-table-settings'
export const settingsKeyWidth = 32
export const defaultColumnWidth = 120
export const minColumnWidth = 90

export interface UseColumnsStateOptions <RecordType> {
  settingsId?: string
  columns: TableColumn<RecordType>[]
  columnState?: ColumnStateOption
}

export function useColumnsState <RecordType> (options: UseColumnsStateOptions<RecordType>) {
  const { columnState } = options
  const { defaultState, initialState } = useDefaultAndInitialState(options)
  const [state, setState] = useState(defaultState)

  useEffect(() => setState(initialState), [setState, initialState])

  const onChange = useCallback((state: TableColumnState) => {
    const newState = Object.entries(state).every(([,col]) => !col.show)
      ? initialState : state

    options.settingsId && localStorage.setItem(options.settingsId, JSON.stringify(newState))

    columnState?.onChange?.(stateToUserState(newState))
    setState(newState)
  }, [setState, columnState, initialState, options.settingsId])

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
  settingsId,
  columns,
  columnState
}: UseColumnsStateOptions<RecordType>) {
  return useMemo(() => {

    const defaultState = columns.reduce<TableColumnState>((state, column, order) => {
      state[column.key] = {
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

    const state = settingsId && localStorage.getItem(settingsId)
      ? JSON.parse(localStorage.getItem(settingsId)!)
      : undefined

    if (settingsId && !state) {
      localStorage.setItem(settingsId, JSON.stringify(initialState))
    }

    return {
      defaultState,
      initialState: state ?? initialState
    }
  }, [columns, columnState, settingsId])
}

function stateToUserState (states: TableColumnState): ColumnState {
  const pairs = _(states).omit(settingsKey).toPairs()
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
