import { defineMessage } from 'react-intl'

import { getUserName as getUserNameRAI, getUserProfile as getUserProfileRAI } from '@acx-ui/analytics/utils'
import { get }                                                                from '@acx-ui/config'
import { getUserName as getUserNameR1, getUserProfile as getUserProfileR1 }   from '@acx-ui/user'
import { getIntl }                                                            from '@acx-ui/utils'

import { DataConnector, Frequency } from './types'

export function generateBreadcrumb () {
  const { $t } = getIntl()
  return [
    { text: $t({ defaultMessage: 'Business Insights' }) },
    { text: $t({ defaultMessage: 'DataConnector' }), link: '/dataConnector' }
  ]
}

export const getUserName = () =>
  get('IS_MLISA_SA') ? getUserNameRAI() : getUserNameR1()

// For R1, mlisa-rbac uses externalId as x-mlisa-user-id
export const getUserId = () =>
  get('IS_MLISA_SA') ? getUserProfileRAI().userId : getUserProfileR1().profile.externalId

export enum Actions {
  Resume = 'resume',
  Pause = 'pause',
  Edit = 'edit',
  Delete = 'delete'
}

export const isVisibleByAction = (rows: DataConnector[], action: Actions) => {
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

export const frequencyMap = {
  [Frequency.Daily]: defineMessage({ defaultMessage: 'Daily' })
}