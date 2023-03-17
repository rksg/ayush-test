/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { act }   from 'react-dom/test-utils'

import { AdministrationUrlsInfo, MspUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'
import { UserProfileContext, UserProfileContextProps, setUserProfile } from '@acx-ui/user'

import { fakeUserProfile, fakedAdminLsit, fakeNonPrimeAdminUserProfile } from '../__tests__/fixtures'

import AdministratorsTable from './index'

jest.mock('./AddAdministratorDialog', () => ({
  ...jest.requireActual('./AddAdministratorDialog'),
  __esModule: true,
  default: ({ visible, setVisible }: { visible: boolean, setVisible: (open:boolean) => void }) => {
    return visible ?
      <div data-testid='mocked-AddAdministratorDialog'>
        Add New Administrator
        <button onClick={() => setVisible}>Cancel</button>
      </div>
      : ''
  }
}))

jest.mock('./EditAdministratorDialog', () => ({
  ...jest.requireActual('./EditAdministratorDialog'),
  __esModule: true,
  default: ({ visible, setVisible }: { visible: boolean, setVisible: (open:boolean) => void }) => {
    return visible ?
      <div data-testid='mocked-EditAdministratorDialog'>
        Edit Administrator
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

describe('Administrators table without prime-admin itself', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    setUserProfile({ profile: fakeUserProfile, allowedOperations: [] })

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
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await userEvent.click(within(row2).getByRole('checkbox'))
    })

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

  it('should only prime-admin user allowed to select row', async () => {
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
          <AdministratorsTable
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
