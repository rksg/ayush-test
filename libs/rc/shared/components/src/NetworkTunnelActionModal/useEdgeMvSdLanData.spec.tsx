import { rest } from 'msw'

import { EdgeSdLanUrls, EdgeSdLanFixtures, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { Provider }                                          from '@acx-ui/store'
import { mockServer, renderHook, waitFor }                   from '@acx-ui/test-utils'

import { mockVlanPoolList }   from './__tests__/fixtures'
import { useEdgeMvSdLanData } from './useEdgeMvSdLanData'


const { mockedMvSdLanDataList } = EdgeSdLanFixtures

jest.mock('../useEdgeActions', () => ({
  ...jest.requireActual('../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true)
}))
const services = require('@acx-ui/rc/services')

const mockedReqFn = jest.fn()
const mockedReqVlanPool = jest.fn()

describe('NetworkTunnelActionModal - useEdgeSdLanData', () => {
  beforeEach(() => {
    mockedReqFn.mockReset()
    mockedReqVlanPool.mockReset()

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => {
          mockedReqFn()
          return res(ctx.json({ data: mockedMvSdLanDataList }))
        })
    )

    services.useGetVLANPoolPolicyViewModelListQuery = jest.fn()
      .mockImplementation((_reqArgs, options) => {
        if (options.skip) {
          return {
            networkVlanPool: undefined,
            isLoading: false,
            isFetching: false
          }
        } else {
          mockedReqVlanPool(options)
          return {
            networkVlanPool: mockVlanPoolList[0],
            isLoading: false,
            isFetching: false
          }
        }
      })
  })

  it('should correctly response data', async () => {
    const { result } = renderHook(() => useEdgeMvSdLanData({
      id: 'mock-network',
      type: NetworkTypeEnum.AAA,
      venueId: 'mock-venue'
    }), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    await waitFor(() => expect(result.current.venueSdLan?.id).toBe(mockedMvSdLanDataList[0].id))
    const vlanPool = result.current.networkVlanPool
    await waitFor(() => expect(vlanPool?.id).toBe(mockVlanPoolList[0].id))
  })

  it('should not trigger API when network is undefined', () => {
    const { result } = renderHook(() => useEdgeMvSdLanData(undefined), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    expect(result.current.venueSdLan).toStrictEqual(undefined)
    expect(mockedReqFn).toBeCalledTimes(0)
    expect(mockedReqVlanPool).toBeCalledTimes(0)
  })
})