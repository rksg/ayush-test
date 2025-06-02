/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'
import { UserProfileContext, UserProfileContextProps } from '@acx-ui/user'
import { DetailLevel, UserProfile }                    from '@acx-ui/user'

import { fakedPrivilegeGroupList } from '../__tests__/fixtures'

import PrivilegeGroups from './index'

export const fakeUserProfile = {
  region: '[NA]',
  allowedRegions: [
    {
      name: 'US',
      description: 'United States of America',
      link: 'https://dev.ruckus.cloud',
      current: true
    }
  ],
  externalId: '0032h00000LUqcoAAD',
  pver: 'acx-hybrid',
  companyName: 'Dog Company 1551',
  firstName: 'FisrtName 1551',
  lastName: 'LastName 1551',
  username: 'dog1551@email.com',
  role: 'PRIME_ADMIN',
  roles: ['PRIME_ADMIN'],
  detailLevel: DetailLevel.DEBUGGING,
  dateFormat: 'mm/dd/yyyy',
  email: 'dog1551@email.com',
  var: false,
  tenantId: '8c36a0a9ab9d4806b060e112205add6f',
  varTenantId: '8c36a0a9ab9d4806b060e112205add6f',
  adminId: 'f5ca6ac1a8cf4929ac5b78d6a1392599',
  support: false,
  dogfood: false
} as UserProfile

const isPrimeAdmin : () => boolean = jest.fn().mockReturnValue(true)
const userProfileContextValues = {
  data: fakeUserProfile,
  isPrimeAdmin
} as UserProfileContextProps

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const mspServices = require('@acx-ui/msp/services')
const services = require('@acx-ui/rc/services')

describe('New Privilege Group Table', () => {
  let params: { tenantId: string }
  const mockReqAdminsData = jest.fn()

  beforeEach(() => {
    mockReqAdminsData.mockReset()
    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }

    services.useGetPrivilegeGroupsQuery = jest.fn().mockImplementation(() => {
      mockReqAdminsData()
      return { data: fakedPrivilegeGroupList }
    })
    mspServices.useGetMspProfileQuery = jest.fn().mockImplementation(() => {
      return {
        data: {
          msp_external_id: '0000A000001234YFFOO',
          msp_label: 'msp-eleu',
          msp_tenant_name: ''
        }
      }
    })

    mockServer.use(
      rest.delete(
        AdministrationUrlsInfo.deletePrivilegeGroup.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <PrivilegeGroups
            isPrimeAdminUser={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockReqAdminsData).toBeCalled()
    })
    const table = await screen.findByTestId('PrivilegeGroupTable')
    expect(table).toHaveTextContent(/Name/i)
    expect(table).toHaveTextContent(/Description/i)
    expect(await screen.findByRole('button', { name: 'Add Privilege Group' })).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Add Privilege Group' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/privilegeGroups/create`,
      hash: '',
      search: ''
    }, { state: { isOnboardedMsp: true } })
  })
  it('should render correctly for non prime admin', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <PrivilegeGroups
            isPrimeAdminUser={false}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockReqAdminsData).toBeCalled()
    })
  })
  it('should delete selected privilege group', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <PrivilegeGroups
            isPrimeAdminUser={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })
    const row = await screen.findByRole('row', { name: /privilege group/i })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "wi-fi privilege group"?')
    const submitBtn = screen.getByRole('button', { name: 'Delete Group' })
    await userEvent.click(submitBtn)
    await waitFor(() => {
      expect(submitBtn).not.toBeVisible()
    })
  })
  xit('should view selected system row', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <PrivilegeGroups
            isPrimeAdminUser={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })
    const customRow = await screen.findByRole('row', { name: /privilege group/i })
    await userEvent.click(within(customRow).getByRole('radio'))
    expect(screen.queryByRole('button', { name: 'View' })).toBeNull()
    const systemRow = await screen.findByRole('row', { name: /Prime Admin/i })
    await userEvent.click(within(systemRow).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: 'View' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/privilegeGroups/view/2765e98c7b9446e2a5bdd4720e0e8912`,
      hash: '',
      search: ''
    }, { state: {
      description: 'Prime Admin Role', id: '2765e98c7b9446e2a5bdd4720e0e8912',
      name: 'PRIME_ADMIN', allCustomers: false, delegation: false, roleName: 'PRIME_ADMIN', type: 'System' } })
  })
  it('should edit selected custom row', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <PrivilegeGroups
            isPrimeAdminUser={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const systemRow = await screen.findByRole('row', { name: /Prime Admin/i })
    await userEvent.click(within(systemRow).getByRole('radio'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
    const customRow = await screen.findByRole('row', { name: /privilege group/i })
    await userEvent.click(within(customRow).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/privilegeGroups/edit/99bb7b958a5544898cd0b938fa800a5a`,
      hash: '',
      search: ''
    }, { state: { isOnboardedMsp: true, name: 'wi-fi privilege group' } })
  })
  it('should clone selected row', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <PrivilegeGroups
            isPrimeAdminUser={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const systemRow = await screen.findByRole('row', { name: /Read Only/i })
    await userEvent.click(within(systemRow).getByRole('radio'))
    expect(screen.getByRole('button', { name: 'Clone' })).toBeVisible()
    const customRow = await screen.findByRole('row', { name: /privilege group/i })
    await userEvent.click(within(customRow).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: 'Clone' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/privilegeGroups/clone/99bb7b958a5544898cd0b938fa800a5a`,
      hash: '',
      search: ''
    }, { state: { isOnboardedMsp: true } })
  })
})

