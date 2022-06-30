import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { mockServer, render, screen, fireEvent } from '@acx-ui/test-utils'

import { NetworkForm } from '../NetworkForm'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

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

const successResponse = { requestId: 'request-id' }


describe('NetworkForm', () => {
  it('should create AAA network successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(<Provider><NetworkForm /></Provider>, {
      route: { params }
    })

    expect(asFragment()).toMatchSnapshot()

    mockServer.use(
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json(venuesResponse)
          )
        }),
      rest.post(CommonUrlsInfo.addNetworkDeep.url,
        (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json(successResponse)
          )
        }),
      rest.get(CommonUrlsInfo.getCloudpathList.url, (_, res, ctx) => res(ctx.json([])))
    )

    const insertInput = screen.getByLabelText('Network Name')
    fireEvent.change(insertInput, { target: { value: 'AAA network test' } })
    expect(insertInput).toHaveValue('AAA network test')

    const button = screen.getAllByRole('radio')
    fireEvent.click(button[2])
    fireEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'AAA Settings' })
    
    const ipTextbox = screen.getByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '111.111.111.111' } })
    expect(ipTextbox).toHaveValue('111.111.111.111')
    
    const portTextbox = screen.getByLabelText('Port')
    fireEvent.change(portTextbox, { target: { value: 1111 } })
    expect(portTextbox).toHaveValue(1111)
    
    const secretTextbox = screen.getByLabelText('Shared secret')
    fireEvent.change(secretTextbox, { target: { value: '111111' } })
    expect(secretTextbox).toHaveValue('111111')

    fireEvent.click(screen.getByText('Next'))
    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    
    fireEvent.click(screen.getByText('Next'))
    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    
    fireEvent.click(screen.getByText('Finish'))
  })
})