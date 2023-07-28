import '@testing-library/jest-dom'
import { rest } from 'msw'

import { MspUrlsInfo }                                                                       from '@acx-ui/msp/utils'
import { Provider }                                                                          from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { VarCustomers } from '.'

const varlist = {
  totalCount: 4,
  page: 1,
  data: [
    {
      alarmCount: 0,
      delegationType: 'DELEGATION_TYPE_VAR',
      entitlements: [
        {
          consumed: '0',
          entitlementDeviceType: 'DVCNWTYPE_WIFI',
          expirationDate: '2023-10-09T00:00:00Z',
          expirationDateTs: '1694217600000',
          quantity: '1040',
          tenantId: '79cae97ce39343c99632600b30be5465',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
      id: '2ea8eaabc07840caa5fed7a80913a83a',
      status: 'DELEGATION_STATUS_ACCEPTED',
      switchLicenses: 80,
      tenantEmail: 'dog151@email.com',
      tenantId: '79cae97ce39343c99632600b30be5465',
      tenantName: 'Dog Company 151',
      wifiLicenses: 1040
    },
    {
      alarmCount: 0,
      delegationType: 'DELEGATION_TYPE_VAR',
      entitlements: [
        {
          consumed: '0',
          entitlementDeviceType: 'DVCNWTYPE_WIFI',
          expirationDate: '2023-09-09T00:00:00Z',
          expirationDateTs: '1694217600000',
          quantity: '1040',
          tenantId: '79cae97ce39343c99632600b30be5465',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
      id: '2ea8eaabc07840caa5fed7a80913a83b',
      status: 'DELEGATION_STATUS_ACCEPTED',
      switchLicenses: 20,
      tenantEmail: 'dog152@email.com',
      tenantId: '79cae97ce39343c99632600b30be5465',
      tenantName: 'Dog Company 152',
      wifiLicenses: 100
    },
    {
      alarmCount: 0,
      delegationType: 'DELEGATION_TYPE_VAR',
      entitlements: [
        {
          consumed: '0',
          entitlementDeviceType: 'DVCNWTYPE_WIFI',
          expirationDate: '2023-09-09T00:00:00Z',
          expirationDateTs: '1694217600000',
          quantity: '0',
          tenantId: '79cae97ce39343c99632600b30be5465',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
      id: '2ea8eaabc07840caa5fed7a80913a83c',
      status: 'DELEGATION_STATUS_ACCEPTED',
      switchLicenses: 80,
      tenantEmail: 'dog153@email.com',
      tenantId: '79cae97ce39343c99632600b30be5465',
      tenantName: 'Dog Company 153',
      wifiLicenses: 0
    },
    {
      alarmCount: 0,
      delegationType: 'DELEGATION_TYPE_VAR',
      entitlements: [],
      id: '2ea8eaabc07840caa5fed7a80913a83d',
      status: 'DELEGATION_STATUS_ACCEPTED',
      switchLicenses: 0,
      tenantEmail: 'dog154@email.com',
      tenantId: '79cae97ce39343c99632600b30be5465',
      tenantName: 'Dog Company 154',
      wifiLicenses: 0
    },
    {
      alarmCount: 0,
      delegationType: 'DELEGATION_TYPE_VAR',
      id: '2ea8eaabc07840caa5fed7a80913a83e',
      status: 'DELEGATION_STATUS_ACCEPTED',
      switchLicenses: 0,
      tenantEmail: 'dog155@email.com',
      tenantId: '79cae97ce39343c99632600b30be5465',
      tenantName: 'Dog Company 155',
      wifiLicenses: 0
    }
  ]
}
const userProfile = {
  adminId: '9b85c591260542c188f6a12c62bb3912',
  companyName: 'msp.eleu1658',
  dateFormat: 'mm/dd/yyyy',
  detailLevel: 'debug',
  email: 'msp.eleu1658@mail.com',
  externalId: '0032h00000gXuBNAA0',
  firstName: 'msp',
  lastName: 'eleu1658',
  role: 'PRIME_ADMIN',
  support: false,
  tenantId: '3061bd56e37445a8993ac834c01e2710',
  username: 'msp.eleu1658@rwbigdog.com',
  var: true,
  varTenantId: '3061bd56e37445a8993ac834c01e2710'
}

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))
const user = require('@acx-ui/user')
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user')
}))

describe('VarCustomers', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    jest.spyOn(services, 'useVarCustomerListQuery')
    jest.spyOn(services, 'useInviteCustomerListQuery')
    jest.spyOn(services, 'useAcceptRejectInvitationMutation')
    mockServer.use(
      rest.post(
        MspUrlsInfo.getVarDelegations.url,
        (req, res, ctx) => res(ctx.json(varlist))
      ),
      rest.put(
        MspUrlsInfo.acceptRejectInvitation.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render correctly', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <VarCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/varCustomers' }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    expect(await screen.findByText(`Pending Invitations (${varlist.totalCount})`)).toBeVisible()
    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getAllByRole('table').at(0)?.querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = within(tbody).getAllByRole('row')
    expect(rows).toHaveLength(varlist.data.length)
    varlist.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.tenantName)).toBeVisible()
    })
  })
  it('should render breadcrumb correctly', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <VarCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/varCustomers' }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('My Customers')).toBeVisible()
  })
  it('should handle accept row', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <VarCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/varCustomers' }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    expect(await screen.findByText(`Pending Invitations (${varlist.totalCount})`)).toBeVisible()
    const acceptButtons = screen.getAllByRole('button', { name: 'Accept' })
    expect(acceptButtons).toHaveLength(5)
    fireEvent.click(acceptButtons.at(0)!)

    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: { requestId: '123' },
        status: 'fulfilled'
      })
    ]

    await waitFor(() =>
      expect(services.useAcceptRejectInvitationMutation).toHaveLastReturnedWith(value))
  })
  it('should handle reject row', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <VarCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/varCustomers' }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    expect(await screen.findByText(`Pending Invitations (${varlist.totalCount})`)).toBeVisible()
    const rejectButtons = screen.getAllByRole('button', { name: 'Reject' })
    expect(rejectButtons).toHaveLength(5)
    fireEvent.click(rejectButtons.at(0)!)

    expect(await screen.findByText('Reject Request?')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }))

    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: { requestId: '123' },
        status: 'fulfilled'
      })
    ]

    await waitFor(() =>
      expect(services.useAcceptRejectInvitationMutation).toHaveLastReturnedWith(value))
  })
  it('should render correctly for support user', async () => {
    const supportUserProfile = { ...userProfile }
    supportUserProfile.support = true
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: supportUserProfile }
    })
    render(
      <Provider>
        <VarCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/varCustomers' }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    expect(screen.getByRole('heading', { name: 'RUCKUS Customers' })).toBeVisible()
    expect(screen.queryByText(`Pending Invitations (${varlist.totalCount})`)).toBeNull()

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = within(tbody).getAllByRole('row')
    expect(rows).toHaveLength(varlist.data.length)
    varlist.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.tenantName)).toBeVisible()
    })
  })
})
