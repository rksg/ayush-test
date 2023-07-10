import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { AssignMspLicense } from '.'

const assignmentSummary =
  [
    {
      courtesyMspEntitlementsUsed: false,
      deviceType: 'MSP_WIFI',
      quantity: 93,
      remainingDevices: 12,
      trial: false
    },
    {
      courtesyMspEntitlementsUsed: false,
      deviceSubType: 'ICX_76',
      deviceType: 'MSP_SWITCH',
      quantity: 13,
      remainingDevices: 92,
      trial: false
    }
  ]

const assignmentHistory =
  [
    {
      createdBy: 'msp.eleu1658@rwbigdog.com',
      dateAssignmentCreated: '2022-12-13 19:00:08.043Z',
      dateAssignmentRevoked: null,
      dateEffective: '2022-12-13 19:00:08Z',
      dateExpires: '2023-02-12 07:59:59Z',
      deviceType: 'MSP_WIFI',
      id: 130468,
      mspEcTenantId: '07f91671d606451f85f6320eec76cc5e',
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
      dateExpires: '2023-02-12 07:59:59Z',
      deviceSubType: 'ICX76',
      deviceType: 'MSP_SWITCH',
      id: 130469,
      mspEcTenantId: '07f91671d606451f85f6320eec76cc5e',
      mspTenantId: '3061bd56e37445a8993ac834c01e2710',
      quantity: 2,
      revokedBy: null,
      status: 'VALID',
      trialAssignment: false
    }
  ]

describe('AssignMspLicense', () => {
  let params: { tenantId: string, mspEcTenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        MspUrlsInfo.getMspAssignmentSummary.url,
        (req, res, ctx) => res(ctx.json(assignmentSummary))
      )
    )
    mockServer.use(
      rest.get(
        MspUrlsInfo.getMspAssignmentHistory.url,
        (req, res, ctx) => res(ctx.json(assignmentHistory))
      )
    )
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710',
      mspEcTenantId: '1576b79db6b549f3b1f3a7177d7d4ca5'
    }
  })
  it('should render correctly', async () => {
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params, path: '/:tenantId/msplicenses/assign' }
      })

    expect(screen.getByText('Assign Subscription')).toBeVisible()

    expect(screen.getByRole('heading', { name: 'Subscriptions' })).toBeVisible()

    expect(screen.getByRole('button', { name: 'Assign' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()

  })

  xit('should validate required inputs correctly', async () => {
    render(
      <Provider>
        <AssignMspLicense />
      </Provider>, {
        route: { params, path: '/:tenantId/msplicenses/assign' }
      })

  })


})
