import { rest } from 'msw'

import { MspUrlsInfo }        from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { DeviceInventory } from '.'

const list = {
  totalCount: 1,
  page: 1,
  data: [
    {
      apMac: '89:28:38:22:77:23',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_WIFI',
      model: '',
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
      name: "EC 111's AP",
      customerName: 'EC 111',
      deviceStatus: 'PREPROVISIONED',
      venueName: 'My-Venue',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:24',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_SWITCH',
      model: 'ICX-7650',
      name: "EC 111's AP",
      customerName: 'EC 111',
      deviceStatus: 'INITIALIZING',
      venueName: 'My-Venue',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:26',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_SWITCH',
      model: 'ICX-7150',
      name: "EC 111's AP",
      customerName: 'EC 111',
      deviceStatus: 'APPLYINGFIRMWARE',
      venueName: 'My-Venue',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:27',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_SWITCH',
      model: 'ICX-7850',
      name: "EC 111's AP",
      customerName: 'EC 111',
      deviceStatus: 'ONLINE',
      venueName: 'My-Venue',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:28',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_SWITCH',
      model: 'ICX-7550',
      name: "EC 111's AP",
      customerName: 'EC 111',
      deviceStatus: 'OFFLINE',
      venueName: 'My-Venue',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:29',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_SWITCH',
      model: 'ICX-7150',
      name: "EC 111's AP",
      customerName: 'EC 111',
      deviceStatus: 'STACK_MEMBER_PREPROVISIONED',
      venueName: 'My-Venue',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:30',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_ANALYTIC',
      name: "EC 111's AP",
      customerName: 'EC 111',
      deviceStatus: '1_01_NeverContactedCloud',
      venueName: 'My-Venue',
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
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    expect(screen.getByText('Device Inventory')).toBeVisible()
    expect(screen.getByText('Manage own account')).toBeVisible()
  })
  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <DeviceInventory />
      </Provider>, {
        route: { params, path: '/:tenantId/deviceinventory' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.apMac)).toBeVisible()
    })
    expect(asFragment()).toMatchSnapshot()
  })
})
