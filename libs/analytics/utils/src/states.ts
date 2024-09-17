export enum Statuses {
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

export enum StatusReasons {
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

export enum DisplayStates {
  naConflictingConfiguration = Statuses.na + '-' + StatusReasons.conflictingConfiguration,
  naNoAps = Statuses.na + '-' + StatusReasons.noAps,
  naNotEnoughLicense = Statuses.na + '-' + StatusReasons.notEnoughLicense,
  naNotEnoughData = Statuses.na + '-' + StatusReasons.notEnoughData,
  naVerified = Statuses.na + '-' + StatusReasons.verified,
  naWaitingForEtl = Statuses.na + '-' + StatusReasons.waitingForEtl,
  new = Statuses.new,
  active = Statuses.active,
  pausedFromInactive = Statuses.paused + '-' + StatusReasons.fromInactive,
  pausedFromActive = Statuses.paused + '-' + StatusReasons.fromActive,
  pausedByDefault = Statuses.paused + '-' + StatusReasons.byDefault,
  pausedApplyFailed = Statuses.paused + '-' + StatusReasons.applyFailed,
  pausedRevertFailed = Statuses.paused + '-' + StatusReasons.revertFailed,
  pausedReverted = Statuses.paused + '-' + StatusReasons.reverted,
  scheduled = Statuses.scheduled,
  scheduledOneClick = Statuses.scheduled + '-' + StatusReasons.oneClick,
  applyScheduled = Statuses.applyScheduled,
  applyScheduleInProgress = Statuses.applyScheduleInProgress,
  revertScheduled = Statuses.revertScheduled,
  revertScheduleInProgress = Statuses.revertScheduleInProgress
}
