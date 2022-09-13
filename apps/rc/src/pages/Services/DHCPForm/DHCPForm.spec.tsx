import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { DHCPForm } from './DHCPForm'


export const venuesResponse = {
  fields: [
    'country','city','aps','latitude','switches','description',
    'networks','switchClients','vlan','radios','name','scheduling',
    'id','aggregatedApStatus','mesh','activated','longitude','status'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '6cf550cdb67641d798d804793aaa82db',name: 'My-Venue',
      description: 'My-Venue',city: 'New York',country: 'United States',
      latitude: '40.7690084',longitude: '-73.9431541',switches: 2,
      status: '1_InSetupPhase',mesh: { enabled: false }
    },{
      id: 'c6ae1e4fb6144d27886eb7693ae895c8',name: 'TDC_Venue',
      description: 'Taipei',city: 'Zhongzheng District, Taipei City',
      country: 'Taiwan',latitude: '25.0346703',longitude: '121.5218293',
      networks: { count: 1,names: ['JK-Network'],vlans: [1] },
      aggregatedApStatus: { '2_00_Operational': 1 },
      switchClients: 1,switches: 1,status: '2_Operational',
      mesh: { enabled: false }
    }
  ]
}

export const successResponse = { requestId: 'request-id' }


describe('DHCPForm', () => {
  it('should create DHCP successfully', async () => {

    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url, (_, res, ctx) =>
        res(ctx.json(venuesResponse))
      ),
      rest.post(
        CommonUrlsInfo.saveDHCPService.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))
      ))



    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi' }

    const { asFragment } = render(<Provider><DHCPForm /></Provider>, {
      route: { params }
    })

    expect(asFragment()).toMatchSnapshot()

    //step 1 setting form
    await userEvent.type(screen.getByRole('textbox', { name: 'Service Name' }),'create DHCP test')
    await userEvent.click(screen.getByRole('radio',{ name: /Simple DHCP/ } ) )
    await userEvent.click(screen.getByText('Next'))

    //scope
    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(screen.getByText('Next'))

    //summary
    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    await userEvent.click(screen.getByText('Finish'))


  })
})
