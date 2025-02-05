import { DataSubscription } from '../services'

export enum Actions {
  Resume = 'resume',
  Pause = 'pause',
  Edit = 'edit',
  Delete = 'delete'
}

export const isVisibleByAction = (rows: DataSubscription[], action: Actions) => {
  switch (action) {
    case Actions.Resume:
      return rows.every(row => !row.status)
    case Actions.Pause:
      return rows.every(row => row.status)
    case Actions.Edit:
      return rows.length === 1
    case Actions.Delete:
      return true
    default:
      return false
  }
}