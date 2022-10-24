
import { act, renderHook } from '@testing-library/react'

import { TableColumn }                             from './types'
import { useColumnsState, UseColumnsStateOptions } from './useColumnsState'

type Options = UseColumnsStateOptions<unknown>

describe('useColumnsState', () => {
  const columns = [
    { key: 'col1', dataIndex: 'col1', fixed: 'left' },
    { key: 'col2', dataIndex: 'col2' },
    { key: 'col3', dataIndex: 'col3', disable: true },
    { key: 'col4', dataIndex: 'col4', show: false },
    { key: 'col5', dataIndex: 'col5', show: true }
  ] as TableColumn<unknown>[]

  it('returns expected value when columnState not given', () => {
    const options: Options = { columns: [
      ...columns.slice(0,1),
      ...columns.slice(2,5)
    ] }
    const { result } = renderHook(useColumnsState, { initialProps: options })
    expect(result.current.value).toEqual({
      col1: { order: 0, fixed: 'left', show: true, disable: true },
      col3: { order: 1, fixed: undefined, show: true, disable: true },
      col4: { order: 2, fixed: undefined, show: false, disable: false },
      col5: { order: 3, fixed: undefined, show: true, disable: false }
    })
  })

  it('returns value based on columnState', () => {
    const options: Options = {
      columns,
      columnState: {
        defaultValue: {
          col1: true,
          col3: true,
          col2: false,
          col5: false,
          col4: true
        }
      }
    }
    const { result } = renderHook(useColumnsState, { initialProps: options })
    expect(result.current.value).toEqual({
      col1: { order: 0, fixed: 'left', show: true, disable: true },
      col2: { order: 2, fixed: undefined, show: false, disable: false },
      col3: { order: 1, fixed: undefined, show: true, disable: true },
      col4: { order: 4, fixed: undefined, show: true, disable: false },
      col5: { order: 3, fixed: undefined, show: false, disable: false }
    })
  })

  it('calls columnState.onChange when state changed', () => {
    const onChange = jest.fn()
    const options: Options = {
      columns,
      columnState: { onChange }
    }
    const { result } = renderHook(useColumnsState, { initialProps: options })
    act(() => {
      result.current.onChange({
        col1: { order: 0, fixed: 'left', show: true, disable: true },
        col2: { order: 2, fixed: undefined, show: false, disable: false },
        col3: { order: 1, fixed: undefined, show: true, disable: true },
        col4: { order: 4, fixed: undefined, show: true, disable: false },
        col5: { order: 3, fixed: undefined, show: false, disable: false }
      })
    })
    expect(onChange).toHaveBeenCalledWith({
      col1: true,
      col3: true,
      col2: false,
      col5: false,
      col4: true
    })
  })

  it('resets state to default', () => {
    const options: Options = {
      columns,
      columnState: {
        defaultValue: {
          col1: true,
          col3: true,
          col2: false,
          col5: false,
          col4: true
        }
      }
    }
    const { result } = renderHook(useColumnsState, { initialProps: options })
    expect(result.current.value).toEqual({
      col1: { order: 0, fixed: 'left', show: true, disable: true },
      col2: { order: 2, fixed: undefined, show: false, disable: false },
      col3: { order: 1, fixed: undefined, show: true, disable: true },
      col4: { order: 4, fixed: undefined, show: true, disable: false },
      col5: { order: 3, fixed: undefined, show: false, disable: false }
    })

    act(() => result.current.resetState())

    expect(result.current.value).toEqual({
      col1: { order: 0, fixed: 'left', show: true, disable: true },
      col2: { order: 1, fixed: undefined, show: true, disable: false },
      col3: { order: 2, fixed: undefined, show: true, disable: true },
      col4: { order: 3, fixed: undefined, show: false, disable: false },
      col5: { order: 4, fixed: undefined, show: true, disable: false }
    })
  })

  it('resets state to default when deselect all columns', () => {
    const onChange = jest.fn()
    const options: Options = {
      columns,
      columnState: {
        onChange,
        defaultValue: {
          col1: true,
          col3: true,
          col2: false,
          col5: false,
          col4: true
        }
      }
    }
    const { result } = renderHook(useColumnsState, { initialProps: options })
    expect(result.current.value).toEqual({
      col1: { order: 0, fixed: 'left', show: true, disable: true },
      col2: { order: 2, fixed: undefined, show: false, disable: false },
      col3: { order: 1, fixed: undefined, show: true, disable: true },
      col4: { order: 4, fixed: undefined, show: true, disable: false },
      col5: { order: 3, fixed: undefined, show: false, disable: false }
    })

    act(() => {
      result.current.onChange({
        col1: { order: 0, fixed: 'left', show: true, disable: true },
        col2: { order: 2, fixed: undefined, show: false, disable: false },
        col3: { order: 1, fixed: undefined, show: true, disable: true },
        col4: { order: 4, fixed: undefined, show: false, disable: false },
        col5: { order: 3, fixed: undefined, show: false, disable: false }
      })
    })

    expect(result.current.value).toEqual({
      col1: { order: 0, fixed: 'left', show: true, disable: true },
      col2: { order: 2, fixed: undefined, show: false, disable: false },
      col3: { order: 1, fixed: undefined, show: true, disable: true },
      col4: { order: 4, fixed: undefined, show: true, disable: false },
      col5: { order: 3, fixed: undefined, show: false, disable: false }
    })

    expect(onChange).toHaveBeenCalledWith({
      col1: true,
      col3: true,
      col2: false,
      col5: false,
      col4: true
    })
  })
})
