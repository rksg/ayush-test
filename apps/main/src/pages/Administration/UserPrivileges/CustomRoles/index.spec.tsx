/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }            from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  fireEvent,
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


describe('Custom Roles Table', () => {
  let params: { tenantId: string }
  const mockReqAdminsData = jest.fn()

  beforeEach(() => {
    mockReqAdminsData.mockReset()
    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getCustomRoles.url,
        (req, res, ctx) => {
          mockReqAdminsData()
          return res(ctx.json(fakedCustomRoleLsit))
        }
      ),
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
    expect(await screen.findByText('Add Admin Role')).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    const row = await screen.findByRole('row', { name: /Admin Role/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'View' }))
    expect(await screen.findByText('Edit Admin Role')).toBeInTheDocument()
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

  it('should hide edit button when multiple selected', async () => {
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

    const rows = await screen.findAllByRole('row')
    expect(within(rows[3]).getByRole('cell', { name: 'IT_Admins' })).toBeVisible()
    fireEvent.click(within(rows[3]).getByRole('checkbox')) //IT_Admins
    expect(within(rows[3]).getByRole('checkbox')).toBeChecked()
    expect(within(rows[2]).getByRole('cell', { name: 'test group 1' })).toBeVisible()
    fireEvent.click(within(rows[2]).getByRole('checkbox')) //test group 1
    expect(within(rows[2]).getByRole('checkbox')).toBeChecked()

    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('should delete selected row', async () => {
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
    const row = await screen.findByRole('row', { name: /IT_Admins/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "IT_Admins"?')
    const submitBtn = screen.getByRole('button', { name: 'Delete Group' })
    await userEvent.click(submitBtn)
    await waitFor(() => {
      expect(submitBtn).not.toBeVisible()
    })
  })

  it.skip('should delete selected row(multiple)', async () => {
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

    const rows = await screen.findAllByRole('row')
    await userEvent.click(within(rows[0]).getByRole('checkbox')) //abc.cheng@email.com
    await userEvent.click(within(rows[2]).getByRole('checkbox')) //erp.cheng@email.com
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "2 Administrators"?')
    const submitBtn = screen.getByRole('button', { name: 'Delete Administrators' })
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(submitBtn).not.toBeVisible()
    })
  })
})

