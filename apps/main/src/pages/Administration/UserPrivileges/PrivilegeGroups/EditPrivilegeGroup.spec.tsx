/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                            from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import {
  render,
  screen,
  mockServer,
  waitFor
} from '@acx-ui/test-utils'

import { EditPrivilegeGroup } from './EditPrivilegeGroup'

const mspServices = require('@acx-ui/msp/services')
const services = require('@acx-ui/rc/services')
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => {
    return { state: {
      name: 'custom role',
      description: 'custom role',
      roleName: 'PRIME_ADMIN'
    } }},
  useTenantLink: () => jest.fn()
}))
describe('Edit Privilege Group', () => {
  let params: { tenantId: string, groupId: string }
  beforeEach(() => {
    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f',
      groupId: 'abc'
    }
    jest.spyOn(services, 'useUpdatePrivilegeGroupMutation')
    mspServices.useGetMspProfileQuery = jest.fn().mockImplementation(() => {
      return { data: {} }
    })
    services.useGetCustomRolesQuery = jest.fn().mockImplementation(() => {
      return { data: [{ name: 'PRIME_ADMIN' }] }
    })
    mockServer.use(
      rest.put(
        AdministrationUrlsInfo.updatePrivilegeGroup.url,
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
        <EditPrivilegeGroup />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Group Settings')).toBeVisible()
    expect(screen.getByText('Name')).toBeVisible()
    expect(screen.getByText('Description')).toBeVisible()
    expect(screen.getByText('Role')).toBeVisible()
    expect(screen.getByText('Scope')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should save correctly', async () => {
    render(
      <Provider>
        <EditPrivilegeGroup />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Group Settings')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]

    await waitFor(() => {
      expect(services.useUpdatePrivilegeGroupMutation).toHaveLastReturnedWith(value)
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
        <EditPrivilegeGroup />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Group Settings')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockedUsedNavigate).toHaveBeenLastCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/privilegeGroups`,
      hash: '',
      search: ''
    })
  })
})