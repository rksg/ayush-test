/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { mspApi }                 from '@acx-ui/msp/services'
import { MspUrlsInfo }            from '@acx-ui/msp/utils'
import { administrationApi }      from '@acx-ui/rc/services'
import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }        from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'
import { UserProfileContext, UserProfileContextProps, setUserProfile } from '@acx-ui/user'

import { fakeUserProfile, fakedAdminLsit, fakeNonPrimeAdminUserProfile } from '../__tests__/fixtures'

import UsersTable from './index'

jest.mock('./AddUserDrawer', () => ({
  ...jest.requireActual('./AddUserDrawer'),
  __esModule: true,
  default: ({ visible, setVisible }: { visible: boolean, setVisible: (open:boolean) => void }) => {
    return visible ?
      <div data-testid='mocked-AddAdministratorDialog'>
        Add New User
        <button onClick={() => setVisible}>Cancel</button>
      </div>
      : ''
  }
}))

jest.mock('./EditUserDrawer', () => ({
  ...jest.requireActual('./EditUserDrawer'),
  __esModule: true,
  default: ({ visible, setVisible }: { visible: boolean, setVisible: (open:boolean) => void }) => {
    return visible ?
      <div data-testid='mocked-EditAdministratorDialog'>
        Edit User
        <button onClick={() => setVisible}>Cancel</button>
      </div>
      : ''
  }
}))

const isPrimeAdmin : () => boolean = jest.fn().mockReturnValue(true)
const userProfileContextValues = {
  data: fakeUserProfile,
  isPrimeAdmin
} as UserProfileContextProps

describe('User table without prime-admin itself', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    setUserProfile({ profile: fakeUserProfile, allowedOperations: [] })

    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }

    store.dispatch(administrationApi.util.resetApiState())
    store.dispatch(mspApi.util.resetApiState())

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getAdministrators.url,
        (req, res, ctx) => res(ctx.json([
          {
            id: '0587cbeb13404f3b9943d21f9e1d1e3e',
            email: 'abc.cheng@email.com',
            role: 'PRIME_ADMIN',
            delegateToAllECs: true,
            detailLevel: 'debug'
          },
          {
            id: '0587cbeb13404f3b9943d21f9e1d1r6r',
            email: 'erp.cheng@email.com',
            role: 'ADMIN',
            delegateToAllECs: false,
            detailLevel: 'debug'
          }
        ]))
      ),
      rest.get(
        AdministrationUrlsInfo.getRegisteredUsersList.url,
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.get(
        MspUrlsInfo.getMspProfile.url,
        (req, res, ctx) => res(ctx.json({
          msp_external_id: '0000A000001234YFFOO',
          msp_label: '',
          msp_tenant_name: ''
        }))
      ),
      rest.get(
        AdministrationUrlsInfo.getTenantAuthentications.url,
        (req, res, ctx) => res(ctx.json([]))
      )
    )
  })

  it('should not be able to delete all prime-admin', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <UsersTable
            currentUserMail='dog1551@email.com'
            isPrimeAdminUser={true}
            isMspEc={false}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const row = await screen.findByRole('row', { name: /abc.cheng@email.com/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
    })
  })
})

