import { DataSubscription } from '../services'

import { Actions,isVisibleByAction } from '.'

describe('isVisibleByAction', () => {
  const baseItem = {
    id: 'subscription-id',
    name: 'subscription-name',
    userId: 'user-id',
    userName: 'user-name',
    columns: ['col1', 'col2'],
    status: true
  } as DataSubscription
  const activeRow = baseItem
  const pausedRow = { ...baseItem, status: false }

  it('should show/hide for Resume', () => {
    expect(isVisibleByAction([pausedRow, pausedRow], Actions.Resume)).toBeTruthy()
    expect(isVisibleByAction([pausedRow, activeRow], Actions.Resume)).toBeFalsy()
  })

  it('should show/hide for Pause', () => {
    expect(isVisibleByAction([activeRow, activeRow], Actions.Pause)).toBeTruthy()
    expect(isVisibleByAction([activeRow, pausedRow], Actions.Pause)).toBeFalsy()
  })

  it('should show/hide for Edit', () => {
    expect(isVisibleByAction([activeRow], Actions.Edit)).toBeTruthy()
    expect(isVisibleByAction([activeRow, activeRow], Actions.Edit)).toBeFalsy()
  })

  it('should show for Delete', () => {
    expect(isVisibleByAction([activeRow], Actions.Delete)).toBeTruthy()
    expect(isVisibleByAction([activeRow, activeRow], Actions.Delete)).toBeTruthy()
  })

  it('should hide by default', () => {
    expect(isVisibleByAction([activeRow], 'INVALID_ACTION' as Actions)).toBeFalsy()
    expect(isVisibleByAction([activeRow, activeRow], 'INVALID_ACTION' as Actions)).toBeFalsy()
  })
})
