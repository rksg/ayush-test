import '@testing-library/jest-dom'
import { rest } from 'msw'

import { MspUrlsInfo }                                                              from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { MspCustomers } from '.'

const list = {
  totalCount: 1,
  page: 1,
  data: [
    {
      assignedMspEcList: [],
      creationDate: '1659589676020',
      entitlements: [
        {
          consumed: '0',
          entitlementDeviceType: 'DVCNWTYPE_WIFI',
          expirationDate: '2022-11-02T06:59:59Z',
          expirationDateTs: '1667372399000',
          quantity: '2',
          tenantId: '701fe9df5f6b4c17928a29851c07cc04',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
      id: '701fe9df5f6b4c17928a29851c07cc04',
      integrator: '675dc01dc28846c383219b00d2f28f48',
      mspAdminCount: 1,
      mspAdmins: ['aefb12fab1194bf6ba061ddcec14230d'],
      mspEcAdminCount: 1,
      name: 'ec 111',
      status: 'Active',
      streetAddress: '675 Tasman Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC',
      wifiLicenses: 2
    },
    {
      assignedMspEcList: [],
      creationDate: '1659589676050',
      entitlements: [
        {
          consumed: '0',
          entitlementDeviceType: 'DVCNWTYPE_WIFI',
          expirationDate: '2022-11-02T06:59:59Z',
          expirationDateTs: '1667372399000',
          quantity: '2',
          tenantId: '701fe9df5f6b4c17928a29851c07cc04',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
      id: '701fe9df5f6b4c17928a29851c07cc04',
      integrator: '675dc01dc28846c383219b00d2f28f48',
      mspAdminCount: 1,
      mspAdmins: ['aefb12fab1194bf6ba061ddcec14230d'],
      mspEcAdminCount: 1,
      name: 'ec 222',
      status: 'Active',
      streetAddress: '675 Tasman Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC',
      wifiLicenses: 2
    }
  ]
}

describe('MspCustomers', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.delete(
        MspUrlsInfo.deleteMspEcAccount.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'f638e92c-9d6f-45b2-a680-20047741ef2c' }))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render page header and grid layout', async () => {
    render(<Provider><MspCustomers /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    expect(screen.getByText('MSP Customers')).toBeVisible()
    expect(screen.getByText('Manage own account')).toBeVisible()
    expect(screen.getByText('Add Customer')).toBeVisible()
  })
  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Add Customer')
    await screen.findByText('ec 111')

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.name)).toBeVisible()
    })

    expect(asFragment()).toMatchSnapshot()
  })
  it('should delete selected row', async () => {
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getByRole('radio'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText('Delete "ec 111"?')
    const deleteEcButton = await screen.findByText('Delete EC')
    fireEvent.click(deleteEcButton)
  })

})
