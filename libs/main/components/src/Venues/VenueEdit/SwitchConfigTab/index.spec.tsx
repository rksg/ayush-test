import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo, SwitchUrlsInfo }        from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { VenueEditContext } from '../index'

import { SwitchConfigTab } from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

const venueSwitchSetting = {
  cliApplied: false,
  id: '45aa5ab71bd040be8c445be8523e0b6c',
  name: 'My-Venue',
  profileId: ['6a757409dc1f47c2ad48689db4a0846a'],
  switchLoginPassword: 'xxxxxxxxx',
  switchLoginUsername: 'admin',
  syslogEnabled: false
}

export const profiles = [{
  id: 'c562c3868bab4d43a64840367ea74c72',
  name: 'test',
  profileType: 'CLI',
  venueCliTemplate: {
    cli: 'manager registrarasasasbb',
    id: '4a8cae7905f1466db8e59ab90c3956c8',
    name: 'test',
    overwrite: true,
    switchModels: 'ICX7150-24,ICX7150-24P,ICX7150-48'
  },
  venues: ['test-cli']
}, {
  id: '23450a243ea1441ba19d0e509b99bdad',
  name: 'test2',
  profileType: 'CLI',
  venueCliTemplate: {
    cli: 'manager registrar\nvhgfgh',
    id: '4d14bb0dc9ea4310ab7d2c9ad7f2a61c',
    name: 'test2',
    overwrite: false,
    switchModels: 'ICX7150-24'
  },
  venues: ['My-Venue']
}, {
  id: '4ba539d292044b1a8108cf00181f11cc',
  name: '11',
  profileType: 'Regular',
  vlans: [{
    arpInspection: false,
    id: 'bb6ed6763e9241999cfdf07c6bbf57d3',
    igmpSnooping: 'none',
    ipv4DhcpSnooping: false,
    multicastVersion: 2,
    spanningTreePriority: 32768,
    spanningTreeProtocol: 'stp',
    vlanId: 111
  }]
}]

const mockAaaSetting = {
  authnEnabledSsh: true,
  authnEnableTelnet: false,
  authnFirstPref: 'LOCAL',
  authzEnabledCommand: false,
  authzEnabledExec: false,
  acctEnabledCommand: false,
  acctEnabledExec: false,
  id: '3d0e71c087e743feaaf6f6a19ea955f2'
}

const radiusList = {
  data: [
    {
      id: '40aa7da509ee48bb97e423d5f5d41ec0',
      name: 'r0',
      serverType: 'RADIUS',
      secret: 'dg',
      ip: '3.3.3.3',
      acctPort: 45,
      authPort: 45
    }
  ],
  totalCount: 1,
  totalPages: 1,
  page: 1
}

const emptyList = {
  data: [],
  totalCount: 0
}


describe('SwitchConfigTab', () => {
  it('should render correctly', async () => {

    mockServer.use(
      rest.get(CommonUrlsInfo.getVenueSwitchSetting.url,
        (_, res, ctx) => res(ctx.json(venueSwitchSetting))
      ),
      rest.post(CommonUrlsInfo.getConfigProfiles.url,
        (_, res, ctx) => res(ctx.json({ data: profiles }))
      ),
      rest.get(SwitchUrlsInfo.getAaaSetting.url, (req, res, ctx) =>
        res(ctx.json(mockAaaSetting))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) => {
        const body = req.body as { serverType: string }
        if (body.serverType === 'RADIUS') return res(ctx.json(radiusList))
        return res(ctx.json(emptyList))
      })
    )

    render(<Provider>
      <VenueEditContext.Provider value={{ editContextData: {}, setEditContextData: jest.fn() }}>
        <SwitchConfigTab />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    await screen.findByRole('tab', { name: 'General' })
    await screen.findByRole('tab', { name: 'AAA' })
    await screen.findByRole('tab', { name: 'Configuration History' })
    await screen.findByRole('tab', { name: 'Routed Interfaces' })

    fireEvent.click(await screen.findByRole('tab', { name: 'AAA' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues/${params.venueId}/edit/switch/aaa`,
      hash: '',
      search: ''
    })
  })
})
