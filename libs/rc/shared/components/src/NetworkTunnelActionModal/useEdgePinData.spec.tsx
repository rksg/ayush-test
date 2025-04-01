import { groupBy } from 'lodash'
import { rest }    from 'msw'

import { EdgePinFixtures, EdgePinUrls }    from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

import {
  useEdgePinScopedNetworkVenueMap,
  useEdgePinByVenue,
  useEdgeAllPinData
} from './useEdgePinData'


const { mockPinStatsList } = EdgePinFixtures

jest.mock('../useEdgeActions', () => ({
  ...jest.requireActual('../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true)
}))

const mockedReqFn = jest.fn()

describe('NetworkTunnelActionModal - useEdgePinData', () => {
  beforeEach(() => {
    mockedReqFn.mockReset()

    mockServer.use(
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        (_req, res, ctx) => {
          mockedReqFn()
          return res(ctx.json(mockPinStatsList))
        })
    )
  })
  describe('useEdgePinScopedNetworkVenueMap', () => {
    it('should correctly response data', async () => {
      const { result } = renderHook(() => useEdgePinScopedNetworkVenueMap('mock-network'), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      await waitFor(() => expect(Object.keys(result.current).length).not.toBe(0))
      expect(result.current).toStrictEqual(groupBy(mockPinStatsList.data, 'venueId'))
    })
  })

  describe('useEdgePinByVenue', () => {
    it('should correctly response data', async () => {
      const { result } = renderHook(() => useEdgePinByVenue('mock-venue'), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      await waitFor(() => expect(result.current).not.toBeUndefined())
      expect(result.current).toStrictEqual(mockPinStatsList.data[0])
    })
  })

  describe('useEdgeAllPinData', () => {
    it('should correctly response data', async () => {
      const { result } = renderHook(() => useEdgeAllPinData(), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      await waitFor(() => expect(result.current.venuePins).not.toBeUndefined())
      expect(result.current.venuePins).toStrictEqual(mockPinStatsList.data)
    })

    it('should not trigger API when FF is not on', () => {
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
      const { result } = renderHook(() => useEdgeAllPinData(), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      expect(result.current.venuePins).toStrictEqual(undefined)
      expect(result.current.isUninitialized).toStrictEqual(true)
      expect(mockedReqFn).toBeCalledTimes(0)
    })
    it('should not trigger API when skip is true', () => {
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
      const { result } = renderHook(() => useEdgeAllPinData({}, true), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      expect(result.current.venuePins).toStrictEqual(undefined)
      expect(result.current.isUninitialized).toStrictEqual(true)
      expect(mockedReqFn).toBeCalledTimes(0)
    })
  })
})