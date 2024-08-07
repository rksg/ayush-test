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

export enum statusReasons {
  applyFailed = 'apply-failed',
  revertFailed = 'revert-failed',
  reverted = 'reverted',
  fromActive = 'from-active',
  fromInactive = 'from-inactive',
  byDefault = 'by-default',
  conflictingConfiguration = 'conflicting-configuration',
  noAps = 'no-aps',
  notEnoughLicense = 'not-enough-license',
  notEnoughData = 'not-enough-data',
  verified = 'verified',
  waitingForEtl = 'waiting-for-etl',
  oneClick = 'one-click'
}

export enum displayStates {
  naConflictingConfiguration = statuses.na + '-' + statusReasons.conflictingConfiguration,
  naNoAps = statuses.na + '-' + statusReasons.noAps,
  naNotEnoughLicense = statuses.na + '-' + statusReasons.notEnoughLicense,
  naNotEnoughData = statuses.na + '-' + statusReasons.notEnoughData,
  naVerified = statuses.na + '-' + statusReasons.verified,
  naWaitingForEtl = statuses.na + '-' + statusReasons.waitingForEtl,
  new = statuses.new,
  active = statuses.active,
  pausedFromInactive = statuses.paused + '-' + statusReasons.fromInactive,
  pausedFromActive = statuses.paused + '-' + statusReasons.fromActive,
  pausedByDefault = statuses.paused + '-' + statusReasons.byDefault,
  pausedApplyFailed = statuses.paused + '-' + statusReasons.applyFailed,
  pausedRevertFailed = statuses.paused + '-' + statusReasons.revertFailed,
  pausedReverted = statuses.paused + '-' + statusReasons.reverted,
  scheduled = statuses.scheduled,
  scheduledOneClick = statuses.scheduled + '-' + statusReasons.oneClick,
  applyScheduled = statuses.applyScheduled,
  applyScheduleInProgress = statuses.applyScheduleInProgress,
  revertScheduled = statuses.revertScheduled,
  revertScheduleInProgress = statuses.revertScheduleInProgress
}
