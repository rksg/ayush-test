
import { rest } from 'msw'

import { CommonRbacUrlsInfo, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, renderHook, waitFor }    from '@acx-ui/test-utils'

import { networkList } from './__tests__/fixtures'
import { useFilters }  from './useFilters'

describe('ApTable > useFilters', () => {

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => {
          return res(ctx.json(networkList))
        }
      ),
      rest.post(
        CommonRbacUrlsInfo.getWifiNetworksList.url,
        (req, res, ctx) => {
          return res(ctx.json(networkList))
        }
      )
    )
  })

  it('should get filters correctly with the networkId', async () => {
    const params = {
      venueId: 'venue-id',
      networkId: 'network-id'
    }
    const { result } = renderHook(() => useFilters(params), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    await waitFor(
      () => {
        const { filters } = result.current
        expect(filters).toMatchObject({
          venueId: ['venue-id'],
          apGroupId: [ '_apGroupId_1_', '_apGroupId_2_' ]
        })
      }
    )
  })

  it('should get filters correctly with ApGroupID', async () => {
    const params = {
      venueId: 'venue-id',
      apGroupId: 'ap-group-id'
    }
    const { result } = renderHook(() => useFilters(params), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    await waitFor(
      () => {
        const { filters } = result.current
        expect(filters).toMatchObject({
          venueId: ['venue-id'],
          apGroupId: ['ap-group-id']
        })
      }
    )
  })
})