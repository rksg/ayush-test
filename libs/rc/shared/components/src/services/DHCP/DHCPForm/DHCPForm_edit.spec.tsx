import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                                                                                             from '@acx-ui/feature-toggle'
import { DHCPUrls, DHCPConfigTypeEnum, DHCPSaveData, DHCPOption, DHCPPool, DHCPUsage, ServicesConfigTemplateUrlsInfo, ConfigTemplateContext } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { UserUrlsInfo } from '@acx-ui/user'

import { DHCPForm }        from './DHCPForm'
import { successResponse } from './DHCPForm.spec'


const dhcpResponse: DHCPSaveData = {
  venueIds: [] as string[],
  usage: [] as DHCPUsage[],
  id: '78f92fbf80334e8b83cddd3210db4920',
  serviceName: 'DhcpConfigServiceProfile1',
  dhcpMode: DHCPConfigTypeEnum.MULTIPLE as DHCPConfigTypeEnum,
  dhcpPools: [{
    name: 'DhcpServiceProfile#1',
    vlanId: 1001,
    subnetAddress: '192.168.1.0',
    subnetMask: '255.255.255.0',
    startIpAddress: '192.168.1.1',
    endIpAddress: '192.168.1.254',
    leaseTimeHours: 0,
    leaseTimeMinutes: 30,
    id: '14eb1818309c434da928410fa2298ea5',
    description: 'description1',
    primaryDnsIp: '',
    secondaryDnsIp: '',
    dhcpOptions: [] as DHCPOption[]
  }, {
    name: 'DhcpServiceProfile#2',
    vlanId: 1002,
    subnetAddress: '192.168.1.0',
    subnetMask: '255.255.255.0',
    startIpAddress: '192.168.1.1',
    endIpAddress: '192.168.1.254',
    leaseTimeHours: 0,
    leaseTimeMinutes: 60,
    leaseTime: 85,
    id: '_NEW_14eb1818309c434da928410fa2298ea5',
    description: 'description1',
    primaryDnsIp: '',
    secondaryDnsIp: '',
    dhcpOptions: [] as DHCPOption[]
  }] as DHCPPool[]
}

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

const dhcpProfileRbac = {
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

  it('should edit open DHCP successfully', async () => {

    const params = { serviceId: '5d45082c812c45fbb9aab24420f39bf0',
      tenantId: 'tenant-id', action: 'edit' }

    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.get(DHCPUrls.getDHCProfileDetail.url,
        (_, res, ctx) => {
          return res(ctx.json(dhcpResponse))
        }),
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

    render(<Provider><DHCPForm editMode={true}/></Provider>, {
      route: { params }
    })

    await screen.findByRole('heading', { level: 3, name: 'Settings' })

    await screen.findByRole('textbox', {
      name: /service name/i
    })

    let serviceName = await screen.findByRole('textbox', { name: /Service Name/i })
    expect(serviceName).toHaveValue('DhcpConfigServiceProfile1')

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitFor(() => expect(validating).not.toBeVisible())
  })

  it('should call rbac api and render correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
    const getDhcpProfile = jest.fn()
    const queryProfile = jest.fn()
    mockServer.use(
      rest.get(DHCPUrls.getDHCProfileDetail.url,(_,res,ctx) => {
        getDhcpProfile()
        return res(ctx.json(dhcpProfileRbac))
      }),
      rest.post(DHCPUrls.queryDhcpProfiles.url,(_,res,ctx) => {
        queryProfile()
        return res(ctx.json({ data: [] }))
      })
    )
    const params = { serviceId: 'serviceID', tenantId: 'tenant-id' }
    render(<Provider><DHCPForm editMode={true}/></Provider>, {
      route: { params }
    })

    expect(await screen.findByLabelText('Service Name')).toHaveValue('dhcpProfile1')
    expect(getDhcpProfile).toHaveBeenCalled()
    const insertInput = screen.getByLabelText('Service Name')
    userEvent.type(insertInput, '123')
    await userEvent.click(screen.getByText('Finish'))
    expect(queryProfile).toHaveBeenCalled()
  })

  it('should call rbac api and render correctly for config template', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
    const getDhcpProfile = jest.fn()
    const queryProfile = jest.fn()
    mockServer.use(
      rest.get(ServicesConfigTemplateUrlsInfo.getDHCProfileDetail.url,(_,res,ctx) => {
        getDhcpProfile()
        return res(ctx.json(dhcpProfileRbac))
      }),
      rest.post(ServicesConfigTemplateUrlsInfo.queryDhcpProfiles.url,(_,res,ctx) => {
        queryProfile()
        return res(ctx.json({ data: [] }))
      })
    )
    const params = { serviceId: 'serviceID', tenantId: 'tenant-id' }
    render(<ConfigTemplateContext.Provider value={{ isTemplate: true }}>
      <Provider><DHCPForm editMode={true}/></Provider></ConfigTemplateContext.Provider>, {
      route: { params }
    })

    expect(await screen.findByLabelText('Service Name')).toHaveValue('dhcpProfile1')
    expect(getDhcpProfile).toHaveBeenCalled()
    const insertInput = screen.getByLabelText('Service Name')
    userEvent.type(insertInput, '123')
    await userEvent.click(screen.getByText('Finish'))
    expect(queryProfile).toHaveBeenCalled()
  })
})
