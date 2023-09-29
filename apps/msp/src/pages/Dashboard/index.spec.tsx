import '@testing-library/jest-dom'

import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { Dashboard } from '.'


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

export const fakeTenantDetail1 = {
  createdDate: '2022-12-24T01:06:03.205+00:00',
  entitlementId: 'asgn__24de8731-832c-4191-b1b0-c2d2a339d6b1_GioRFRJW',
  externalId: '_24de8731-832c-4191-b1b0-c2d2a339d6b1_GioRFRJW',
  id: '2242a683a7594d7896385cfef1fe4442',
  isActivated: true,
  maintenanceState: false,
  name: 'MSP eleu1658',
  ruckusUser: false,
  status: 'active',
  tenantType: 'MSP',
  updatedDate: '2022-12-24T01:06:05.021+00:00',
  upgradeGroup: 'production'
}

export const fakeTenantDetail2 = {
  createdDate: '2022-12-24T01:06:03.205+00:00',
  entitlementId: 'asgn__24de8731-832c-4191-b1b0-c2d2a339d6b1_GioRFRJW',
  externalId: '_24de8731-832c-4191-b1b0-c2d2a339d6b1_GioRFRJW',
  id: '2242a683a7594d7896385cfef1fe4442',
  isActivated: true,
  maintenanceState: false,
  name: 'Din Tai Fung',
  ruckusUser: false,
  status: 'active',
  tenantType: 'VAR',
  updatedDate: '2022-12-24T01:06:05.021+00:00',
  upgradeGroup: 'production'
}

const rcServices = require('@acx-ui/rc/services')
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services')
}))
const user = require('@acx-ui/user')
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user')
}))
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Dashboard', () => {
  let params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }
  //   beforeEach(async () => {
  //     params = {
  //       tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  //     }
  //   })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should navigate to MSP correctly', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeTenantDetail1 }
    })
    render(
      <Provider>
        <Dashboard />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard' }
      })
  })
  it('should navigate to VAR correctly', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeTenantDetail2 }
    })
    render(
      <Provider>
        <Dashboard />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard' }
      })
  })
})
