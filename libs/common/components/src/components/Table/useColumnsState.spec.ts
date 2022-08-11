
import { act, renderHook } from '@testing-library/react'

import { useColumnsState, UseColumnsStateOptions } from './useColumnsState'

type Options = UseColumnsStateOptions<unknown>

describe('useColumnsState', () => {
  it('returns expected value when columnState not given', () => {
    const options: Options = {
      columns: [
        { key: 'col1', fixed: 'left' },
        { dataIndex: 'col2' },
        { key: 'col3', disable: true },
        { key: 'col4', show: false },
        { key: 'col5', show: true },
        { show: true }
      ]
    }
    const { result } = renderHook(useColumnsState, { initialProps: options })
    expect(result.current.value).toEqual({
      col1: { order: 0, fixed: 'left', show: true, disable: true },
      col2: { order: 1, fixed: undefined, show: true, disable: false },
      col3: { order: 2, fixed: undefined, show: true, disable: true },
      col4: { order: 3, fixed: undefined, show: false, disable: false },
      col5: { order: 4, fixed: undefined, show: true, disable: false },
      5: { order: 5, fixed: undefined, show: true, disable: false }
    })
  })

  it('returns value based on columnState', () => {
    const options: Options = {
      columns: [
        { key: 'col1', fixed: 'left' },
        { key: 'col2' },
        { key: 'col3', disable: true },
        { key: 'col4', show: false },
        { key: 'col5', show: true }
      ],
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
      columns: [
        { key: 'col1', fixed: 'left' },
        { key: 'col2' },
        { key: 'col3', disable: true },
        { key: 'col4', show: false },
        { key: 'col5', show: true }
      ],
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
      columns: [
        { key: 'col1', fixed: 'left' },
        { key: 'col2' },
        { key: 'col3', disable: true },
        { key: 'col4', show: false },
        { key: 'col5', show: true }
      ],
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
})
