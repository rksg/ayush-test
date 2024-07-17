
import { rest } from 'msw'

import { CommonUrlsInfo }                  from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'

import { networkList } from './__test__/fixtures'
import { useFilters }  from './useFilters'

describe('ApTable > useFilters', () => {

  const params = {
    venueId: 'venue-id',
    networkId: 'network-id',
    apGroupId: 'ap-group-id'
  }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => {
          return res(ctx.json(networkList))
        }
      )
    )
  })

  it('should get filters correctly', async () => {
    const { result } = renderHook(() => useFilters(params), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    await waitFor(
      () => {
        const { filters } = result.current
        expect(filters).toMatchObject({
          serialNumber: ['123456789005', '302002030366'],
          venueId: ['venue-id'],
          apGroupId: ['ap-group-id']
        })
      }
    )
  })
})