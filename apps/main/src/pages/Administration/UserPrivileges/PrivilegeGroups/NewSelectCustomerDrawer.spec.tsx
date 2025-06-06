import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { MspEcWithVenue }         from '@acx-ui/msp/utils'
import { Provider }               from '@acx-ui/store'
import { render, screen, within } from '@acx-ui/test-utils'

import { NewSelectCustomerDrawer } from './NewSelectCustomerDrawer'

const customerList = {
  totalCount: 6,
  page: 1,
  data: [
    {
      id: '3756dcf148c2473ba0c3dd8b811a9bcd',
      name: 'AC Hotel Atlanta Airport Gateway',
      entitlements: [],
      children: [{ name: 'Venue A', id: 'AAA', selected: false }]
    },
    {
      id: '07da017483044526875ae33acbd0117e',
      name: 'Amy',
      entitlements: [
        {
          expirationDateTs: '1711558765000',
          consumed: '0',
          quantity: '50',
          entitlementDeviceType: 'DVCNWTYPE_APSW',
          tenantId: '07da017483044526875ae33acbd0117e',
          type: 'entitlement',
          expirationDate: '2024-03-27T16:59:25Z',
          toBeRemovedQuantity: 0,
          accountType: 'TRIAL',
          wifiDeviceCount: '0',
          switchDeviceCount: '0',
          edgeDeviceCount: '0',
          outOfComplianceDevices: '0',
          futureOutOfComplianceDevices: '0',
          futureOfComplianceDate: '1711558765000'
        }
      ],
      accountType: 'TRIAL',
      wifiLicenses: 0,
      switchLicenses: 0,
      edgeLicenses: 0,
      apSwLicenses: 50,
      installerCount: 0,
      integratorCount: 0,
      children: [{ name: 'Venue B', id: 'BBB', selected: false }]
    },
    {
      id: '5d4b605aa0604241b2cd7a238b7d5c56',
      name: 'int 1',
      entitlements: [],
      installerCount: 0,
      integratorCount: 0,
      children: [{ name: 'Venue C', id: 'CCC', selected: false }]
    },
    {
      id: '3f8dd5028b0f4a9da61a0d69c50405b6',
      name: 'new ec Platinum',
      entitlements: [
        {
          expirationDateTs: '1707421038000',
          consumed: '0',
          quantity: '50',
          entitlementDeviceType: 'DVCNWTYPE_APSW',
          tenantId: '3f8dd5028b0f4a9da61a0d69c50405b6',
          type: 'entitlement',
          expirationDate: '2024-02-08T19:37:18Z',
          toBeRemovedQuantity: 0,
          accountType: 'TRIAL',
          wifiDeviceCount: '0',
          switchDeviceCount: '0',
          edgeDeviceCount: '0',
          outOfComplianceDevices: '0',
          futureOutOfComplianceDevices: '0',
          futureOfComplianceDate: '1707421038000'
        }
      ],
      accountType: 'TRIAL',
      wifiLicenses: 0,
      switchLicenses: 0,
      edgeLicenses: 0,
      apSwLicenses: 50,
      installerCount: 0,
      integratorCount: 0,
      children: [{ name: 'Venue D', id: 'DDD', selected: false }]
    },
    {
      id: '4378c5e5cddb483594cca0a48a74007a',
      name: 'new gold ec',
      entitlements: [
        {
          expirationDateTs: '1707420886000',
          consumed: '0',
          quantity: '50',
          entitlementDeviceType: 'DVCNWTYPE_APSW',
          tenantId: '4378c5e5cddb483594cca0a48a74007a',
          type: 'entitlement',
          expirationDate: '2024-02-08T19:34:46Z',
          toBeRemovedQuantity: 0,
          accountType: 'TRIAL',
          wifiDeviceCount: '0',
          switchDeviceCount: '0',
          edgeDeviceCount: '0',
          outOfComplianceDevices: '0',
          futureOutOfComplianceDevices: '0',
          futureOfComplianceDate: '1707420886000'
        }
      ],
      accountType: 'TRIAL',
      wifiLicenses: 0,
      switchLicenses: 0,
      edgeLicenses: 0,
      apSwLicenses: 50,
      installerCount: 0,
      integratorCount: 0,
      children: [{ name: 'Venue E', id: 'EEE', selected: false }]
    },
    {
      id: 'de2dae3028ac40d39c08221bf24a191c',
      name: 'test tier',
      entitlements: [
        {
          expirationDateTs: '1706379418000',
          consumed: '0',
          quantity: '50',
          entitlementDeviceType: 'DVCNWTYPE_APSW',
          tenantId: 'de2dae3028ac40d39c08221bf24a191c',
          type: 'entitlement',
          expirationDate: '2024-01-27T18:16:58Z',
          toBeRemovedQuantity: 0,
          accountType: 'TRIAL',
          wifiDeviceCount: '0',
          switchDeviceCount: '0',
          edgeDeviceCount: '0',
          outOfComplianceDevices: '0',
          futureOutOfComplianceDevices: '0',
          futureOfComplianceDate: '1706379418000'
        }
      ],
      accountType: 'TRIAL',
      wifiLicenses: 0,
      switchLicenses: 0,
      edgeLicenses: 0,
      apSwLicenses: 50,
      installerCount: 0,
      integratorCount: 0,
      children: [{ name: 'Venue F', id: 'FFF', selected: false }]
    }
  ]
}
const selectedCustomers =
[
  {
    id: '3756dcf148c2473ba0c3dd8b811a9bcd',
    name: 'AC Hotel Atlanta Airport Gateway',
    children: [{ name: 'Venue A', id: 'AAA', selected: true }]
  },
  {
    id: '07da017483044526875ae33acbd0117e',
    name: 'Amy',
    children: [{ name: 'Venue B', id: 'BBB', selected: true }]
  }
]

