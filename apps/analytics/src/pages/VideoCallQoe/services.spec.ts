import '@testing-library/jest-dom'

import { store, Provider ,videoCallQoeURL }                                  from '@acx-ui/store'
import { act, mockGraphqlMutation,  mockGraphqlQuery,  renderHook, waitFor } from '@acx-ui/test-utils'

import { createTestResponse, deleteTestResponse, callQoeTestDetailsFixtures1 }                                  from './__tests__/fixtures'
import { api, useCreateCallQoeTestMutation, useDeleteCallQoeTestMutation, useUpdateCallQoeParticipantMutation } from './services'

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

  describe('getAllCallQoeTest end point', ()=>{
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

  it('createCallQoeTest api should create a test', async () => {
    mockGraphqlMutation(videoCallQoeURL, 'CreateVideoCallQoeTest', { data: createTestResponse })
    const { result } = renderHook(() => useCreateCallQoeTestMutation(),
      { wrapper: Provider })
    act(() => {
      result.current[0]({ name: 'test call' })
    })
    await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
    expect(result.current[1].data)
      .toEqual(createTestResponse.createCallQoeTest)
  })

  it('deleteCallQoeTest api should delete a test', async () => {
    mockGraphqlMutation(videoCallQoeURL, 'DeleteVideoCallQoeTest', { data: deleteTestResponse })
    const { result } = renderHook(() => useDeleteCallQoeTestMutation(),
      { wrapper: Provider })
    act(() => {
      result.current[0]({ id: 1 })
    })
    await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
    expect(result.current[1].data).toEqual(true)
  })

  it('updateCallQoeParticipant api should update the participant mac address', async () => {
    mockGraphqlMutation(videoCallQoeURL, 'UpdateCallQoeParticipant',
      { data: { updateCallQoeParticipant: 1 } })
    const { result } = renderHook(() => useUpdateCallQoeParticipantMutation(),
      { wrapper: Provider })
    act(() => {
      result.current[0]({ participantId: 1, macAddr: 'some-mac' })
    })
    await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
    expect(result.current[1].data).toBe(1)
  })

})

describe('videoCallQoeTestDetails', () => {
  beforeEach(() => store.dispatch(api.util.resetApiState()))
  const payload = { testId: 1, status: 'ENDED' }

  it('api should return populated data', async () => {
    mockGraphqlQuery(videoCallQoeURL,'CallQoeTestDetails', {
      data: callQoeTestDetailsFixtures1
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.videoCallQoeTestDetails.initiate(payload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(callQoeTestDetailsFixtures1)
  })
  it('api should return empty data', async () => {
    mockGraphqlQuery(videoCallQoeURL,'CallQoeTestDetails', {
      data: {}
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.videoCallQoeTestDetails.initiate(payload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual({})
  })
  it('api should return error', async () => {
    mockGraphqlQuery(videoCallQoeURL,'CallQoeTestDetails', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.videoCallQoeTestDetails.initiate(payload))

    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
