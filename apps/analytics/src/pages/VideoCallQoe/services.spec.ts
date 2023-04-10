import '@testing-library/jest-dom'

import { store, videoCallQoeURL } from '@acx-ui/store'
import { mockGraphqlQuery }       from '@acx-ui/test-utils'

import { api } from './services'

describe('videoCallQoeApi', () => {
  const expectedResponse = {
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

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('api should return populated data', async () => {
    mockGraphqlQuery(videoCallQoeURL,'CallQoeTests', {
      data: expectedResponse
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.videoCallQoeTests.initiate(null))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(expectedResponse)
  })
  it('api should return empty data', async () => {
    mockGraphqlQuery(videoCallQoeURL,'CallQoeTests', {
      data: {}
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.videoCallQoeTests.initiate(null))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual({})
  })
  it('api should return error', async () => {
    mockGraphqlQuery(videoCallQoeURL,'CallQoeTests', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.videoCallQoeTests.initiate(null))

    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
