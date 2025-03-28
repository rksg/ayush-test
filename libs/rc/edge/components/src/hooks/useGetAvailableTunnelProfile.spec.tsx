import { renderHook } from '@testing-library/react'
import { cloneDeep }  from 'lodash'
import { rest }       from 'msw'

import { EdgePinFixtures, EdgePinUrls, EdgeSdLanFixtures, EdgeSdLanUrls, EdgeTunnelProfileFixtures, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                                                     from '@acx-ui/store'
import { mockServer }                                                                                                   from '@acx-ui/test-utils'

import { useGetAvailableTunnelProfile } from './useGetAvailableTunnelProfile'

const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures
const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const { mockPinStatsList } = EdgePinFixtures
const modifiedMockSdLanDataList = cloneDeep(mockedMvSdLanDataList)
modifiedMockSdLanDataList[0].tunnelProfileId = mockedTunnelProfileViewData.data[0].id
const modifiedMockPinStatsList = cloneDeep(mockPinStatsList)
modifiedMockPinStatsList.data[0].vxlanTunnelProfileId = mockedTunnelProfileViewData.data[1].id

describe('useGetAvailableTunnelProfile', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(EdgeSdLanUrls.getEdgeSdLanViewDataList.url, (_, res, ctx) => {
        return res(ctx.json({ data: modifiedMockSdLanDataList }))
      }),
      rest.post(EdgePinUrls.getEdgePinStatsList.url, (_, res, ctx) => {
        return res(ctx.json(modifiedMockPinStatsList))
      }),
      rest.post(TunnelProfileUrls.getTunnelProfileViewDataList.url, (_, res, ctx) => {
        return res(ctx.json(mockedTunnelProfileViewData))
      })
    )
  })

  it('should return the available tunnel profiles', () => {
    const { result } = renderHook(() => useGetAvailableTunnelProfile(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })

    expect(result.current.availableTunnelProfiles.length).toBe(2)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelProfiles[0].id).toBe(mockedTunnelProfileViewData.data[2].id)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelProfiles[1].id).toBe(mockedTunnelProfileViewData.data[3].id)
  })

  it('should return the correct available tunnel profiles when sdLanServiceId is provided', () => {
    const { result } = renderHook(() =>
      useGetAvailableTunnelProfile({ sdLanServiceId: modifiedMockSdLanDataList[0].id }), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })

    expect(result.current.availableTunnelProfiles.length).toBe(3)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelProfiles[0].id).toBe(mockedTunnelProfileViewData.data[0].id)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelProfiles[1].id).toBe(mockedTunnelProfileViewData.data[2].id)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelProfiles[2].id).toBe(mockedTunnelProfileViewData.data[3].id)
  })
})
