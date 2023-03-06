import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Urls }                                                       from '@acx-ui/rbac'
import { CommonUrlsInfo, DHCPUrls, DHCPConfigTypeEnum, DHCPSaveData } from '@acx-ui/rc/utils'
import { Provider }                                                   from '@acx-ui/store'
import {
  mockServer,
  render, screen,
  fireEvent,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import DHCPForm from './DHCPForm'


const dhcpResponse: DHCPSaveData = {
  venueIds: [],
  id: '78f92fbf80334e8b83cddd3210db4920',
  serviceName: 'DhcpConfigServiceProfile1',
  dhcpMode: DHCPConfigTypeEnum.MULTIPLE,
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
    dhcpOptions: []
  }
  ]
}



async function fillInBeforeSettings (dhcpName: string) {
  const insertInput = screen.getByLabelText('Service Name')
  fireEvent.change(insertInput, { target: { value: dhcpName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })
}

describe('DHCPForm', () => {

  it.skip('should edit open DHCP successfully', async () => {

    const params = { serviceId: '5d45082c812c45fbb9aab24420f39bf0',
      tenantId: 'tenant-id', action: 'edit' }

    mockServer.use(
      rest.get(Urls.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.get(DHCPUrls.getDHCProfileDetail.url,
        (_, res, ctx) => {
          return res(ctx.json(dhcpResponse))
        })
    )

    render(<Provider><DHCPForm editMode={true}/></Provider>, {
      route: { params }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fillInBeforeSettings('DhcpConfigServiceProfile1')

    await screen.findByRole('heading', { level: 3, name: 'Settings' })

    let serviceName = await screen.findByRole('textbox', { name: /Service Name/i })
    expect(serviceName).toHaveValue('DhcpConfigServiceProfile1')

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))



  })
})
