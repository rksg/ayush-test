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
    children: <div style={{ border: '1px solid black' }}>
      { new Array(3).fill(0).map((_, i) => <p key={i}>More content</p>) }
    </div>
  }
] as TimelineItem[]

storiesOf('Timeline', module)
  .add('Basic', () => <Timeline items={sample}/>)

export {}
