import React from 'react'

import { storiesOf } from '@storybook/react'

import { Timeline, TimelineItem } from '.'

export const sample = [
  {
    status: 'PENDING',
    description: 'AddVenue'
  },
  {
    status: 'INPROGRESS',
    startDatetime: '2022-12-20T04:27:30Z',
    description: 'UpdateSwitchPosition',
    children: <div style={{ border: '1px solid black' }}>
      { new Array(5).fill(0).map((_, i) => <p key={i}>More content</p>) }
    </div>
  },
  {
    status: 'SUCCESS',
    startDatetime: '2022-12-20T09:55:03Z',
    endDatetime: '2022-12-20T09:55:04Z',
    description: 'AddVenue'
  },
  {
    status: 'FAIL',
    startDatetime: '2022-12-20T09:55:03Z',
    endDatetime: '2022-12-20T09:55:04Z',
    description: 'AddVenue',
    error: '"{\"requestId\":\"1\",\"errors\":[\"{\\\"code\\"}\"]}"',
    children: <div style={{ border: '1px solid black' }}>
      { new Array(3).fill(0).map((_, i) => <p key={i}>More fail content</p>) }
    </div>
  }
] as TimelineItem[]

export const sampleFail = [
  {
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
    status: 'INPROGRESS',
    startDatetime: '2022-12-20T08:02:00Z',
    description: 'UpdateSwitchPosition',
    children: <div style={{ border: '1px solid black' }}>
      { new Array(5).fill(0).map((_, i) => <p key={i}>More content</p>) }
    </div>
  },
  {
    status: 'INPROGRESS',
    startDatetime: '2022-12-20T08:03:00Z',
    description: 'UpdateSwitchPosition',
    children: <div style={{ border: '1px solid black' }}>
      { new Array(5).fill(0).map((_, i) => <p key={i}>More content</p>) }
    </div>
  },
  {
    status: 'INPROGRESS',
    startDatetime: '2022-12-20T08:04:00Z',
    description: 'UpdateSwitchPosition',
    children: <div style={{ border: '1px solid black' }}>
      { new Array(5).fill(0).map((_, i) => <p key={i}>More content</p>) }
    </div>
  }
] as TimelineItem[]

storiesOf('Timeline', module)
  .add('Basic', () => <Timeline items={sample}/>)

export {}
