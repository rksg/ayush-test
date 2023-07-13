import { TimeStamp } from '@acx-ui/types'


export type Meeting = {
  id: number
  name: string
  zoomMeetingId: number
  status: string
  invalidReason: string
  joinUrl: string
  participantCount: number
  mos: number
  createdTime: TimeStamp
  startTime: TimeStamp
}

export type VideoCallQoeTest = {
  id: number
  name: string
  meetings: Meeting[]
}

export interface Response {
  getAllCallQoeTests : VideoCallQoeTest []
}

export type TestDetails = {
  name: string
  link: string
}

export interface DetailedResponse {
  getAllCallQoeTests : {
    id: number,
    name: string,
    meetings:
    {
      id:number,
      zoomMeetingId: number,
      status: string,
      invalidReason: string,
      joinUrl:string,
      participantCount:number,
      mos:number,
      createdTime: TimeStamp,
      startTime: TimeStamp,
      endTime: TimeStamp
      participants: Participants[]
    } []
  } []
}
export interface WifiMetrics {
  rss: number | null
  snr: number | null
  avgTxMCS: number | null
  throughput: number| null
}
export interface Participants{
  id: number
  userName: string
  hostname: string
  networkType: string
  macAddress: string
  device: string
  ipAddress: string
  joinTime: TimeStamp
  leaveTime: TimeStamp
  leaveReason: string
  apDetails: {
    system: string | null
    domains: string | null
    zone: string | null
    apGroup: string | null
    apName: string | null
    apMac: string | null
    apSerial: string | null
    ssid: string | null
    radio: string | null
  } | null
  wifiMetrics: WifiMetrics | null
  callMetrics: {
    date_time: TimeStamp
    jitter: {
      audio: {
        rx: number | null
        tx: number | null
      }
      video: {
        tx: number | null
        rx: number | null
      }
    }
    latency: {
      audio: {
        rx: number | null
        tx: number | null
      }
      video: {
        tx: number | null
        rx: number | null
      }
    }
    packet_loss: {
      audio: {
        rx: number | null
        tx: number | null
      }
      video: {
        tx: number | null
        rx: number | null
      }
    }
    video_frame_rate: {
      rx: number | null
      tx: number | null
    }
  }[]
}


// Client MAC Search API
export interface Client {
  hostname: string
  username: string
  mac: string
  ipAddress: string
}
export interface RequestPayload {
  start: string
  end: string
  query: string
  limit: number
}

export interface SearchResponse <T> {
  search: T
}