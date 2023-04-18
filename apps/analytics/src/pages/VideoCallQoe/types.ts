import { TimeStamp } from '@acx-ui/types'


type Meeting = {
  id: number
  zoomMeetingId: number
  status: string
  invalidReason: string
  joinUrl: string
  participantCount: number
  mos: number
  createdTime: TimeStamp
  startTime: TimeStamp
}

type VideoCallQoeTest = {
  id: number
  name: string
  meetings: Meeting[]
}

export interface Response {
  getAllCallQoeTests : VideoCallQoeTest []
}

export interface CreateVideoCallQoeTestResponse {
    id: number,
    name: string
    meetings: Meeting[]
}
