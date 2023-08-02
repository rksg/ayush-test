import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { DHCPUrls }     from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent } from '@acx-ui/test-utils'
import { UserUrlsInfo } from '@acx-ui/user'

import DHCPForm from './DHCPForm'

export const successResponse = { requestId: 'request-id' }

const dhcpProfilesList = [
  {
    dhcpMode: 'EnableOnEachAPs',
    serviceName: 'TEST14',
    id: 'ce693a6059b34119b711ab2282564651',
    dhcpPools: [
      {
        startIpAddress: '10.20.30.1',
        endIpAddress: '10.20.30.10',
        name: 'TEST14P',
        vlanId: 300,
        subnetAddress: '10.20.30.0',
        subnetMask: '255.255.255.0',
        leaseTimeHours: 24,
        leaseTimeMinutes: 0,
        id: '554d740365b047f6bb1c5e7bc366fc66'
      }
    ]
  }
]

async function fillInBeforeSettings (dhcpName: string) {
  const insertInput = screen.getByLabelText('Service Name')
  fireEvent.change(insertInput, { target: { value: dhcpName } })
  // insertInput.focus()
  // const validating = await screen.findByRole('img', { name: 'loading' })
  // await waitForElementToBeRemoved(validating)
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./DHCPPool', () => ({
  ...jest.requireActual('./DHCPPool'),
  __esModule: true,
  default: () => <div data-testid='DHCPPoolTable'><div>Add DHCP Pool</div></div>
}))

describe('DHCPForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.get(DHCPUrls.getDHCPProfiles.url, (_, res, ctx) =>
        res(ctx.json(dhcpProfilesList))
      ),
      rest.post(
        DHCPUrls.addDHCPService.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))
      ))

    jest.clearAllMocks()
  })
  it('should create DHCP successfully', async () => {

    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.get(DHCPUrls.getDHCPProfiles.url, (_, res, ctx) =>
        res(ctx.json(dhcpProfilesList))
      ),
      rest.put(DHCPUrls.updateDHCPService.url,
        (_, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        DHCPUrls.addDHCPService.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))
      ))


    const params = { serviceId: 'serviceID', tenantId: 'tenant-id' }

    render(<Provider><DHCPForm /></Provider>, {
      route: { params }
    })

    fillInBeforeSettings('TEST14')

    fillInBeforeSettings('DhcpConfigServiceProfile1')

    await screen.findByRole('heading', { level: 1, name: 'Add DHCP for Wi-Fi Service' })

    await userEvent.click(screen.getByRole('radio',{ name: /Simple DHCP/ } ) )
    expect(screen.queryByText('Add DHCP Pool')).toBeVisible()

    // const addButton = screen.getByRole('button', { name: 'Add DHCP Pool' })
    // await userEvent.click(addButton)
    // expect(screen.queryByText('Pool Name')).toBeVisible()
    // await userEvent.type(screen.getByRole('textbox', { name: 'Pool Name' }), 'pool1')
    // await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Address' }), '10.20.30.0')
    // await userEvent.type(screen.getByRole('textbox', { name: 'Subnet Mask' }), '255.255.255.0')
    // await userEvent.type(screen.getByTestId('leaseTime'), '24')
    // await userEvent.type(screen.getByRole('spinbutton', { name: 'VLAN' }), '30')
    // await userEvent.type(screen.getByRole('textbox', { name: 'Start Host Address' }), '10.20.30.1')
    // await userEvent.type(screen.getByRole('textbox', { name: 'End Host Address' }), '10.20.30.2')

    // FIXME:
    // await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    // await userEvent.click(screen.getByText('Finish'))
    // await new Promise((r)=>{setTimeout(r, 1000)})

  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { tenantId: 'tenant-id' }

    render(<Provider><DHCPForm /></Provider>, {
      route: { params }
    })

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'DHCP'
    })).toBeVisible()
  })

  it('should cancel DHCP form successfully', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.get(DHCPUrls.getDHCPProfiles.url, (_, res, ctx) =>
        res(ctx.json(dhcpProfilesList))
      ),
      rest.post(
        DHCPUrls.addDHCPService.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))
      ))


    const params = { serviceId: 'serviceID', tenantId: 'tenant-id' }

    render(<Provider><DHCPForm editMode={false}/></Provider>, {
      route: { params }
    })

    fillInBeforeSettings('TEST14')

    await userEvent.click(screen.getByText('Cancel'))

  })

  it('should render breadcrumb correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const params = { tenantId: 'tenant-id' }

    render(<Provider><DHCPForm /></Provider>, {
      route: { params }
    })

    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('My Services')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'DHCP Services'
    })).toBeVisible()
  })
})
