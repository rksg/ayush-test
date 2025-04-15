import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                         from '@acx-ui/feature-toggle'
import { MspRbacUrlsInfo, MspUrlsInfo }         from '@acx-ui/msp/utils'
import { ApDeviceStatusEnum, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { Provider }                             from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within,
  waitFor
} from '@acx-ui/test-utils'
import { AccountType } from '@acx-ui/utils'

import { NewDeviceInventory } from '.'

const list = {
  totalCount: 10,
  page: 1,
  data: [
    {
      apMac: '89:28:38:22:77:23',
      serialNumber: '892838227723',
      deviceType: 'DVCNWTYPE_WIFI',
      model: 'R750',
      name: "EC 111's AP",
      customerName: 'EC 111',
      deviceStatus: ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD,
      venueName: 'My-Venue',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:24',
      serialNumber: '892838227724',
      deviceType: 'DVCNWTYPE_SWITCH',
      model: 'ICX-7150-Co8P',
      name: "EC 222's AP",
      customerName: 'EC 222',
      deviceStatus: SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED,
      venueName: 'Venue 2',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:24',
      serialNumber: '892838227725',
      deviceType: 'DVCNWTYPE_SWITCH',
      model: 'ICX-7550',
      name: "EC 333's AP",
      customerName: 'EC 333',
      deviceStatus: SwitchStatusEnum.INITIALIZING,
      venueName: 'Venue 3',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:26',
      serialNumber: '892838227726',
      deviceType: 'DVCNWTYPE_SWITCH',
      model: 'ICX-7150-08',
      name: "EC 444's Switch",
      customerName: 'EC 444',
      deviceStatus: SwitchStatusEnum.APPLYING_FIRMWARE,
      venueName: 'Venue 4',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:27',
      serialNumber: '892838227727',
      deviceType: 'DVCNWTYPE_SWITCH',
      model: 'ICX-7850',
      name: "EC 555's Switch",
      customerName: 'EC 555',
      deviceStatus: SwitchStatusEnum.OPERATIONAL,
      venueName: 'Venue 5',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:28',
      serialNumber: '892838227728',
      deviceType: 'DVCNWTYPE_WIFI',
      model: 'R650',
      name: "EC 666's Switch",
      customerName: 'EC 666',
      deviceStatus: ApDeviceStatusEnum.OFFLINE,
      venueName: 'Venue 6',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:29',
      serialNumber: '892838227729',
      deviceType: 'DVCNWTYPE_SWITCH',
      model: 'ICX-7150',
      name: "EC 777's Switch",
      customerName: 'EC 777',
      deviceStatus: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
      venueName: 'Venue 7',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      apMac: '89:28:38:22:77:30',
      serialNumber: '892838227730',
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
      switchMac: '89:28:38:22:77:31',
      serialNumber: '892838227731',
      deviceType: 'DVCNWTYPE_SWITCH',
      model: 'R720',
      name: "EC 999's Switch",
      customerName: 'EC 999',
      deviceStatus: '',
      venueName: 'Venue 9',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    },
    {
      serialNumber: '892838227732',
      deviceType: 'DVCNWTYPE_SWITCH',
      model: 'R720',
      name: "EC 100's Switch",
      customerName: 'EC 100',
      deviceStatus: SwitchStatusEnum.DISCONNECTED,
      venueName: 'Venue 10',
      managedAs: 'MSP',
      tenantId: '1456b8a156354b6e98dff3ebc7b25b82'
    }
  ]
}

const deviceModelFilterList = {
  data: [
    'R750',
    'ICX-7150-Co8P',
    'ICX-7550',
    'ICX-7150-08',
    'ICX-7850',
    'R650',
    'ICX-7150',
    'ANALYTIC',
    'R720'
  ]
}

const venueNameFilterList = {
  data: [
    'My-Venue',
    'Venue 2',
    'Venue 3',
    'Venue 4',
    'Venue 5',
    'Venue 6',
    'Venue 7',
    'Venue 8',
    'Venue 10'
  ]
}

const customerNameFilterList = {
  data: [
    'EC-111',
    'EC-222',
    'EC-333',
    'EC-444',
    'EC-555',
    'EC-666',
    'EC-777',
    'EC-888',
    'EC-999',
    'EC-100'
  ]
}

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))
const utils = require('@acx-ui/rc/utils')
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils')
}))

const fakeTenantDetails = {
  id: 'ee87b5336d5d483faeda5b6aa2cbed6f',
  createdDate: '2023-01-31T04:19:00.241+00:00',
  updatedDate: '2023-02-15T02:34:21.877+00:00',
  entitlementId: '140360222',
  maintenanceState: false,
  name: 'Dog Company 1551',
  externalId: '0012h00000NrlYAAAZ',
  upgradeGroup: 'production',
  tenantMFA: {
    mfaStatus: 'DISABLED',
    recoveryCodes: '["825910","333815","825720","919107","836842"]' },
  preferences: '{"global":{"mapRegion":"UA"}}',
  ruckusUser: false,
  isActivated: true,
  status: 'active',
  tenantType: 'REC'
}

