import { TimeStamp } from '@acx-ui/types'


export type Meeting = {
  id: number,
  name: string
  zoomMeetingId: number,
  status: string,
  invalidReason: string,
  joinUrl: string,
  participantCount: number,
  mos: number,
  createdTime: TimeStamp,
  startTime: TimeStamp
}
