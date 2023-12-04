import { rest } from 'msw'

import { SwitchUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { VenueSwitch } from '.'

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid={'some-report-id'} id='acx-report' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  SwitchTable: () => <div data-testid={'SwitchTable'} />,
  SwitchPortTable: () => <div data-testid={'SwitchPortTable'} />
}))

describe('VenueSwitch', () => {
  const params = {
    tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
    venueId: '8caa8f5e01494b5499fa156a6c565138',
    activeTab: 'devices'
  }
  beforeEach(() => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchModelList.url,
        (req, res, ctx) => res(ctx.json({ data: [{ name: 'ICX7650-48ZP' }], totalCount: 1 }))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><VenueSwitch /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/venue-details/:activeTab' }
    })

    fireEvent.click(await screen.findByTestId('ListSolid'))
    expect(await screen.findByTestId('SwitchTable')).toBeVisible()

    fireEvent.click(await screen.findByTestId('PortSolid'))
    expect(await screen.findByTestId('SwitchPortTable')).toBeVisible()
  })
})