const fakeIntegratorTenantDetails = {
  id: 'ee87b5336d5d483faeda5b6aa2cbed6f',
  createdDate: '2023-01-31T04:19:00.241+00:00',
  updatedDate: '2023-02-15T02:34:21.877+00:00',
  entitlementId: '140360222',
  maintenanceState: false,
  name: 'Dog Company 1551',
  externalId: '0012h00000NrlYAAAZ',
  upgradeGroup: 'production',
  tenantMFA: {
    mfaStatus: 'DISABLED',
    recoveryCodes: '["825910","333815","825720","919107","836842"]' },
  preferences: '{"global":{"mapRegion":"UA"}}',
  ruckusUser: false,
  isActivated: true,
  status: 'active',
  tenantType: AccountType.MSP_INTEGRATOR,
  mspEc: {
    parentMspId: 'fcc2d7cf9d2342fdb31ae0e24958fdbd',
    serviceEffectiveDate: '2023-01-31T04:19:00.241+00:00',
    serviceExpirationDate: '2024-01-31T04:19:00.241+00:00'
  }
}

describe('Device Inventory Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    utils.useTableQuery = jest.fn().mockImplementation(() => {
      return { data: list }
    })
    jest.spyOn(services, 'useExportDeviceInventoryMutation')
    mockServer.use(
      rest.post(
        MspUrlsInfo.exportMspEcDeviceInventory.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.post(
        MspRbacUrlsInfo.exportMspEcDeviceInventory.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.get(
        MspUrlsInfo.getTenantDetail.url,
        (req, res, ctx) => res(ctx.json(fakeTenantDetails))
      ),
      rest.post(
        MspUrlsInfo.getCustomerNamesFilter.url,
        (req, res, ctx) => res(ctx.json(customerNameFilterList))
      ),
      rest.post(
        MspUrlsInfo.getVenuesFilter.url,
        (req, res, ctx) => res(ctx.json(venueNameFilterList))
      ),
      rest.post(
        MspUrlsInfo.getdeviceModelsFilter.url,
        (req, res, ctx) => res(ctx.json(deviceModelFilterList))
      )
    )
    global.URL.createObjectURL = jest.fn()
    HTMLAnchorElement.prototype.click = jest.fn()
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render page header and grid layout', async () => {
    utils.useTableQuery = jest.fn().mockImplementation(() => {
      return { data: list }
    })
    render(
      <Provider>
        <NewDeviceInventory />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Device Inventory (10)')).toBeVisible()
    expect(screen.getByText('Manage My Account')).toBeVisible()
  })
  it('should render table', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    utils.useTableQuery = jest.fn().mockImplementation(() => {
      return { data: list }
    })
    render(
      <Provider>
        <NewDeviceInventory />
      </Provider>, {
        route: { params, path: '/:tenantId/deviceinventory' }
      })

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    expect(screen.getAllByText('Never contacted cloud')).toHaveLength(3)
    expect(screen.getByText('Never contacted Active Switch')).toBeVisible()
    expect(screen.getByText('Initializing')).toBeVisible()
    expect(screen.getByText('Firmware updating')).toBeVisible()
    expect(screen.getByText('Operational')).toBeVisible()
    expect(screen.getByText('Requires Attention')).toBeVisible()
  })
  it('should export when button clicked', async () => {
    utils.useTableQuery = jest.fn().mockImplementation(() => {
      return { data: list }
    })
    render(
      <Provider>
        <NewDeviceInventory />
      </Provider>, {
        route: { params, path: '/:tenantId/deviceinventory' }
      })

    const button = screen.getByRole('button', { name: 'Export to CSV' })
    expect(button).toBeVisible()
    await userEvent.click(button)

    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: {},
        status: 'fulfilled'
      })
    ]
    await waitFor(() =>
      expect(services.useExportDeviceInventoryMutation).toHaveLastReturnedWith(value))
  })
  it('should render correctly when no data', async () => {
    utils.useTableQuery = jest.fn().mockImplementation(() => {
      return { data: {
        totalCount: 0,
        page: 1,
        data: []
      } }
    })
    render(
      <Provider>
        <NewDeviceInventory />
      </Provider>, {
        route: { params, path: '/:tenantId/deviceinventory' }
      })

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(1)
  })
  it('should retrieve data correctly when is integrator', async () => {
    utils.useTableQuery = jest.fn().mockImplementation(() => {
      return { data: list }
    })
    mockServer.use(
      rest.get(
        MspUrlsInfo.getTenantDetail.url,
        (req, res, ctx) => res(ctx.json(fakeIntegratorTenantDetails))
      )
    )
    render(
      <Provider>
        <NewDeviceInventory />
      </Provider>, {
        route: { params, path: '/:tenantId/deviceinventory' }
      })

    await waitFor(() => {
      expect(utils.useTableQuery).toHaveBeenLastCalledWith(expect.objectContaining({
        apiParams: { tenantId: 'fcc2d7cf9d2342fdb31ae0e24958fdbd' },
        defaultPayload: expect.objectContaining({
          filters: {
            id: [ params.tenantId ]
          }
        })
      }))
    })

    const button = screen.getByRole('button', { name: 'Export to CSV' })
    expect(button).toBeVisible()
    await userEvent.click(button)

    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: {},
        status: 'fulfilled'
      })
    ]
    await waitFor(() => {
      expect(services.useExportDeviceInventoryMutation).toHaveLastReturnedWith(value)
    })
  })
})
