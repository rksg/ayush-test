import _                 from 'lodash'
import moment            from 'moment-timezone'
import { defineMessage } from 'react-intl'

import { get } from '@acx-ui/config'

import { Intent, StatusTrail, IntentWlan }        from '../config'
import { DisplayStates, Statuses, StatusReasons } from '../states'

type TransitionStatus = Pick<StatusTrail, 'status' | 'statusReason'>

export const isDataRetained = (time?: string) => {
  const retainDate = moment().startOf('day').subtract(get('DRUID_RETAIN_PERIOD_DAYS'), 'days')
  return moment(time).isAfter(retainDate)
}

export const dataRetentionText = defineMessage({ defaultMessage: 'Beyond data retention period' })

export const coldTierDataText = defineMessage({
  defaultMessage: 'Metrics / Charts unavailable for data beyond 30 days' })

export const getDefaultTime = () => {
  const datetime3AM = moment().set({ hour: 3, minute: 0, second: 0, millisecond: 0 })
  return moment().isSameOrBefore(datetime3AM) ?
    datetime3AM : datetime3AM.add(1, 'd')
}



export type TransitionIntentMetadata = {
  scheduledAt?: string
  applyScheduledAt?: string
  wlans?: IntentWlan[]
  preferences?: {
    crrmFullOptimization: boolean
  }
  changedByName?: string
}

export type TransitionIntentItem = {
  id: string
  displayStatus: DisplayStates
  status: Statuses
  statusTrail?: StatusTrail[]
  metadata?: TransitionIntentMetadata
}

export enum Actions {
  One_Click_Optimize = '1-click-optimize',
  Optimize = 'optimize',
  Revert = 'revert',
  Pause = 'pause',
  Cancel = 'cancel',
  Resume = 'resume'
}

export const isVisibleByAction = (rows: Intent[], action: Actions) => {
  switch (action) {
    case Actions.One_Click_Optimize:
      return !rows.some(row => row.displayStatus !== DisplayStates.new)
    case Actions.Optimize:
      return rows.length === 1 &&
        [DisplayStates.new, DisplayStates.scheduled,
          DisplayStates.scheduledOneClick,DisplayStates.applyScheduled,
          DisplayStates.active].includes(rows[0].displayStatus)

    case Actions.Revert:
      return !rows.some(row =>
        ![DisplayStates.applyScheduled,
          DisplayStates.pausedApplyFailed,
          DisplayStates.active,
          DisplayStates.revertScheduled,
          DisplayStates.pausedRevertFailed].includes(row.displayStatus)
        || !row.metadata.appliedAt
      )
    case Actions.Pause:
      return !rows.some(row => ![
        Statuses.new,
        Statuses.scheduled,
        Statuses.applyScheduled,
        Statuses.active,
        Statuses.na
      ].includes(row.status))
    case Actions.Cancel:
      return !rows.some(row => ![
        Statuses.scheduled,
        Statuses.revertScheduled
      ].includes(row.status))
    case Actions.Resume:
      return !rows.some(row => row.status !== Statuses.paused)
  }
}

const getCancelTransitionStatus = (item: TransitionIntentItem): TransitionStatus => {
  if ([DisplayStates.scheduled, DisplayStates.scheduledOneClick].includes(item.displayStatus)) {
    return { status: Statuses.new }
  }
  const preStatusTrail = item.statusTrail?.find(({ status }) => status !== item.status)
  if (!preStatusTrail) throw new Error('Invalid statusTrail(Cancel)')

  return preStatusTrail?.status === Statuses.applyScheduled &&
   moment().isAfter(moment(item.metadata?.applyScheduledAt)) ?
    { status: Statuses.active } : preStatusTrail
}

const getResumeTransitionStatus = (item: TransitionIntentItem): TransitionStatus => {
  const preStatusTrail = item.statusTrail?.find(({ status }) => status !== item.status)
  if (!preStatusTrail) throw new Error('Invalid statusTrail(Resume)')

  if (item.displayStatus === DisplayStates.pausedApplyFailed) {
    return { status: Statuses.active }
  } else if (
    item.displayStatus === DisplayStates.pausedFromActive &&
    preStatusTrail.status === Statuses.applyScheduled &&
    moment().isBefore(moment(item.metadata?.scheduledAt))
  ) {
    return { status: Statuses.active }
  } else if (preStatusTrail.status === Statuses.scheduled) {
    return { status: Statuses.new }
  } else if (
    [DisplayStates.pausedRevertFailed, DisplayStates.pausedReverted].includes(item.displayStatus)) {
    return { status: Statuses.na, statusReason: StatusReasons.waitingForEtl }
  }
  return preStatusTrail
}

export const getTransitionStatus =(
  action: Actions,
  item: TransitionIntentItem
): TransitionStatus => {
  const { displayStatus } = item
  switch (action) {
    case Actions.One_Click_Optimize:
      return { status: Statuses.scheduled, statusReason: StatusReasons.oneClick }
    case Actions.Optimize:
      return [DisplayStates.applyScheduled, DisplayStates.active].includes(displayStatus) ?
        { status: Statuses.active } :
        { status: Statuses.scheduled }
    case Actions.Revert:
      return { status: Statuses.revertScheduled }
    case Actions.Pause:
      return [DisplayStates.applyScheduled, DisplayStates.active].includes(displayStatus) ?
        { status: Statuses.paused, statusReason: StatusReasons.fromActive } :
        { status: Statuses.paused, statusReason: StatusReasons.fromInactive }
    case Actions.Cancel:
      return getCancelTransitionStatus(item)
    case Actions.Resume:
      return getResumeTransitionStatus(item)
  }
}

export type TransitionMutationPayload = {
  id: string
  displayStatus: DisplayStates
}

const buildTransitionGQL = (index:number) => `t${index}: transition(
  id: $id${index}, status: $status${index}, statusReason: $statusReason${index},
   metadata: $metadata${index}) {
    success
    errorMsg
    errorCode
  }`

export const parseTransitionGQLByAction = (action: Actions, data: TransitionIntentItem[]) => {
  const paramsGQL:string[] = []
  const transitionsGQLs:string[] = []
  const variables:Record<string, string|TransitionIntentMetadata|null> = {}
  const sendWholeMetadata = [Actions.Revert, Actions.One_Click_Optimize].includes(action)
  data.forEach((item, index) => {
    const currentIndex = index + 1
    const { id, metadata } = item
    const { status, statusReason } = getTransitionStatus(action, item)
    paramsGQL.push(
      `$id${currentIndex}:String!, $status${currentIndex}:String!, \n
      $statusReason${currentIndex}:String, \n
      $metadata${currentIndex}:JSON`
    )
    transitionsGQLs.push(buildTransitionGQL(currentIndex))
    variables[`id${currentIndex}`] = id
    variables[`status${currentIndex}`] = status
    variables[`statusReason${currentIndex}`] = statusReason ?? null

    if (metadata) variables[`metadata${currentIndex}`] =
      sendWholeMetadata ? metadata : _.pick(metadata, ['changedByName'])
  })
  return { paramsGQL,transitionsGQLs, variables } as {
    paramsGQL:string[],
    transitionsGQLs:string[],
    variables: Record<string, string|TransitionIntentMetadata|null> }
}
