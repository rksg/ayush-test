import { rest } from 'msw'

import { SwitchUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { VenueSwitch } from '.'

describe('VenueSwitch', () => {
  const params = {
    tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
    venueId: '8caa8f5e01494b5499fa156a6c565138',
    activeTab: 'devices'
  }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        SwitchUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><VenueSwitch /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/venue-details/:activeTab' }
    })

    fireEvent.click(await screen.findByTestId('LineChartOutline'))

    fireEvent.click(await screen.findByTestId('PortSolid'))
  })
})