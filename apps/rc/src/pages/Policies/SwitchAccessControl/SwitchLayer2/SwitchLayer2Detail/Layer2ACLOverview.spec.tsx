import { rest } from 'msw'

import { CommonUrlsInfo, SwitchUrlsInfo }        from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import Layer2ACLOverview from './Layer2ACLOverview'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Layer2ACLOverview', () => {
  const params = { tenantId: 'tenant-id', accessControlId: 'access-control-id' }
  beforeEach(() => {
    mockedUsedNavigate.mockClear()
    mockServer.use(
      rest.post(SwitchUrlsInfo.getLayer2AclOverview.url, (req, res, ctx) => {
        return res(ctx.json({
          data: [
            {
              switchId: 'switch-1',
              serialNumber: 'SN123456',
              switchName: 'Switch One',
              model: 'Model_X',
              ports: ['Port1', 'Port2'],
              venueName: 'Venue A',
              venueId: 'venue-1'
            },
            {
              switchId: 'switch-2',
              serialNumber: 'SN789012',
              switchName: 'Switch Two',
              model: 'Model_Y',
              ports: ['Port3'],
              venueName: 'Venue B',
              venueId: 'venue-2'
            }
          ],
          total: 2
        }))
      }),
      rest.post(CommonUrlsInfo.getVenuesList.url, (req, res, ctx) => {
        return res(ctx.json({
          data: [
            { id: 'venue-1', name: 'Venue A', country: 'USA', latitude: 0, longitude: 0 },
            { id: 'venue-2', name: 'Venue B', country: 'Canada', latitude: 0, longitude: 0 }
          ],
          total: 2
        }))
      })
    )
  })

  it('renders the Layer 2 ACL overview table with data', async () => {
    render(
      <Provider>
        <Layer2ACLOverview />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/policies/accessControl/switch/layer2/:accessControlId/overview' }
      })

    expect(await screen.findByText('Switch One')).toBeInTheDocument()
    expect(await screen.findByText('Switch Two')).toBeInTheDocument()
    expect(await screen.findByText('Model-X')).toBeInTheDocument()
    expect(await screen.findByText('Model-Y')).toBeInTheDocument()
  })

  it('navigates to switch details when clicking on a switch name', async () => {
    render(
      <Provider>
        <Layer2ACLOverview />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/policies/accessControl/switch/layer2/:accessControlId/overview' }
      })

    const switchLink = await screen.findByText('Switch One')
    fireEvent.click(switchLink)
  })
})