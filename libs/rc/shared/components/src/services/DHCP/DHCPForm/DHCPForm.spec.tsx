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

import { DHCPForm } from './DHCPForm'

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
      ),
      rest.put(DHCPUrls.updateDHCPService.url,
        (_, res, ctx) => res(ctx.status(202))
      )
    )

  })
  it('should create DHCP successfully', async () => {
    const params = { serviceId: 'serviceID', tenantId: 'tenant-id' }

    render(<Provider><DHCPForm /></Provider>, {
      route: { params }
    })

    fillInBeforeSettings('TEST14')

    fillInBeforeSettings('DhcpConfigServiceProfile1')

    await screen.findByRole('heading', { level: 1, name: 'Add DHCP for Wi-Fi' })

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

  }, 25000)

  it('should render breadcrumb correctly', async () => {
    const params = { tenantId: 'tenant-id' }

    render(<Provider><DHCPForm /></Provider>, {
      route: { params }
    })

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'DHCP for Wi-Fi'
    })).toBeVisible()
  })

  it('should cancel DHCP form successfully', async () => {
    const params = { serviceId: 'serviceID', tenantId: 'tenant-id' }

    render(<Provider><DHCPForm editMode={false}/></Provider>, {
      route: { params }
    })

    fillInBeforeSettings('TEST14')

    await userEvent.click(screen.getByText('Cancel'))

  })

  const data = {
    dhcpPools: [
      {
        startIpAddress: '192.168.1.1',
        endIpAddress: '192.168.1.62',
        name: 'poo1',
        vlanId: 300,
        subnetAddress: '192.168.1.0',
        subnetMask: '255.255.255.192',
        leaseTimeHours: 24,
        leaseTimeMinutes: 0
      },
      {
        startIpAddress: '192.168.2.1',
        endIpAddress: '192.168.2.30',
        name: 'poo2',
        vlanId: 1,
        subnetAddress: '192.168.2.0',
        subnetMask: '255.255.255.128',
        leaseTimeHours: 24,
        leaseTimeMinutes: 0
      }
    ],
    dhcpMode: 'EnableOnEachAPs',
    usage: [
      {
        venueId: '9d1c33dcba0e4fce946e7ad7b790dda1',
        totalIpCount: 0,
        usedIpCount: 0
      }
    ],
    serviceName: 'dhcpProfile1',
    id: 'b9de168c00b2443bb383c1bb18ef2348'
  }

  it('should call rbac api and render correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const getDhcpProfile = jest.fn()
    const queryProfile = jest.fn()
    mockServer.use(
      rest.get(DHCPUrls.getDHCProfileDetail.url,(_,res,ctx) => {
        getDhcpProfile()
        return res(ctx.json(data))
      }),
      rest.post(DHCPUrls.queryDHCPProfiles.url,(_,res,ctx) => {
        queryProfile()
        return res(ctx.json({}))
      })
    )
    const params = { serviceId: 'serviceID', tenantId: 'tenant-id' }
    render(<Provider><DHCPForm editMode={true}/></Provider>, {
      route: { params }
    })

    expect(await screen.findByLabelText('Service Name')).toHaveValue('dhcpProfile1')
    expect(getDhcpProfile).toHaveBeenCalled()
    fillInBeforeSettings('TEST14')
    await userEvent.click(screen.getByText('Finish'))
    expect(queryProfile).toBeCalledTimes(1)
  })
})
