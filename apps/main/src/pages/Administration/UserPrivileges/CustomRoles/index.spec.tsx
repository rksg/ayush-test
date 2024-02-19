/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }            from '@acx-ui/msp/utils'
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

import CustomRoles from './index'

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

export const fakedCustomRoleLsit = [
  {
    description: 'Admin Role',
    id: '1765e98c7b9446e2a5bdd4720e0e8911',
    name: 'ADMIN',
    type: 'System'
  },
  {
    description: 'Prime Admin Role',
    id: '1765e98c7b9446e2a5bdd4720e0e8912',
    name: 'PRIME_ADMIN',
    type: 'System'
  },
  {
    description: 'Read only Role',
    id: '1765e98c7b9446e2a5bdd4720e0e8913',
    name: 'READ_ONLY',
    type: 'System'
  },
  {
    description: 'this is new custom role for wi-fi',
    id: 'df2277fb9f8c403c8b1a12ffe6ae9809',
    name: 'new wi-fi custom role',
    type: 'Custom',
    scope: [
      'wifi-profile-r',
      'wifi-profile-u'
    ]
  }
]

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
const services = require('@acx-ui/rc/services')

describe('Custom Roles Table', () => {
  let params: { tenantId: string }
  const mockReqAdminsData = jest.fn()

  beforeEach(() => {
    mockReqAdminsData.mockReset()
    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }

    services.useGetCustomRolesQuery = jest.fn().mockImplementation(() => {
      mockReqAdminsData()
      return { data: fakedCustomRoleLsit }
    })

    mockServer.use(
      rest.delete(
        AdministrationUrlsInfo.deleteCustomRole.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.get(
        MspUrlsInfo.getMspProfile.url,
        (req, res, ctx) => res(ctx.json({
          msp_external_id: '0000A000001234YFFOO',
          msp_label: '',
          msp_tenant_name: ''
        }))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <CustomRoles
            isPrimeAdminUser={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockReqAdminsData).toBeCalled()
    })
    const table = await screen.findByTestId('CustomRoleTable')
    expect(table).toHaveTextContent(/Name/i)
    expect(table).toHaveTextContent(/Description/i)
    expect(await screen.findByRole('button', { name: 'Add Role' })).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Add Role' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/customRoles/create`,
      hash: '',
      search: ''
    })

    // expect(await screen.findByText('Add Admin Role')).toBeInTheDocument()
    // await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    // const row = await screen.findByRole('row', { name: /Admin Role/i })
    // await userEvent.click(within(row).getByRole('checkbox'))
    // await userEvent.click(await screen.findByRole('button', { name: 'View' }))
    // expect(await screen.findByText('Edit Admin Role')).toBeInTheDocument()
  })
  it('should render correctly for non prime admin', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <CustomRoles
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
  it('should delete selected custom row', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <CustomRoles
            isPrimeAdminUser={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })
    const row = await screen.findByRole('row', { name: /custom role/i })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "new wi-fi custom role"?')
    const submitBtn = screen.getByRole('button', { name: 'Delete Role' })
    await userEvent.click(submitBtn)
    await waitFor(() => {
      expect(submitBtn).not.toBeVisible()
    })
  })
  it('should view selected system row', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <CustomRoles
            isPrimeAdminUser={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })
    const customRow = await screen.findByRole('row', { name: /custom role/i })
    await userEvent.click(within(customRow).getByRole('radio'))
    expect(screen.queryByRole('button', { name: 'View' })).toBeNull()
    const systemRow = await screen.findByRole('row', { name: /PRIME_ADMIN/i })
    await userEvent.click(within(systemRow).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: 'View' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/customRoles/view/1765e98c7b9446e2a5bdd4720e0e8912`,
      hash: '',
      search: ''
    }, { state: { description: 'Prime Admin Role', id: '1765e98c7b9446e2a5bdd4720e0e8912', name: 'PRIME_ADMIN', type: 'System' } })
  })
  it('should edit selected custom row', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <CustomRoles
            isPrimeAdminUser={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const systemRow = await screen.findByRole('row', { name: /PRIME_ADMIN/i })
    await userEvent.click(within(systemRow).getByRole('radio'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
    const customRow = await screen.findByRole('row', { name: /custom role/i })
    await userEvent.click(within(customRow).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/customRoles/edit/df2277fb9f8c403c8b1a12ffe6ae9809`,
      hash: '',
      search: ''
    }, { state: {
      description: 'this is new custom role for wi-fi', id: 'df2277fb9f8c403c8b1a12ffe6ae9809',
      name: 'new wi-fi custom role', scope: [ 'wifi-profile-r', 'wifi-profile-u' ], type: 'Custom'
    } })
  })
  it('should clone selected row', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <CustomRoles
            isPrimeAdminUser={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const systemRow = await screen.findByRole('row', { name: /PRIME_ADMIN/i })
    await userEvent.click(within(systemRow).getByRole('radio'))
    expect(screen.getByRole('button', { name: 'Clone' })).toBeVisible()
    const customRow = await screen.findByRole('row', { name: /custom role/i })
    await userEvent.click(within(customRow).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: 'Clone' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/customRoles/clone/df2277fb9f8c403c8b1a12ffe6ae9809`,
      hash: '',
      search: ''
    }, { state: {
      description: 'this is new custom role for wi-fi', id: 'df2277fb9f8c403c8b1a12ffe6ae9809',
      name: 'new wi-fi custom role', scope: [ 'wifi-profile-r', 'wifi-profile-u' ], type: 'Custom'
    } })
  })
})

