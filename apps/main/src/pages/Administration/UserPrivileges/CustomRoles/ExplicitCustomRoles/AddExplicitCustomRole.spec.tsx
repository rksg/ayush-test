/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent,
  mockServer,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { fakedExplicitCustomRoleList, fakedScopeTree } from '../../__tests__/fixtures'

import { AddExplicitCustomRole } from './AddExplicitCustomRole'

const services = require('@acx-ui/rc/services')
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => {
    return { state: {
      name: 'custom role',
      description: 'custom role',
      features: ['wifi.clients-c','wired.venue-u']
    } }},
  useTenantLink: () => jest.fn()
}))
describe('Add Explicit Custom Role', () => {
  let params: { tenantId: string, action: string, customRoleId?: string }
  beforeEach(() => {
    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f',
      action: 'add'
    }
    jest.spyOn(services, 'useAddCustomRoleMutation')
    jest.spyOn(services, 'useUpdateCustomRoleMutation')
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.addCustomRole.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.put(
        AdministrationUrlsInfo.updateCustomRole.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      )
    )
    services.useGetCustomRolesQuery = jest.fn().mockImplementation(() => {
      return { data: fakedExplicitCustomRoleList }
    })
    services.useGetCustomRoleFeaturesQuery = jest.fn().mockImplementation(() => {
      return { data: fakedScopeTree }
    })
  })
  it('should render correctly for add', async () => {
    render(
      <Provider>
        <AddExplicitCustomRole />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Add Admin Role')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'General' })).toBeVisible()
    expect(screen.getByText('Role Name')).toBeVisible()
    expect(screen.getByText('Role Description')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Next' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should validate role name correctly', async () => {
    render(
      <Provider>
        <AddExplicitCustomRole />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Add Admin Role')).toBeVisible()
    expect(screen.getByText('Role Name')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Next' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    // Clicking Next button without a role name should result in alert
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Please enter Role Name')).toBeVisible()
    expect(screen.queryByText('Set the permissions for this role:')).toBeNull()

    // Should be able to click to next page after inputting role name
    fireEvent.change(screen.getByLabelText('Role Name'), { target: { value: 'custom role' } })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.queryByText('Please enter Role Name')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Permissions' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Global Permissions' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Advanced Permissions' })).toBeVisible()
  })
  it('should save correctly for add', async () => {
    render(
      <Provider>
        <AddExplicitCustomRole />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Add Admin Role')).toBeVisible()
    expect(screen.getByText('Role Name')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    fireEvent.change(screen.getByLabelText('Role Name'), { target: { value: 'custom role' } })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('heading', { name: 'Permissions' })).toBeVisible()
    await userEvent.click(screen.getAllByRole('checkbox')[1])
    await userEvent.click(screen.getByRole('tab', { name: 'Advanced Permissions' }))
    expect(await screen.findByRole('tab', { name: 'Wi-Fi' })).toBeVisible()
    await userEvent.click(screen.getAllByRole('checkbox')[1])
    await userEvent.click(screen.getAllByRole('checkbox')[2])
    await userEvent.click(screen.getAllByRole('checkbox')[3])
    await userEvent.click(screen.getAllByRole('button', { name: 'Expand row' })[0])
    const row = await screen.findByRole('row', { name: /Account Management/i })
    await userEvent.click(within(row).getAllByRole('checkbox')[1])

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('General Information')).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]

    await waitFor(() => {
      expect(services.useAddCustomRoleMutation).toHaveLastReturnedWith(value)
    })
    expect(mockedUsedNavigate).toHaveBeenLastCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/customRoles`,
      hash: '',
      search: ''
    })
  })
  it('should render correctly for edit', async () => {
    params.action = 'edit'
    params.customRoleId = 'abc'
    render(
      <Provider>
        <AddExplicitCustomRole />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Edit Admin Role')).toBeVisible()
    expect(screen.getByText('Role Name')).toBeVisible()
    expect(screen.getByText('Role Description')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Permissions' }))
    await userEvent.click(screen.getByRole('tab', { name: 'Advanced Permissions' }))
    await userEvent.click(screen.getByRole('tab', { name: 'Wi-Fi' }))
    const clientsRow = await screen.findByRole('row', { name: /Clients/i })
    expect(within(clientsRow).getAllByRole('checkbox')[1]).toBeChecked()
    await userEvent.click(screen.getByRole('tab', { name: 'Wired' }))
    const venueRow = await screen.findByRole('row', { name: /Venue/i })
    expect(within(venueRow).getAllByRole('checkbox')[2]).toBeChecked()

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '456' },
      status: 'fulfilled'
    })]

    await waitFor(() => {
      expect(services.useUpdateCustomRoleMutation).toHaveLastReturnedWith(value)
    })
    expect(mockedUsedNavigate).toHaveBeenLastCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/customRoles`,
      hash: '',
      search: ''
    })
  })
  it('should render correctly for clone', async () => {
    params.action = 'clone'
    params.customRoleId = 'abc'

    render(
      <Provider>
        <AddExplicitCustomRole />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Clone Admin Role')).toBeVisible()
    expect(screen.getByText('Role Name')).toBeVisible()
    expect(screen.getByText('Role Description')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Next' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should close correctly', async () => {
    render(
      <Provider>
        <AddExplicitCustomRole />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Add Admin Role')).toBeVisible()
    expect(screen.getByText('Role Name')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockedUsedNavigate).toHaveBeenLastCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/customRoles`,
      hash: '',
      search: ''
    })
  })
})