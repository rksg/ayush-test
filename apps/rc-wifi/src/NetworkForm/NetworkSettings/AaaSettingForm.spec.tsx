import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }                                                   from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { NetworkForm } from '../NetworkForm'

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

async function fillInBeforeSettings (networkName: string) {
  const insertInput = screen.getByLabelText('Network Name')
  fireEvent.change(insertInput, { target: { value: networkName } })

  const button = screen.getAllByRole('radio')
  fireEvent.click(button[2])
  fireEvent.click(screen.getByText('stepsForm.next'))

  await screen.findByRole('heading', { level: 3, name: 'AAA Settings' })
}

async function fillInAfterSettings (checkSummary: Function) {
  fireEvent.click(screen.getByText('stepsForm.next'))
  await screen.findByRole('heading', { level: 3, name: 'Venues' })

  fireEvent.click(screen.getByText('stepsForm.next'))
  await screen.findByRole('heading', { level: 3, name: 'Summary' })

  checkSummary()
  const finish = screen.getByText('stepsForm.submit')
  fireEvent.click(finish)
  await waitForElementToBeRemoved(finish)
}

describe('NetworkForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json(venuesResponse)
          )
        }),
      rest.post(CommonUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json(successResponse)
          )
        }),
      rest.get(CommonUrlsInfo.getCloudpathList.url, (_, res, ctx) => res(ctx.json([]))),
      rest.get(CommonUrlsInfo.getAllUserSettings.url, (_, res, ctx) => res(ctx.json([])))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it('should create AAA network successfully', async () => {
    const { asFragment } = render(<Provider><NetworkForm /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()

    await fillInBeforeSettings('AAA network test')

    const ipTextbox = screen.getByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '111.111.111.111' } })

    const portTextbox = screen.getByLabelText('Port')
    fireEvent.change(portTextbox, { target: { value: '1111' } })

    const secretTextbox = screen.getByLabelText('Shared secret')
    fireEvent.change(secretTextbox, { target: { value: 'secret-1' } })

    await fillInAfterSettings(async () => {
      expect(screen.getByText('AAA network test')).toBeVisible()
      expect(screen.getByText('111.111.111.111:1111')).toBeVisible()
      expect(screen.getAllByDisplayValue('secret-1')).toHaveLength(2)
    })
  })

  it('should create AAA network with secondary server', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')

    const ipTextbox = screen.getByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '111.111.111.111' } })

    const portTextbox = screen.getByLabelText('Port')
    fireEvent.change(portTextbox, { target: { value: 1111 } })

    const secretTextbox = screen.getByLabelText('Shared secret')
    fireEvent.change(secretTextbox, { target: { value: 'secret-1' } })

    fireEvent.click(screen.getByText('Add Secondary Server'))

    const secondaryIpTextbox = screen.getAllByLabelText('IP Address')[1]
    fireEvent.change(secondaryIpTextbox, { target: { value: '222.222.222.222' } })

    const secondaryPortTextbox = screen.getAllByLabelText('Port')[1]
    fireEvent.change(secondaryPortTextbox, { target: { value: '2222' } })

    const secondarySecretTextbox = screen.getAllByLabelText('Shared secret')[1]
    fireEvent.change(secondarySecretTextbox, { target: { value: 'secret-2' } })

    await fillInAfterSettings(() => {
      expect(screen.getByText('AAA network test')).toBeVisible()
      expect(screen.getByText('111.111.111.111:1111')).toBeVisible()
      expect(screen.getAllByDisplayValue('secret-1')).toHaveLength(2)

      expect(screen.getByText('222.222.222.222:2222')).toBeVisible()
      expect(screen.getAllByDisplayValue('secret-2')).toHaveLength(2)
    })
  }, 7000)
})
