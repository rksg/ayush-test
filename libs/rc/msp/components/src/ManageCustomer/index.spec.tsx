import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                     from '@acx-ui/feature-toggle'
import { MspUrlsInfo }                                                      from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo }                                           from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                     from '@acx-ui/user'

import { ManageCustomer } from '.'

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


describe('ManageCustomer', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })
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
        <ManageCustomer />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(screen.getByText('Add Customer Account')).toBeVisible()

    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Start service in' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()

    expect(screen.getByPlaceholderText('Set address here')).toBeDisabled()
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    render(
      <Provider>
        <ManageCustomer />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(screen.queryByText('My Customers')).toBeNull()
    expect(screen.queryByText('MSP Customers')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Customers'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <ManageCustomer />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(await screen.findByText('My Customers')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'MSP Customers'
    })).toBeVisible()
  })

  it('should validate required inputs correctly', async () => {
    render(
      <Provider>
        <ManageCustomer />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(screen.getByPlaceholderText('Set address here')).toBeDisabled()
    expect(screen.queryByText('Please enter Customer Name')).toBeNull()

    // Click 'Next' button
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    // Should still be on first "Account Details" page due to invalid input
    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Start service in' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    // Validator alert should appear for invalid input
    expect(await screen.findByText('Please enter Customer Name')).toBeVisible()
  })

  xit('should have correct workflow', async () => {
    render(
      <Provider>
        <ManageCustomer />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    // Set required inputs
    const customerNameInput = screen.getByRole('textbox', { name: 'Customer Name' })
    fireEvent.change(customerNameInput, { target: { value: 'John' } })

    const emailInput = screen.getByRole('textbox', { name: 'Email' })
    fireEvent.change(emailInput, { target: { value: 'john@mail.com' } })

    const firstNameInput = screen.getByRole('textbox', { name: 'First Name' })
    fireEvent.change(firstNameInput, { target: { value: 'John' } })

    const lastNameInput = screen.getByRole('textbox', { name: 'Last Name' })
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } })

    // Click 'Next' button
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'close-circle' }))

    // Should be on second "Subscriptions" page
    expect(screen.getByRole('button', { name: 'Back' })).not.toBeDisabled()
    expect(screen.getByRole('heading', { name: 'Start service in' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Account Details' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    // Click 'Next' button
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    // Should be on last "Summary" page
    expect(screen.getByRole('button', { name: 'Back' })).not.toBeDisabled()
    expect(screen.getByRole('heading', { name: 'Summary' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Start service in' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Account Details' })).toBeNull()

    // Click 'Back' button
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    // Should be back on second "Subscriptions" page
    expect(screen.getByRole('button', { name: 'Back' })).not.toBeDisabled()
    expect(screen.getByRole('heading', { name: 'Start service in' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Account Details' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    // Click 'Back' button
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    // Should be back on first "Account Details" page
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Start service in' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    // Click 'Cancel' button
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    // Page should no longer be visible
    expect(screen.queryByRole('heading', { name: 'Start service in' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Account Details' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

  })

})
