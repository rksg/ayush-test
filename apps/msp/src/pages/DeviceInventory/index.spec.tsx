import { rest } from 'msw'

import { MspUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }    from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import { DeviceInventory } from '.'

const list = {
  totalCount: 9,
  page: 1,
  data: [
    {
      apMac: '89:28:38:22:77:23',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_WIFI',
      model: 'R750',
      name: "EC 111's AP",
      customerName: 'EC 111',
      deviceStatus: '1_01_NeverContactedCloud',
      venueName: 'My-Venue',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:24',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_SWITCH',
      model: 'ICX-7150-Co8P',
      name: "EC 222's AP",
      customerName: 'EC 222',
      deviceStatus: 'PREPROVISIONED',
      venueName: 'Venue 2',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:24',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_SWITCH2',
      model: 'ICX-7550',
      name: "EC 333's AP",
      customerName: 'EC 333',
      deviceStatus: 'INITIALIZING',
      venueName: 'Venue 3',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:26',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_SWITCH2',
      model: 'ICX-7150-08',
      name: "EC 444's Switch",
      customerName: 'EC 444',
      deviceStatus: 'APPLYINGFIRMWARE',
      venueName: 'Venue 4',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:27',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_SWITCH4',
      model: 'ICX-7850',
      name: "EC 555's Switch",
      customerName: 'EC 555',
      deviceStatus: 'ONLINE',
      venueName: 'Venue 5',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:28',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_WIFI2',
      model: 'R650',
      name: "EC 666's Switch",
      customerName: 'EC 666',
      deviceStatus: 'OFFLINE',
      venueName: 'Venue 6',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:29',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_SWITCH6',
      model: 'ICX-7150',
      name: "EC 777's Switch",
      customerName: 'EC 777',
      deviceStatus: 'STACK_MEMBER_PREPROVISIONED',
      venueName: 'Venue 7',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:30',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_ANALYTIC',
      model: 'ANALYTIC',
      name: "EC 888's RA",
      customerName: 'EC 888',
      deviceStatus: '1_01_NeverContactedCloud',
      venueName: 'Venue 8',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:31',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_WIFI3',
      model: 'R720',
      name: "EC 999's Switch",
      customerName: 'EC 999',
      deviceStatus: '',
      venueName: 'Venue 9',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    }
  ]
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Device Inventory Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        MspUrlsInfo.getMspDeviceInventory.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render page header and grid layout', async () => {
    render(<Provider><DeviceInventory /></Provider>, { route: { params } })
    expect(await screen.findByText('Device Inventory')).toBeVisible()
    expect(screen.getByText('Manage own account')).toBeVisible()
  })
  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <DeviceInventory />
      </Provider>, {
        route: { params, path: '/:tenantId/deviceinventory' }
      })

    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.apMac)).toBeVisible()
    })
    expect(asFragment()).toMatchSnapshot()
  })
})
