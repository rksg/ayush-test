export const createTestResponse = {
  createCallQoeTest: {
    id: 85,
    name: 'Test 1.2',
    meetings: [
      {
        zoomMeetingId: '94882688780',
        joinUrl: 'https://zoom.us/j/94882688780?pwd=d2MxWW5PbDlvaGlPNVVXVFVJcGIxUT09'
      }
    ]
  }
}

export const deleteTestResponse = {
  deleteCallQoeTest: true
}

export const getAllCallQoeTests = {
  getAllCallQoeTests: [
    {
      id: 13,
      name: 'ACX_test',
      meetings: [
        {
          id: 13,
          zoomMeetingId: '94909091023',
          status: 'ENDED',
          invalidReason: null,
          joinUrl: 'https://zoom.us/j/94909091023?pwd=UU1tT0FBRHZvdkhEY2wxSTZwMEJwZz09',
          participantCount: 2,
          mos: 4.6,
          createdTime: '2023-04-06T09:55:41.000Z',
          startTime: '2023-04-06T09:56:21.000Z'
        }
      ]
    },
    {
      id: 74,
      name: 'Test call',
      meetings: [
        {
          id: 74,
          zoomMeetingId: '97992181330',
          status: 'INVALID',
          invalidReason: 'ZOOM_CALL_NO_PARTICIPANT_ON_WIFI',
          joinUrl: 'https://zoom.us/j/97992181330?pwd=VXZ4YWZlZkJRZlg1QmtwazJtcVhRdz09',
          participantCount: 0,
          mos: null,
          createdTime: '2023-04-12T09:56:58.000Z',
          startTime: null
        }
      ]
    },
    {
      id: 57,
      name: 'Asraf - Test1',
      meetings: [
        {
          id: 57,
          zoomMeetingId: '98908385463',
          status: 'ENDED',
          invalidReason: null,
          joinUrl: 'https://zoom.us/j/98908385463?pwd=bkErOUIxc0tPSVJVYWlJVWI5bWJtZz09',
          participantCount: 2,
          mos: 3.3,
          createdTime: '2023-04-11T04:39:28.000Z',
          startTime: '2023-04-11T04:40:20.000Z'
        }
      ]
    }
  ],
  noData: []
}

export const getAllCallQoeTestsWithNotStarted = {
  getAllCallQoeTests:
  [
    {
      id: 90,
      name: 'test 1.4',
      meetings: [
        {
          id: 90,
          zoomMeetingId: '94194732704',
          status: 'NOT_STARTED',
          invalidReason: null,
          joinUrl: 'https://zoom.us/j/94194732704?pwd=QmNPMC9qaVViMGZwTjErZmpJdGM5QT09',
          participantCount: null,
          mos: null,
          createdTime: '2023-04-19T10:29:00.000Z',
          startTime: null
        }
      ]
    }
  ]
}