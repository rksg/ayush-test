/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { UserProfileContext, UserProfileContextProps } from '@acx-ui/rbac'
import { AdministrationUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { fakeUserProfile, fakedAdminLsit, fakeNonPrimeAdminUserProfile } from '../__tests__/fixtures'

import AdministratorsTable from './index'

const isPrimeAdmin : () => boolean = jest.fn().mockReturnValue(true)
const userProfileContextValues = {
  data: fakeUserProfile,
  isPrimeAdmin
} as UserProfileContextProps


describe('Administrators table without prime-admin itself', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }

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
      )
    )
  })

  it('should not be able to delete all prime-admin', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <AdministratorsTable
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
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
  })
})

describe('Administrators Table', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getAdministrators.url,
        (req, res, ctx) => res(ctx.json(fakedAdminLsit))
      ),
      rest.delete(
        AdministrationUrlsInfo.deleteAdmin.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.delete(
        AdministrationUrlsInfo.deleteAdmins.url,
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
          <AdministratorsTable
            currentUserMail='dog1551@email.com'
            isPrimeAdminUser={true}
            isMspEc={false}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('row', { name: /dog1551@email.com/i })
    const rows = await screen.findAllByRole('row', { name: /@email.com/i })
    expect(rows.length).toBe(3)
    expect(await screen.findByRole('button', { name: 'Add Administrator' })).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Add Administrator' }))
    await waitFor(async () => {
      expect(await screen.findByText('Add New Administrator')).toBeInTheDocument()
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    const row = await screen.findByRole('row', { name: /abc.cheng@email.com/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    await waitFor(async () => {
      expect(await screen.findByText('Edit Administrator')).toBeInTheDocument()
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it('should hide edit button when multiple selected', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <AdministratorsTable
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
    const row2 = await screen.findByRole('row', { name: /erp.cheng@email.com/i })
    await userEvent.click(within(row2).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('should delete selected row', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <AdministratorsTable
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
    await screen.findByText('Delete " "?')
    await userEvent.click(screen.getByRole('button', { name: 'Delete Administrators' }))
  })

  it('should delete selected row(multiple)', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <AdministratorsTable
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
    const row2 = await screen.findByRole('row', { name: /erp.cheng@email.com/i })
    await userEvent.click(within(row2).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "2 Administrators"?')
    await userEvent.click(screen.getByRole('button', { name: 'Delete Administrators' }))
  })

  it('should prime admin not be able to edit/delete himself/herself', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <AdministratorsTable
            currentUserMail='dog1551@email.com'
            isPrimeAdminUser={true}
            isMspEc={false}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const row = await screen.findByRole('row', { name: /dog1551@email.com/i })
    expect(within(row).getByRole('checkbox')).toBeDisabled()
  })


  it('should non-prime-admin user only single selection', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={{
            data: fakeNonPrimeAdminUserProfile,
            isPrimeAdmin
          } as UserProfileContextProps}
        >
          <AdministratorsTable
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
    await userEvent.click(within(row).getByRole('radio'))
    expect(within(row).queryByRole('button', { name: 'Delete' })).toBeNull()
    expect(within(row).queryByRole('button', { name: 'Edit' })).toBeNull()
    await userEvent.click(within(await screen.findByRole('row', { name: /erp.cheng@email.com/i })).getByRole('radio'))
    expect(within(row).queryByRole('button', { name: 'Delete' })).toBeNull()
    expect(within(row).queryByRole('button', { name: 'Edit' })).toBeNull()
  })
})
