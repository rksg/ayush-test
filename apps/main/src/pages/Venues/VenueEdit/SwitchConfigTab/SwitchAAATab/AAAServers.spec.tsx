import '@testing-library/jest-dom'
import { rest } from 'msw'

import { SwitchUrlsInfo }                                        from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, waitForElementToBeRemoved, screen } from '@acx-ui/test-utils'

import { AAAServers } from './AAAServers'

const list = {
  data: [
    {
      id: '40aa7da509ee48bb97e423d5f5d41ec0',
      name: 'r0',
      serverType: 'RADIUS',
      secret: 'dg',
      ip: '3.3.3.3',
      acctPort: 45,
      authPort: 45
    },
    {
      id: 'cc8387a0e8a748d3852ee67c058687c6',
      name: 'r1',
      serverType: 'RADIUS',
      secret: 'sd',
      ip: '2.2.2.2',
      acctPort: 3,
      authPort: 45
    }
  ],
  totalCount: 2,
  totalPages: 1,
  page: 1
}

const settings = {
  authnEnabledSsh: true,
  authnEnableTelnet: false,
  authnFirstPref: 'RADIUS',
  authzEnabledCommand: false,
  authzEnabledExec: false,
  acctEnabledCommand: false,
  acctEnabledExec: false,
  id: '3d0e71c087e743feaaf6f6a19ea955f2'
}

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
describe('AAAServers', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) =>
        res(ctx.json(list))
      ),
      rest.get(SwitchUrlsInfo.getAaaSetting.url, (req, res, ctx) =>
        res(ctx.json(settings))
      )
    )
  })

  it('should render correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <AAAServers />
      </Provider>,
      { route: { params } }
    )
    // const radiusPanel = screen.getByTestId('radius')
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
})
