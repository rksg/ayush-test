import '@testing-library/jest-dom'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { Provider }               from '@acx-ui/store'
import { render, screen  }        from '@acx-ui/test-utils'

import { AssignedSubscriptionTable } from '.'

const assignmentHistory =
  [
    {
      createdBy: 'msp.eleu1658@rwbigdog.com',
      dateAssignmentCreated: '2022-12-13 19:00:08.043Z',
      dateAssignmentRevoked: null,
      dateEffective: '2022-12-13 19:00:08Z',
      dateExpires: '2024-02-12 07:59:59Z',
      deviceType: 'MSP_WIFI',
      id: 130468,
      mspEcTenantId: '1576b79db6b549f3b1f3a7177d7d4ca5',
      mspTenantId: '3061bd56e37445a8993ac834c01e2710',
      quantity: 2,
      revokedBy: null,
      status: 'VALID',
      trialAssignment: false
    },
    {
      createdBy: 'msp.eleu1658@rwbigdog.com',
      dateAssignmentCreated: '2022-12-13 19:00:08.117Z',
      dateAssignmentRevoked: null,
      dateEffective: '2022-12-13 19:00:08Z',
      dateExpires: '2023-09-12 07:59:59Z',
      deviceSubType: 'ICX76',
      deviceType: 'MSP_SWITCH',
      id: 130469,
      mspEcTenantId: '1576b79db6b549f3b1f3a7177d7d4ca5',
      mspTenantId: '3061bd56e37445a8993ac834c01e2710',
      quantity: 2,
      revokedBy: null,
      status: 'VALID',
      trialAssignment: false
    },
    {
      createdBy: 'msp.eleu1658@rwbigdog.com',
      dateAssignmentCreated: '2022-12-14 19:00:08.117Z',
      dateAssignmentRevoked: null,
      dateEffective: '2022-12-14 19:00:08Z',
      dateExpires: '2023-02-13 07:59:59Z',
      deviceSubType: 'ICX76',
      deviceType: 'MSP_SWITCH',
      id: 130470,
      mspEcTenantId: '1576b79db6b549f3b1f3a7177d7d4ca5',
      mspTenantId: '3061bd56e37445a8993ac834c01e2710',
      quantity: 2,
      revokedBy: null,
      status: 'EXPIRED',
      trialAssignment: false
    }
  ]

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('AssignedSubscriptionTable', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useMspAssignmentHistoryQuery = jest.fn().mockImplementation(() => {
      return { data: assignmentHistory }
    })
    params = {
      tenantId: '1576b79db6b549f3b1f3a7177d7d4ca5'
    }
  })
  it('should render correctly', async () => {
    render(
      <Provider>
        <AssignedSubscriptionTable />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(await screen.findByText('Wi-Fi')).toBeVisible()
    expect(screen.getByText('Switch')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Generate Usage Report' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Manage Subscriptions' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Refresh' })).toBeNull()
  })
  it('should render correctly feature flag on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.DEVICE_AGNOSTIC)
    render(
      <Provider>
        <AssignedSubscriptionTable />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(await screen.findByText('Wi-Fi')).toBeVisible()
    expect(screen.getByText('Switch')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Generate Usage Report' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Manage Subscriptions' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Refresh' })).toBeNull()
  })

})
