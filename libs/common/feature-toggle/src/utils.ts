import { Features }       from './features'
import { UseSplitOnType } from './useIsSplitOn'

export const getIsBtmEventsOn = (isSplitOnFn: UseSplitOnType) =>
  [
    isSplitOnFn(Features.BTM_EVENTS_TOGGLE),
    isSplitOnFn(Features.RUCKUS_AI_BTM_EVENTS_TOGGLE)
  ].some(Boolean)