export enum statuses {
  na = 'na',
  new = 'new',
  active = 'active',
  paused = 'paused',
  scheduled = 'scheduled',
  applyScheduled = 'applyscheduled',
  applyScheduleInProgress = 'applyscheduleinprogress',
  revertScheduled = 'revertscheduled',
  revertScheduleInProgress = 'revertscheduleinprogress'
}

export enum reasons {
  applyFailed = 'apply-failed',
  revertFailed = 'revert-failed',
  reverted = 'reverted',
  fromActive = 'from-active',
  byDefault = 'by-default',
  conflictingConfiguration = 'conflicting-configuration',
  noAps = 'no-aps',
  notEnoughLicense = 'not-enough-license',
  notEnoughData = 'not-enough-data',
  verified = 'verified',
  waitingForEtl = 'waiting-for-etl',
  oneClick = 'one-click',
}

export enum statusReasons {
  naConflictingConfiguration = statuses.na + '-' + reasons.conflictingConfiguration,
  naNoAps = statuses.na + '-' + reasons.noAps,
  naNotEnoughLicense = statuses.na + '-' + reasons.notEnoughLicense,
  naNotEnoughData = statuses.na + '-' + reasons.notEnoughData,
  naVerified = statuses.na + '-' + reasons.verified,
  naWaitingForEtl = statuses.na + '-' + reasons.waitingForEtl,
  new = statuses.new,
  active = statuses.active,
  paused = statuses.paused, // TODO check if needed
  pausedFromActive = statuses.paused + '-' + reasons.fromActive,
  pausedByDefault = statuses.paused + '-' + reasons.byDefault,
  pausedApplyFailed = statuses.paused + '-' + reasons.applyFailed,
  pausedRevertFailed = statuses.paused + '-' + reasons.revertFailed,
  pausedReverted = statuses.paused + '-' + reasons.reverted,
  scheduled = statuses.scheduled,
  scheduledOneClick = statuses.scheduled + '-' + reasons.oneClick,
  applyScheduled = statuses.applyScheduled,
  applyScheduleInProgress = statuses.applyScheduleInProgress,
  revertScheduled = statuses.revertScheduled,
  revertScheduleInProgress = statuses.revertScheduleInProgress
}
