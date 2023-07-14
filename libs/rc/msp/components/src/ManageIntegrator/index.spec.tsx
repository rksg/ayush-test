import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'
import { UserUrlsInfo }               from '@acx-ui/user'

import { ManageIntegrator } from '.'

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

const userProfile =
    {
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


describe('ManageIntegrator', () => {
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
    mockServer.use(
      rest.get(
        UserUrlsInfo.getUserProfile.url,
        (req, res, ctx) => res(ctx.json(userProfile))
      ),
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({ global: {
          mapRegion: 'TW'
        } }))
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
        <ManageIntegrator />
      </Provider>, {
        route: { params, path: '/:tenantId/integrators/create' }
      })

    expect(screen.getByText('Add Tech Partner')).toBeVisible()

    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Customers' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Subscriptions' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()
  })

  it('should validate required inputs correctly', async () => {
    render(
      <Provider>
        <ManageIntegrator />
      </Provider>, {
        route: { params, path: '/:tenantId/integrators/create' }
      })

    // expect(screen.getByPlaceholderText('Set address here')).toBeDisabled()
    expect(screen.queryByText('Please enter Account Name')).toBeNull()

    // Click 'Next' button
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    // Should still be on first "Account Details" page due to invalid input
    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Customers' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Subscriptions' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    // Validator alert should appear for invalid input
    expect(await screen.findByText('Please enter Account Name')).toBeVisible()
  })


})
