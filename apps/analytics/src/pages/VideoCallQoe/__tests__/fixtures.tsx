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


export const getAllCallQoeTestsResponse = {
  getAllCallQoeTests:
  [
    {
      id: 6,
      name: 'testname',
      meetings: [
        {
          id: 6,
          zoomMeetingId: '92334125972',
          status: 'INVALID',
          invalidReason: 'ZOOM_CALL_NO_PARTICIPANT_ON_WIFI',
          joinUrl: 'https://zoom.us/j/92334125972?pwd=dG1iNFZNa2dNNW9veHpGNVpKV2FlZz09',
          participantCount: 0,
          mos: null,
          createdTime: '2022-11-10T11:18:05.000Z',
          startTime: null
        }
      ]
    }
  ]
}