import moment            from 'moment-timezone'
import { defineMessage } from 'react-intl'

import { get } from '@acx-ui/config'

import { StatusTrail }                            from '../config'
import { displayStates, statuses, statusReasons } from '../states'

export const isDataRetained = (time?: string) => {
  const retainDate = moment().startOf('day').subtract(get('DRUID_RETAIN_PERIOD_DAYS'), 'days')
  return moment(time).isAfter(retainDate)
}

export const dataRetentionText = defineMessage({ defaultMessage: 'Beyond data retention period' })

export const getDefaultTime = () => {
  const datetime3AM = moment().set({ hour: 3, minute: 0, second: 0, millisecond: 0 })
  return moment().isSameOrBefore(datetime3AM) ?
    datetime3AM : datetime3AM.add(1, 'd')
}

export type IntentWlan = {
  name: string
  ssid: string
}

type TransitionIntentMetadata = {
  scheduledAt: string
  applyScheduledAt?: string
  wlans?: IntentWlan[]
  preferences?: {
    crrmFullOptimization: boolean
  }
}

export type TransitionIntentItem = {
  id: string
  displayStatus: displayStates
  updatedAt?: string
  statusTrail?: StatusTrail
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

const getCancelTransitionStatus = (
  displayStatus: displayStates,
  statusTrail?: StatusTrail,
  metadata?:TransitionIntentMetadata) => {
  if ([displayStates.scheduled, displayStates.scheduledOneClick].includes(displayStatus)) {
    return { status: statuses.new, statusReason: null }
  }
  const preStatusTrail = statusTrail?.[1]
  if (preStatusTrail) {
    return preStatusTrail?.status === statuses.applyScheduled &&
   moment().isAfter(moment(metadata?.applyScheduledAt)) ?
      { status: statuses.active, statusReason: null } :
      { status: preStatusTrail.status, statusReason: preStatusTrail.statusReason ?? null }
  }
  throw new Error('Invalid statusTrail(Cancel)')

}

const getResumeTransitionStatus = (
  displayStatus: displayStates,
  updatedAt?: string,
  statusTrail?: StatusTrail,
  metadata?:TransitionIntentMetadata) => {
  const preStatusTrail = statusTrail?.[1]
  if (!preStatusTrail) throw new Error('Invalid statusTrail(Resume)')

  if (displayStatus === displayStates.pausedApplyFailed) {
    return { status: statuses.active, statusReason: null }
  } else if (displayStatus === displayStates.pausedFromActive) {
    return preStatusTrail.status === statuses.applyScheduled &&
      moment().isAfter(moment(metadata?.scheduledAt)) ?
      { status: statuses.active, statusReason: null } :
      { status: preStatusTrail.status, statusReason: preStatusTrail.statusReason ?? null }

  } else if (
    [displayStates.pausedRevertFailed, displayStates.pausedReverted].includes(displayStatus) ||
    preStatusTrail?.statusReason === statusReasons.waitingForEtl ||
    moment(updatedAt).isAfter(moment().add(-1, 'd'))) {
    return { status: statuses.na, statusReason: statusReasons.waitingForEtl }
  }
  return { status: preStatusTrail.status, statusReason: preStatusTrail.statusReason ?? null }

}

export const getTransitionStatus =(
  action: Actions,
  displayStatus: displayStates,
  statusTrail?: StatusTrail,
  metadata?: TransitionIntentMetadata,
  updatedAt?: string
):
{ status: string; statusReason: string | null } => {
  switch (action) {
    case Actions.One_Click_Optimize:
      return { status: statuses.scheduled, statusReason: statusReasons.oneClick }
    case Actions.Optimize:
      return [displayStates.applyScheduled, displayStates.active].includes(displayStatus) ?
        { status: statuses.active, statusReason: null } :
        { status: statuses.scheduled, statusReason: null }
    case Actions.Revert:
      return { status: statuses.revertScheduled, statusReason: null }
    case Actions.Pause:
      return [displayStates.applyScheduled, displayStates.active].includes(displayStatus) ?
        { status: statuses.paused, statusReason: statusReasons.fromActive } :
        { status: statuses.paused, statusReason: statusReasons.fromInactive }
    case Actions.Cancel:
      return getCancelTransitionStatus(displayStatus, statusTrail, metadata)
    case Actions.Resume:
      return getResumeTransitionStatus(displayStatus, updatedAt, statusTrail, metadata)
    default:
      throw new Error(`Invalid action:${action}`)
  }
}

export type OptimizeAllItemMutationPayload = {
  id: string
  metadata: TransitionIntentMetadata
}

export type TransitionMutationPayload = {
  id: string
  displayStatus: displayStates
}

const buildTransitionGQL = (index:number, includeMetadata:boolean) => `t${index}: transition(
  id: $id${index}, status: $status${index}, statusReason: $statusReason${index},
   ${includeMetadata? 'metadata: $metadata'+index : ''}) {
    success
    errorMsg
    errorCode
  }`

export const parseTransitionGQLByOneClick = (optimizeList:OptimizeAllItemMutationPayload[]) => {
  const { status, statusReason } =
  getTransitionStatus(Actions.One_Click_Optimize, displayStates.new)
  const paramsGQL:string[] = []
  const transitionsGQLs:string[] = []
  const variables:Record<string, string|TransitionIntentMetadata|null> = {}
  optimizeList.forEach((item, index) => {
    const currentIndex = index + 1
    const { id, metadata } = item
    paramsGQL.push(
      `$id${currentIndex}:String!, $status${currentIndex}:String!, \n
      $statusReason${currentIndex}:String, $metadata${currentIndex}:JSON`
    )
    transitionsGQLs.push(buildTransitionGQL(currentIndex, true))
    variables[`id${currentIndex}`] = id
    variables[`status${currentIndex}`] = status
    variables[`statusReason${currentIndex}`] = statusReason
    variables[`metadata${currentIndex}`] = metadata
  })
  return { paramsGQL,transitionsGQLs, variables } as {
    paramsGQL:string[],
    transitionsGQLs:string[],
    variables: Record<string, string|TransitionIntentMetadata> }
}

export const parseTransitionGQLByAction = (action: Actions, data: TransitionIntentItem[]) => {
  const paramsGQL:string[] = []
  const transitionsGQLs:string[] = []
  const variables:Record<string, string|TransitionIntentMetadata|null> = {}
  const includeMetadata = action === Actions.Revert
  data.forEach((item, index) => {
    const currentIndex = index + 1
    const { id, displayStatus, updatedAt, statusTrail, metadata } = item
    const { status, statusReason } = getTransitionStatus(
      action,
      displayStatus,
      statusTrail,
      metadata,
      updatedAt)
    paramsGQL.push(
      `$id${currentIndex}:String!, $status${currentIndex}:String!, \n
      $statusReason${currentIndex}:String, \n
      ${includeMetadata? '$metadata'+currentIndex+':JSON': ''}`
    )
    transitionsGQLs.push(buildTransitionGQL(currentIndex, includeMetadata))
    variables[`id${currentIndex}`] = id
    variables[`status${currentIndex}`] = status
    variables[`statusReason${currentIndex}`] = statusReason
    if (includeMetadata) variables[`metadata${currentIndex}`] = metadata ?? null
  })
  return { paramsGQL,transitionsGQLs, variables } as {
    paramsGQL:string[],
    transitionsGQLs:string[],
    variables: Record<string, string|TransitionIntentMetadata|null> }
}