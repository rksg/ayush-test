export * from './RTKQuery'

export type TimeStamp = string | number
export type TimeStampRange = [TimeStamp, TimeStamp]

export type TimelineStatus = 'PENDING' | 'INPROGRESS' | 'SUCCESS' | 'FAIL'
