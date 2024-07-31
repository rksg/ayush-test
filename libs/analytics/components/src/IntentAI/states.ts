export enum statuses {
  NA = 'na',
  New = 'new',
  Active = 'active',
  Paused = 'paused',
  Scheduled = 'scheduled',
  ApplyScheduled = 'applyscheduled',
  ApplyScheduleInProgress = 'applyscheduleinprogress',
  RevertScheduled = 'revertscheduled',
  RevertScheduleInProgress = 'revertscheduleinprogress'
}

export enum reasons {
  ApplyFailed = 'apply-failed',
  RevertFailed = 'revert-failed',
  Reverted = 'reverted',
  FromActive = 'from-active',
  FromInactive = 'from-inactive',
  ByDefault = 'by-default',
  ConflictingConfiguration = 'conflicting-configuration',
  NoAps = 'no-aps',
  NotEnoughLicense = 'not-enough-license',
  NotEnoughData = 'not-enough-data',
  Verified = 'verified',
  WaitingForEtl = 'waiting-for-etl',
  OneClick = 'one-click'
}

export enum statusReasons {
  NAConflictingConfiguration = statuses.NA + '-' + reasons.ConflictingConfiguration,
  NANoAps = statuses.NA + '-' + reasons.NoAps,
  NANotEnoughLicense = statuses.NA + '-' + reasons.NotEnoughLicense,
  NANotEnoughData = statuses.NA + '-' + reasons.NotEnoughData,
  NAVerified = statuses.NA + '-' + reasons.Verified,
  NAWaitingForEtl = statuses.NA + '-' + reasons.WaitingForEtl,
  New = statuses.New,
  Active = statuses.Active,
  PausedFromInactive = statuses.Paused + '-' + reasons.FromInactive,
  PausedFromActive = statuses.Paused + '-' + reasons.FromActive,
  PausedByDefault = statuses.Paused + '-' + reasons.ByDefault,
  PausedApplyFailed = statuses.Paused + '-' + reasons.ApplyFailed,
  PausedRevertFailed = statuses.Paused + '-' + reasons.RevertFailed,
  PausedReverted = statuses.Paused + '-' + reasons.Reverted,
  Scheduled = statuses.Scheduled,
  ScheduledOneClick = statuses.Scheduled + '-' + reasons.OneClick,
  ApplyScheduled = statuses.ApplyScheduled,
  ApplyScheduleInProgress = statuses.ApplyScheduleInProgress,
  RevertScheduled = statuses.RevertScheduled,
  RevertScheduleInProgress = statuses.RevertScheduleInProgress
}
