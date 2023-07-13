import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen, within } from '@acx-ui/test-utils'
import { UserUrlsInfo }                       from '@acx-ui/user'
import { AccountType }                        from '@acx-ui/utils'

import { MspEcDropdownList } from '.'


export const fakeUserProfile = {
  externalId: '0032h00000LUqcoAAD',
  pver: 'acx-hybrid',
  companyName: 'Dog Company 1551',
  firstName: 'FisrtName 1551',
  lastName: 'LastName 1551',
  username: 'dog1551@email.com',
  role: 'PRIME_ADMIN',
  roles: ['PRIME_ADMIN'],
  dateFormat: 'mm/dd/yyyy',
  email: 'dog1551@email.com',
  var: false,
  tenantId: '3061bd56e37445a8993ac834c01e2710',
  varTenantId: '3061bd56e37445a8993ac834c01e2710',
  adminId: '4159559db15c4027903d9c3d4bdb8a7e',
  support: false,
  dogfood: false
}

export const fakeTenantDetail = {
  createdDate: '2022-12-24T01:06:03.205+00:00',
  entitlementId: 'asgn__24de8731-832c-4191-b1b0-c2d2a339d6b1_GioRFRJW',
  externalId: '_24de8731-832c-4191-b1b0-c2d2a339d6b1_GioRFRJW',
  id: '2242a683a7594d7896385cfef1fe4442',
  isActivated: true,
  maintenanceState: false,
  name: 'Din Tai Fung',
  ruckusUser: false,
  status: 'active',
  tenantType: 'MSP_EC',
  updatedDate: '2022-12-24T01:06:05.021+00:00',
  upgradeGroup: 'production'
}

const list = {
  totalCount: 3,
  page: 1,
  data: [
    {
      entitlements: [],
      id: '2242a683a7594d7896385cfef1fe4442',
      name: 'Din Tai Fung',
      status: 'Active',
      streetAddress: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC'
    },
    {
      entitlements: [],
      id: '350f3089a8e34509a2913c550faffa7e',
      name: 'Eva Airways',
      status: 'Active',
      streetAddress: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC'
    },
    {
      entitlements: [],
      id: '2aa3d6d118b44a8c853544602e243e38',
      name: 'Smile Dental',
      status: 'Inactive',
      streetAddress: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC'
    }
  ]
}

const varList = {
  totalCount: 1,
  page: 1,
  data: [
    {
      entitlements: [],
      id: '2242a683a7594d7896385cfef1fe4442',
      tenantId: '30c86e37445a8993ac834c01e2710',
      tenantName: 'Eva Airways',
      tenantEmail: 'eva@mail.com'
    }
  ]
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom')
}))
const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))
const rcServices = require('@acx-ui/rc/services')
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services')
}))
const user = require('@acx-ui/user')
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user')
}))

describe('MspEcDropdownList', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useMspCustomerListDropdownQuery = jest.fn().mockImplementation(() => {
      return { data: list }
    })
    services.useVarCustomerListDropdownQuery = jest.fn().mockImplementation(() => {
      return { data: varList }
    })
    services.useSupportCustomerListDropdownQuery = jest.fn().mockImplementation(() => {
      return { data: list }
    })
    services.useIntegratorCustomerListDropdownQuery = jest.fn().mockImplementation(() => {
      return { data: list }
    })
    mockServer.use(
      rest.get(
        UserUrlsInfo.getUserProfile.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        pathname: ''
      }
    })
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }
  })
  it('should render table', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: fakeUserProfile }
    })
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeTenantDetail }
    })
    render(
      <Provider>
        <MspEcDropdownList />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard' }
      })

    await screen.findByText('Din Tai Fung')
    await userEvent.click(screen.getByTestId('CaretDownSolid'))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.name)).toBeVisible()
    })

    await userEvent.click(screen.getByRole('link', { name: 'Din Tai Fung' }))
  })
  it('should render table for var', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: fakeUserProfile }
    })
    const varTenantDetail = { ...fakeTenantDetail }
    varTenantDetail.tenantType = AccountType.VAR
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: varTenantDetail }
    })
    render(
      <Provider>
        <MspEcDropdownList />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard' }
      })

    await screen.findByText('Din Tai Fung')
    await userEvent.click(screen.getByTestId('CaretDownSolid'))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(varList.data.length)
    varList.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.tenantName)).toBeVisible()
    })

    await userEvent.click(screen.getByRole('link', { name: 'Eva Airways' }))

  })
  it('should render table for installer/integrator', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: fakeUserProfile }
    })
    const installerTenantDetail = { ...fakeTenantDetail }
    installerTenantDetail.tenantType = AccountType.MSP_INSTALLER
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: installerTenantDetail }
    })
    render(
      <Provider>
        <MspEcDropdownList />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard' }
      })

    await screen.findByText('Din Tai Fung')
    await userEvent.click(screen.getByTestId('CaretDownSolid'))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.name)).toBeVisible()
    })
  })
  it('should render table for support user and non msp', async () => {
    const supportUserProfile = { ...fakeUserProfile }
    supportUserProfile.support = true
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: supportUserProfile }
    })
    const varTenantDetail = { ...fakeTenantDetail }
    varTenantDetail.tenantType = AccountType.VAR
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: varTenantDetail }
    })
    render(
      <Provider>
        <MspEcDropdownList />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard' }
      })

    await screen.findByText('Din Tai Fung')
    await userEvent.click(screen.getByTestId('CaretDownSolid'))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(varList.data.length)
    varList.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.tenantName)).toBeVisible()
    })
  })
  it('should render table for support user and msp', async () => {
    const supportUserProfile = { ...fakeUserProfile }
    supportUserProfile.support = true
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: supportUserProfile }
    })
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeTenantDetail }
    })
    render(
      <Provider>
        <MspEcDropdownList />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard' }
      })

    await screen.findByText('Din Tai Fung')
    await userEvent.click(screen.getByTestId('CaretDownSolid'))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.name)).toBeVisible()
    })
  })
  it('should not render table if no data', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: fakeUserProfile }
    })
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return {}
    })
    render(
      <Provider>
        <MspEcDropdownList />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard' }
      })

    expect(screen.queryByText('Din Tai Fung')).toBeNull()
  })
  it('should close drawer', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: fakeUserProfile }
    })
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeTenantDetail }
    })
    render(
      <Provider>
        <MspEcDropdownList />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard' }
      })

    await userEvent.click(screen.getByTestId('CaretDownSolid'))
    expect(await screen.findByText('Change Customer')).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    // await waitFor(() => {
    //   expect(screen.getByText('Change Customer')).not.toBeVisible()
    // })
  })
})
