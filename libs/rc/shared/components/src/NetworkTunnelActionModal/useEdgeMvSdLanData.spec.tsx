import { rest } from 'msw'

import { EdgeSdLanUrls, EdgeSdLanFixtures } from '@acx-ui/rc/utils'
import { Provider }                         from '@acx-ui/store'
import { mockServer, renderHook, waitFor }  from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { useEdgeMvSdLanData } from './useEdgeMvSdLanData'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures

jest.mock('../useEdgeActions', () => ({
  ...jest.requireActual('../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true)
}))

const mockedReqFn = jest.fn()
describe('NetworkTunnelActionModal - useEdgeSdLanData', () => {
  beforeEach(() => {
    mockedReqFn.mockReset()

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => {
          mockedReqFn()
          return res(ctx.json({ data: mockedMvSdLanDataList }))
        }
      )
    )
  })

  it('should correctly response data', async () => {
    const { result } = renderHook(() => useEdgeMvSdLanData(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    await waitFor(() => expect(mockedReqFn).toBeCalledTimes(1))
    expect(result.current.allSdLans.length).toBe(mockedMvSdLanDataList.length)
    const networkVenueId = mockedMvSdLanDataList[0].tunneledWlans![0].venueId
    const venueSdlan = result.current.getVenueSdLan(networkVenueId)
    expect(venueSdlan?.id).toBe(mockedMvSdLanDataList[0].id)
  })

  it('should not trigger API when FF is not on', () => {
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
    const { result } = renderHook(() => useEdgeMvSdLanData(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    expect(result.current.allSdLans).toStrictEqual([])
    expect(mockedReqFn).toBeCalledTimes(0)
  })

  it('should not trigger API when skip is true', () => {
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
    const { result } = renderHook(() => useEdgeMvSdLanData({ skip: true }), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    expect(result.current.allSdLans).toStrictEqual([])
    expect(mockedReqFn).toBeCalledTimes(0)
  })
})