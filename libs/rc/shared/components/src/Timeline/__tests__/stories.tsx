/* eslint-disable no-useless-escape */
import { TimelineItem } from '../index'

export const sample = [
  {
    id: 'AddVenue',
    status: 'SUCCESS',
    startDatetime: '2022-12-20T07:55:03Z',
    endDatetime: '2022-12-20T07:55:04Z',
    description: 'AddVenue'
  },
  {
    id: 'AddVenue',
    status: 'FAIL',
    startDatetime: '2022-12-20T08:00:00Z',
    endDatetime: '2022-12-20T08:05:00Z',
    description: 'AddVenue',
    error: '"{\"requestId\":\"1\",\"errors\":[\"{\\\"code\\"}\"]}"',
    children: <div style={{ border: '1px solid black' }}>
      { new Array(3).fill(0).map((_, i) => <p key={i}>More fail content</p>) }
    </div>
  },
  {
    id: 'UpdateSwitchPosition',
    status: 'INPROGRESS',
    startDatetime: '2022-12-20T08:02:00Z',
    description: 'UpdateSwitchPosition',
    children: <div style={{ border: '1px solid black' }}>
      { new Array(5).fill(0).map((_, i) => <p key={i}>More content</p>) }
    </div>
  },
  {
    id: 'UpdateSwitchPosition',
    status: 'INPROGRESS',
    startDatetime: '2022-12-20T08:03:00Z',
    description: 'UpdateSwitchPosition',
    children: <div style={{ border: '1px solid black' }}>
      { new Array(5).fill(0).map((_, i) => <p key={i}>More content</p>) }
    </div>
  },
  {
    id: 'AddVenue',
    status: 'PENDING',
    description: 'AddVenue'
  }
] as TimelineItem[]