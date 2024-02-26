/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                            from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent,
  mockServer,
  waitFor
} from '@acx-ui/test-utils'

import { AddPrivilegeGroup } from './AddPrivilegeGroup'

const mspServices = require('@acx-ui/msp/services')
const services = require('@acx-ui/rc/services')
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => {
    return { state: {
      name: 'custom role',
      description: 'custom role'
    } }},
  useTenantLink: () => jest.fn()
}))
describe('Add Privilege Group', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }
    jest.spyOn(services, 'useAddPrivilegeGroupMutation')
    mspServices.useGetMspProfileQuery = jest.fn().mockImplementation(() => {
      return { data: {} }
    })
    services.useGetCustomRolesQuery = jest.fn().mockImplementation(() => {
      return { data: [{ name: 'PRIME_ADMIN' }] }
    })
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.addPrivilegeGroup.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })
  it('should render correctly', async () => {
    render(
      <Provider>
        <AddPrivilegeGroup />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('New Privilege Group')).toBeVisible()
    expect(screen.getByText('Name')).toBeVisible()
    expect(screen.getByText('Description')).toBeVisible()
    expect(screen.getByText('Role')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should validate and save correctly', async () => {
    render(
      <Provider>
        <AddPrivilegeGroup />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('New Privilege Group')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    // Clicking Add button without a name or role selected should result in alert
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('Please enter Name')).toBeVisible()
    expect(await screen.findByText('Please enter Role')).toBeVisible()

    // Should be able to add after inputting role name and selecting role
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'custom group' } })
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(screen.queryByText('Please enter Name')).toBeNull()
    })
    expect(screen.getByText('Please enter Role')).toBeVisible()
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Role' }))
    await userEvent.click(screen.getByText('Prime Admin'))
    await waitFor(() => {
      expect(screen.queryByText('Please enter Role')).toBeNull()
    })

    await userEvent.click(screen.getByRole('radio', { name: 'Specific Venue(s)' }))
    await userEvent.click(screen.getByRole('button', { name: 'Select venues' }))
    await userEvent.click(screen.getByRole('radio', { name: 'All Venues' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Specific Customer(s)' }))
    await userEvent.click(screen.getByRole('button', { name: 'Select customers' }))
    await userEvent.click(screen.getByRole('radio', { name: 'All Customers' }))

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]

    await waitFor(() => {
      expect(services.useAddPrivilegeGroupMutation).toHaveLastReturnedWith(value)
    })
    expect(mockedUsedNavigate).toHaveBeenLastCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/privilegeGroups`,
      hash: '',
      search: ''
    })
  })
  it('should close correctly', async () => {
    render(
      <Provider>
        <AddPrivilegeGroup />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('New Privilege Group')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockedUsedNavigate).toHaveBeenLastCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/privilegeGroups`,
      hash: '',
      search: ''
    })
  })
})