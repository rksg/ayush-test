export enum CRRMStates {
  optimized = 'optimized',
  nonOptimized = 'nonOptimized',
  verified = 'verified',
  insufficientLicenses = 'insufficientLicenses',
  unqualifiedZone = 'unqualifiedZone',
  noAps = 'noAps',
  verificationError = 'verificationError'
}

export const states = {
  new: 'new',
  applyScheduled: 'applyscheduled',
  applyScheduleInProgress: 'applyscheduleinprogress',
  applied: 'applied',
  applyFailed: 'applyfailed',
  beforeApplyInterrupted: 'beforeapplyinterrupted',
  afterApplyInterrupted: 'afterapplyinterrupted',
  applyWarning: 'applywarning',
  revertScheduled: 'revertscheduled',
  revertScheduleInProgress: 'revertscheduleinprogress',
  revertFailed: 'revertfailed',
  reverted: 'reverted',
  deleted: 'deleted'
} as const
