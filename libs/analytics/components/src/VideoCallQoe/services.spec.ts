import '@testing-library/jest-dom'

import { store, Provider, r1VideoCallQoeURL, dataApiSearchURL }            from '@acx-ui/store'
import { act, mockGraphqlMutation, mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import { createTestResponse, deleteTestResponse, callQoeTestDetailsFixtures1, searchClientsFixture } from './__tests__/fixtures'
import {
  api,
  clientSearchApi,
  useCreateCallQoeTestMutation,
  useDeleteCallQoeTestMutation,
  useUpdateCallQoeParticipantMutation
} from './services'

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

  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    store.dispatch(clientSearchApi.util.resetApiState())
  })

  describe('getAllCallQoeTest end point', () => {
    it('api should return populated data', async () => {
      mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTests', {
        data: expectedResponse
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.videoCallQoeTests.initiate(null))

      expect(error).toBeUndefined()
      expect(status).toBe('fulfilled')
      expect(data).toMatchObject(expectedResponse)
    })
    it('api should return empty data', async () => {
      mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTests', {
        data: {}
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.videoCallQoeTests.initiate(null))

      expect(error).toBeUndefined()
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual({})
    })
    it('api should return error', async () => {
      mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTests', {
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
    mockGraphqlMutation(r1VideoCallQoeURL, 'CreateVideoCallQoeTest', { data: createTestResponse })
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
    mockGraphqlMutation(r1VideoCallQoeURL, 'DeleteVideoCallQoeTest', { data: deleteTestResponse })
    const { result } = renderHook(() => useDeleteCallQoeTestMutation(),
      { wrapper: Provider })
    act(() => {
      result.current[0]({ id: 1 })
    })
    await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
    expect(result.current[1].data).toEqual(true)
  })

  it('updateCallQoeParticipant api should update the participant mac address', async () => {
    mockGraphqlMutation(r1VideoCallQoeURL, 'UpdateCallQoeParticipant',
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
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    store.dispatch(clientSearchApi.util.resetApiState())
  })
  const payload = { testId: 1, status: 'ENDED' }
  const searchPayload = {
    start: '2023-04-06T15:26:21+05:30',
    end: '2023-04-06T15:29:48+05:30',
    query: 'sometext',
    limit: 100
  }

  it('api should return populated data', async () => {
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTestDetails', {
      data: callQoeTestDetailsFixtures1
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.videoCallQoeTestDetails.initiate(payload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(callQoeTestDetailsFixtures1)
  })
  it('api should return empty data', async () => {
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTestDetails', {
      data: {}
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.videoCallQoeTestDetails.initiate(payload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual({})
  })
  it('api should return error', async () => {
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTestDetails', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.videoCallQoeTestDetails.initiate(payload))

    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })

  it('search api should return the data', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: searchClientsFixture
    })
    const { status, data, error } = await store.dispatch(
      clientSearchApi.endpoints.searchClients.initiate(searchPayload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject([
      {
        hostname: 'IT', ipAddress: '10.174.116.111',
        mac: 'A8:64:F1:1A:D0:33', username: 'DPSK_User_8709'
      },
      {
        hostname: 'DESKTOP-K1PAM9U', ipAddress: '10.174.116.121',
        mac: 'D0:C6:37:D7:52:80', username: 'd0c637d75280'
      },
      {
        hostname: 'e0:d4:64:05:7d:4b', ipAddress: '10.174.116.216',
        mac: 'E0:D4:64:05:7D:4B', username: 'e0d464057d4b' }
    ])
  })
})
