import '@testing-library/jest-dom'
import { rest } from 'msw'

import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { venueApi }                            from '@acx-ui/rc/services'
import { CommonUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import DiskFileSystemUtilization from '.'


const params = {
  tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
  gatewayId: 'bbc41563473348d29a36b76e95c50381',
  activeTab: 'overview'
}

const fileSystem = [
  {
    partition: '/zroot',
    size: 1338016530432,
    used: 18368954368,
    free: 1319647576064,
    capacity: '1.4%'
  },
  {
    partition: 'none',
    size: 1329124626432,
    used: 9477050368,
    free: 1319647576064,
    capacity: '0.7%'
  },
  {
    partition: '/',
    size: 1329124511744,
    used: 9476935680,
    free: 1319647576064,
    capacity: '0.7%'
  },
  {
    partition: '/space',
    size: 1327547101184,
    used: 7899525120,
    free: 1319647576064,
    capacity: '0.6%'
  }
]


describe('RWG file system', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getGatewayFileSystems.url,
        (req, res, ctx) => res(ctx.json({ response: fileSystem }))
      )
    )

    store.dispatch(venueApi.util.resetApiState())
  })

  it('should correctly render donut', async () => {

    await render(<Provider><DiskFileSystemUtilization /> </Provider>, {
      route: { params }
    })

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()
    })

    expect(await screen.findByText('/zroot')).toBeInTheDocument()

  })

})
