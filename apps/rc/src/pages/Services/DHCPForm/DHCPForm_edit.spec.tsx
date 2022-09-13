import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, DHCPConfigTypeEnum, ServiceTechnology, DHCPSaveData } from '@acx-ui/rc/utils'
import { Provider }                                                            from '@acx-ui/store'
import {
  mockServer,
  render, screen,
  fireEvent,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { DHCPForm } from './DHCPForm'


const dhcpResponse: DHCPSaveData = {
  id: '1',
  name: 'testDHCP',
  tags: ['test'],
  createType: ServiceTechnology.WIFI,
  dhcpConfig: DHCPConfigTypeEnum.SIMPLE,
  dhcpPools: [],
  venues: []
}

const venuesResponse = {
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


async function fillInBeforeSettings (dhcpName: string) {
  const insertInput = screen.getByLabelText('Service Name')
  fireEvent.change(insertInput, { target: { value: dhcpName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })

  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
}

describe('DHCPForm', () => {


  it('should edit open DHCP successfully', async () => {

    const params = { networkId: '5d45082c812c45fbb9aab24420f39bf0',
      tenantId: 'tenant-id', action: 'edit', serviceId: '5d45082c812c45fbb9aab24420f39bf1' }

    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.get(CommonUrlsInfo.getService.url,
        (_, res, ctx) => {
          return res(ctx.json(dhcpResponse))
        }),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse)))
    )


    const { asFragment } = render(<Provider><DHCPForm /></Provider>, {
      route: { params }
    })

    expect(asFragment()).toMatchSnapshot()
    fillInBeforeSettings('open dhcp edit test')

    await screen.findByRole('heading', { level: 3, name: 'Settings' })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    //Venues
    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    //summary
    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    await userEvent.click(screen.getByText('Finish'))

  })
})