describe('User Table', () => {
  let params: { tenantId: string }
  const mockReqAdminsData = jest.fn()

  beforeEach(() => {
    mockReqAdminsData.mockReset()
    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }

    store.dispatch(administrationApi.util.resetApiState())
    store.dispatch(mspApi.util.resetApiState())

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getAdministrators.url,
        (req, res, ctx) => {
          mockReqAdminsData()
          return res(ctx.json(fakedAdminLsit))
        }
      ),
      rest.delete(
        AdministrationUrlsInfo.deleteAdmin.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.delete(
        AdministrationUrlsInfo.deleteAdmins.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.get(
        AdministrationUrlsInfo.getRegisteredUsersList.url,
        (req, res, ctx) => res(ctx.json([]))
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
          <UsersTable
            currentUserMail='dog1551@email.com'
            isPrimeAdminUser={true}
            isMspEc={false}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockReqAdminsData).toBeCalled()
    })
    const rows = await screen.findAllByRole('row', { name: /@email.com/i })
    expect(within(rows[2]).getByRole('cell', { name: /dog1551@email.com/ })).toBeVisible()
    expect(rows.length).toBe(3)
    expect(await screen.findByRole('button', { name: 'Add User' })).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Add User' }))
    expect(await screen.findByText('Add New User')).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    const row = await screen.findByRole('row', { name: /abc.cheng@email.com/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    expect(await screen.findByText('Edit User')).toBeInTheDocument()
    // const cancelBtn = within(screen.getByTestId('mocked-EditAdministratorDialog'))
    //   .getByRole('button', { name: 'Cancel' })
    // fireEvent.click(cancelBtn)
  })

  it('should hide edit button when multiple selected', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <UsersTable
            currentUserMail='dog1551@email.com'
            isPrimeAdminUser={true}
            isMspEc={false}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: 'abc.cheng@email.com' })).toBeVisible()
    fireEvent.click(within(rows[1]).getByRole('checkbox')) //abc.cheng@email.com
    expect(within(rows[1]).getByRole('checkbox')).toBeChecked()
    expect(within(rows[2]).getByRole('cell', { name: 'erp.cheng@email.com' })).toBeVisible()
    fireEvent.click(within(rows[2]).getByRole('checkbox')) //erp.cheng@email.com
    expect(within(rows[2]).getByRole('checkbox')).toBeChecked()
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('should delete selected row', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <UsersTable
            currentUserMail='dog1551@email.com'
            isPrimeAdminUser={true}
            isMspEc={false}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })
    const row = await screen.findByRole('row', { name: /erp.cheng@email.com/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "erp.cheng@email.com"?')
    const submitBtn = screen.getByRole('button', { name: 'Delete User' })
    await userEvent.click(submitBtn)
    await waitFor(() => {
      expect(submitBtn).not.toBeVisible()
    })
  })

  it('should delete selected row(multiple)', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <UsersTable
            currentUserMail='dog1551@email.com'
            isPrimeAdminUser={true}
            isMspEc={false}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: 'abc.cheng@email.com' })).toBeVisible()
    await userEvent.click(within(rows[1]).getByRole('checkbox')) //abc.cheng@email.com
    expect(within(rows[2]).getByRole('cell', { name: 'erp.cheng@email.com' })).toBeVisible()
    await userEvent.click(within(rows[2]).getByRole('checkbox')) //erp.cheng@email.com
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "2 Users"?')
    const submitBtn = screen.getByRole('button', { name: 'Delete Users' })
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(submitBtn).not.toBeVisible()
    })
  })

  it('should prime admin not be able to edit/delete himself/herself', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <UsersTable
            currentUserMail='dog1551@email.com'
            isPrimeAdminUser={true}
            isMspEc={false}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockReqAdminsData).toBeCalled()
    })
    const row = await screen.findByRole('row', { name: /dog1551@email.com/i })
    expect(within(row).getByRole('checkbox')).toBeDisabled()
  })

  it('should only prime-admin user allowed to select row', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={{
            data: fakeNonPrimeAdminUserProfile,
            isPrimeAdmin
          } as UserProfileContextProps}
        >
          <UsersTable
            currentUserMail='erp.cheng@email.com'
            isPrimeAdminUser={false}
            isMspEc={false}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const row = await screen.findByRole('row', { name: /abc.cheng@email.com/i })
    expect(within(row).queryByRole('checkbox')).toBeNull()
    expect(within(row).queryByRole('radio')).toBeNull()
  })

  it('should display blank when role is not valid', async () => {
    const newFakedAdminLsit = [...fakedAdminLsit]
    newFakedAdminLsit.push({
      id: 'invalid_role_id',
      email: 'invalidRole@email.com',
      role: 'ROLE',
      delegateToAllECs: false,
      detailLevel: 'debug'
    })

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getAdministrators.url,
        (req, res, ctx) => res(ctx.json(newFakedAdminLsit))
      )
    )

    render(
      <Provider>
        <UserProfileContext.Provider
          value={{
            data: fakeNonPrimeAdminUserProfile,
            isPrimeAdmin
          } as UserProfileContextProps}
        >
          <UsersTable
            currentUserMail='erp.cheng@email.com'
            isPrimeAdminUser={false}
            isMspEc={false}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const row = await screen.findByRole('row', { name: /invalidRole@email.com/i })
    const tableCells = within(row).getAllByRole('cell')
    expect((tableCells[tableCells.length - 1] as HTMLElement).textContent).toBe('')
  })
})

