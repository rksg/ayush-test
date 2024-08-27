import { rest } from 'msw'

import { EdgeSdLanUrls, EdgeSdLanFixtures, VlanPoolRbacUrls } from '@acx-ui/rc/utils'
import { Provider }                                           from '@acx-ui/store'
import { mockServer, renderHook, waitFor }                    from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { mockVlanPoolList }   from './__tests__/fixtures'
import { useEdgeMvSdLanData } from './useEdgeMvSdLanData'


const { mockedMvSdLanDataList } = EdgeSdLanFixtures

jest.mock('../useEdgeActions', () => ({
  ...jest.requireActual('../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true)
}))
const services = require('@acx-ui/rc/services')

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

    await waitFor(() => expect(result.current.allSdLans.length).toBe(mockedMvSdLanDataList.length))
    expect(mockedReqFn).toBeCalledTimes(1)
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
    const mockedReqVlanPool = jest.fn()
    mockServer.use(
      rest.post(
        VlanPoolRbacUrls.getVLANPoolPolicyList.url,
        (_, res, ctx) => {
          mockedReqVlanPool()
          return res(ctx.json({ data: mockVlanPoolList }))
        }
      )
    )

    const { result } = renderHook(() => useEdgeMvSdLanData({ sdLanQueryOptions: { skip: true } }), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    expect(result.current.allSdLans).toStrictEqual([])
    expect(mockedReqFn).toBeCalledTimes(0)
    expect(mockedReqVlanPool).toBeCalledTimes(0)
  })

  it('should query vlanPool data when networkId is given', async () => {
    services.useGetVLANPoolPolicyViewModelListQuery = jest.fn().mockImplementation(() => {
      return {
        networkVlanPool: mockVlanPoolList[0],
        isLoading: false,
        isFetching: false
      }
    })

    const { result } = renderHook(() => useEdgeMvSdLanData({
      sdLanQueryOptions: { skip: true },
      networkId: 'network_4'
    }), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    await waitFor(() => expect(result.current.networkVlanPool).not.toBeUndefined())
    expect(result.current.allSdLans).toStrictEqual([])
    expect(mockedReqFn).toBeCalledTimes(0)
  })
})