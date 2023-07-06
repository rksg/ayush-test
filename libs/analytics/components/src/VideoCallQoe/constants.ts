
export const NOT_STARTED = 'Not Started'
export const STARTED = 'Started'
export const ENDED = 'Ended'
export const INVALID = 'Invalid'

export const rssGroups = {
  good: { lower: -74 },
  average: { lower: -85, upper: -75 },
  bad: { upper: -86 }
}

export const zoomStatsThresholds = {
  JITTER: 40,
  LATENCY: 150,
  PACKET_LOSS: 2,
  VIDEO_FRAME_RATE: 15
}