describe('User table with MSP-EC FF enabled', () => {
  let params: { tenantId: string }
  const adminAPIFn = jest.fn()

  beforeEach(() => {
    setUserProfile({ profile: fakeUserProfile, allowedOperations: [] })

    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }

    store.dispatch(administrationApi.util.resetApiState())
    store.dispatch(mspApi.util.resetApiState())

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getAdministrators.url,
        (req, res, ctx) => {
          adminAPIFn()
          return res(ctx.json([
            {
              id: '0587cbeb13404f3b9943d21f9e1d1e9e',
              email: 'efg.cheng@email.com',
              role: 'PRIME_ADMIN',
              delegateToAllECs: true,
              detailLevel: 'debug'
            }
          ]))
        }
      ),
      rest.get(
        AdministrationUrlsInfo.getRegisteredUsersList.url,
        (req, res, ctx) => res(ctx.json([]))
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

  it('should be able to delete all admin when it is MSP-EC user and FF enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return ff === Features.MSPEC_ALLOW_DELETE_ADMIN ? true : false
    })

    render(
      <Provider>
        <UserProfileContext.Provider
          value={{
            data: fakeUserProfile,
            isPrimeAdmin
          } as UserProfileContextProps}
        >
          <UsersTable
            currentUserMail='dog1551@email.com'
            isPrimeAdminUser={true}
            isMspEc={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    await waitFor(async () => {
      expect(adminAPIFn).toBeCalled()
    })

    expect(await screen.findByRole('row', { name: /efg.cheng@email.com/ })).toBeVisible()

    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(2)
    await userEvent.click(within(rows[1]).getByRole('checkbox'))
    expect(await screen.findByRole('button', { name: 'Delete' })).toBeVisible()
  })
})

describe('User table with pagination enabled (adminpaginatedquery API)', () => {
  let params: { tenantId: string }
  const mockReqPaginatedAdminsData = jest.fn()

  beforeEach(() => {
    setUserProfile({ profile: fakeUserProfile, allowedOperations: [] })

    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }

    store.dispatch(administrationApi.util.resetApiState())
    store.dispatch(mspApi.util.resetApiState())

    mockReqPaginatedAdminsData.mockReset()

    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.getAdministratorsPaginated.url,
        (req, res, ctx) => {
          mockReqPaginatedAdminsData(req.body)
          return res(ctx.json({
            content: fakedAdminLsit.map(admin => ({
              ...admin,
              name: admin.name || admin.email.split('@')[0],
              username: admin.email
            })),
            totalCount: fakedAdminLsit.length,
            totalPages: 1,
            pageNumber: 1,
            pageSize: 10
          }))
        }
      ),
      rest.delete(
        AdministrationUrlsInfo.deleteAdmin.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.delete(
        AdministrationUrlsInfo.deleteAdmins.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.get(
        AdministrationUrlsInfo.getRegisteredUsersList.url,
        (req, res, ctx) => res(ctx.json([]))
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

  it('should handle empty paginated results', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return ff === Features.PTENANT_USERS_PRIVILEGES_FILTER_TOGGLE ? true : false
    })

    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.getAdministratorsPaginated.url,
        (req, res, ctx) => {
          mockReqPaginatedAdminsData(req.body)
          return res(ctx.json({
            content: [],
            totalCount: 0,
            totalPages: 0,
            pageNumber: 1,
            pageSize: 10
          }))
        }
      )
    )

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <UsersTable
            currentUserMail='dog1551@email.com'
            isPrimeAdminUser={true}
            isMspEc={false}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockReqPaginatedAdminsData).toBeCalled()
    })

    // Verify table handles empty results gracefully
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })
})
