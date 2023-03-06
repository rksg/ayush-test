import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'
import { Urls }                       from '@acx-ui/user'

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
      status: 'Active',
      streetAddress: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC'
    }
  ]
}

const tenantId = '3061bd56e37445a8993ac834c01e2710'

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  TenantIdFromJwt: () => ({ tenantId })
}))
jest.mock('@acx-ui/rc/components', () => ({
  useUserProfileContext: () => ({
    data: { support: false }
  })
}))

describe('MspEcDropdownList', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        Urls.getUserProfile.url,
        (req, res, ctx) => res(ctx.json(fakeUserProfile))
      ),
      rest.get(
        MspUrlsInfo.getTenantDetail.url,
        (req, res, ctx) => res(ctx.json(fakeTenantDetail))
      ),
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }
  })
  it('should render table', async () => {
    render(
      <Provider>
        <MspEcDropdownList />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard' }
      })

    await screen.findByText('Din Tai Fung')
    await userEvent.click(screen.getByTestId('CaretDownSolid'))

    // eslint-disable-next-line testing-library/no-node-access
    // const tbody = screen.getByRole('table').querySelector('tbody')!
    // expect(tbody).toBeVisible()

    // const rows = await within(tbody).findAllByRole('row')
    // expect(rows).toHaveLength(list.data.length)
    // list.data.forEach((item, index) => {
    //   expect(within(rows[index]).getByText(item.name)).toBeVisible()
    // })

  })
})