const services = require('@acx-ui/msp/services')

describe('NewSelectCustomerDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useGetMspEcListQuery = jest.fn().mockImplementation(() => {
      return { data: customerList }
    })
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render table correctly', async () => {
    render(
      <Provider>
        <NewSelectCustomerDrawer
          visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          selected={[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/userPrivileges/privilegeGroups/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('Select Customers')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save Selection' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(customerList.data.length)
  })
  it('should load data correctly', async () => {
    render(
      <Provider>
        <NewSelectCustomerDrawer
          visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          selected={selectedCustomers as MspEcWithVenue[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/userPrivileges/privilegeGroups/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('AC Hotel Atlanta Airport Gateway')).toBeVisible()
    expect(screen.getByText('Amy')).toBeVisible()

  })
  it('should search correctly', async () => {
    render(
      <Provider>
        <NewSelectCustomerDrawer
          visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          selected={[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/userPrivileges/privilegeGroups/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()

    const input = screen.getByPlaceholderText('Search Customer')
    await userEvent.type(input, 'new')
    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(2)
  })
  it('should validate at least one customer selected', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <NewSelectCustomerDrawer
          visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          selected={selectedCustomers as MspEcWithVenue[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/userPrivileges/privilegeGroups/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(customerList.data.length + 1)
    expect(checkboxes[1]).toBeChecked()
    expect(checkboxes[2]).toBeChecked()
    await userEvent.click(checkboxes[1])
    await userEvent.click(checkboxes[2])

    await userEvent.click(screen.getByRole('button', { name: 'Save Selection' }))

    await expect(mockedCloseDialog).toHaveBeenCalledWith(false)
  })
  it('should handle save when no tenantId', async () => {
    const mockedCloseDialog = jest.fn()
    const mockedSetSelected = jest.fn()
    render(
      <Provider>
        <NewSelectCustomerDrawer
          visible={true}
          setVisible={mockedCloseDialog}
          setSelected={mockedSetSelected}
          selected={[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/userPrivileges/privilegeGroups/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    const checkboxes = screen.getAllByRole('checkbox')
    // expect(checkboxes).toHaveLength(3)
    await userEvent.click(checkboxes[1])
    await userEvent.click(screen.getByRole('button', { name: 'Save Selection' }))

    expect(mockedSetSelected).toHaveBeenCalledTimes(1)
    expect(mockedCloseDialog).toHaveBeenCalledTimes(2)
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  it('should close drawer correctly', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <NewSelectCustomerDrawer
          visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          selected={[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/userPrivileges/privilegeGroups/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('Select Customers')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save Selection' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedCloseDialog).toHaveBeenCalledWith(false)
  })
})
