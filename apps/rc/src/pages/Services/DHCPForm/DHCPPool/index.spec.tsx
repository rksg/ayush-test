import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { networkApi }                                            from '@acx-ui/rc/services'
import { CommonUrlsInfo, DHCPConfigTypeEnum, ServiceTechnology } from '@acx-ui/rc/utils'
import { store }                                                 from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import DHCPFormContext from '../DHCPFormContext'

import  DHCPPoolMain from '.'

const data =
    {
      id: 2,
      name: 'pool2',
      allowWired: false,
      ip: '1.1.1.1',
      mask: '255.0.0.0',
      primaryDNS: '',
      secondaryDNS: '',
      dhcpOptions: [],
      excludedRangeStart: '',
      excludedRangeEnd: '',
      leaseTime: 24,
      vlan: 300
    }

function wrapper ({ children }: { children: React.ReactElement }) {
  return <DHCPFormContext.Provider value={{ editMode: false,
    saveState: {
      name: '',
      tags: [],
      createType: ServiceTechnology.WIFI,
      dhcpConfig: DHCPConfigTypeEnum.SIMPLE,
      venues: [],
      dhcpPools: [{
        id: 0,
        name: '',
        allowWired: false,
        ip: '',
        mask: '',
        primaryDNS: '',
        secondaryDNS: '',
        excludedRangeStart: '',
        excludedRangeEnd: '',
        dhcpOptions: [],
        leaseTime: 24,
        vlan: 300
      }] },
    updateSaveState: () => {} }}>
    <Form>
      {children}
    </Form>
  </DHCPFormContext.Provider>
}

describe('Create DHCP: Pool detail', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(data))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(<DHCPPoolMain/>, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })

    await screen.findByText('Add DHCP Pool')
    expect(asFragment()).toMatchSnapshot()
  })


  it('Table action bar add pool', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(data))
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(<DHCPPoolMain/>, {
      wrapper,
      route: { params, path: '/:tenantId/:networkId' }
    })
    const addButton = screen.getByRole('button', { name: 'Add DHCP Pool' })
    await userEvent.click(addButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Pool Name' }),'pool1')
    await userEvent.type(screen.getByRole('textbox', { name: 'IP Address' }),'1.1.1.1')
    await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Mask' }),'255.255.0.0')
    await userEvent.type(screen.getByRole('spinbutton', { name: 'Lease Time' }),'24')
    await userEvent.type(screen.getByRole('spinbutton', { name: 'VLAN' }),'30')

    const addOptButton = screen.getByRole('button', { name: 'Add option' })
    await userEvent.click(addOptButton)
    await userEvent.type(screen.getByRole('textbox', { name: 'Option ID' }),'21')
    await userEvent.type(screen.getByRole('textbox', { name: 'Option Name' }),'option1')
    await userEvent.type(screen.getByRole('textbox', { name: 'Option Format' }),'IP')
    await userEvent.type(screen.getByRole('textbox', { name: 'Option Value' }),'1.1.1.1')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await userEvent.click(addButton)


    await userEvent.type(screen.getByRole('textbox', { name: 'Pool Name' }),'pool1')
    await userEvent.type(screen.getByRole('textbox', { name: 'IP Address' }),'1.1.1.1')
    await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Mask' }),'255.255.0.0')
    await userEvent.type(screen.getByRole('spinbutton', { name: 'Lease Time' }),'24')
    await userEvent.type(screen.getByRole('spinbutton', { name: 'VLAN' }),'30')

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    userEvent.click(screen.getByText('pool1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  },15000)

})
