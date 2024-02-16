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

import { fakeUserProfile } from '../__tests__/fixtures'

import AdminGroups from './index'

export const fakedAdminGroupLsit = [
  {
    id: '9eb59863e3474e7296ff01eb7ca59de4',
    createdDate: '2023-12-13T22:03:21.681+00:00',
    updatedDate: '2023-12-13T22:03:21.681+00:00',
    name: 'IT_Admins',
    groupId: 'IT_Admins@corporate.com',
    processingPriority: 8,
    loggedMembers: 0,
    role: 'PRIME_ADMIN',
    customRole: {
      id: '1765e98c7b9446e2a5bdd4720e0e8912',
      createdDate: '2023-12-01T00:13:58.122+00:00',
      updatedDate: '2023-12-01T00:13:58.122+00:00',
      name: 'PRIME_ADMIN',
      description: 'Prime Admin Role',
      roleType: 'PRE_DEFINED',
      policyBased: false,
      frameworkRO: false
    }
  },
  {
    id: '20fcf1bd463e4f43bada2582cc425ad1',
    createdDate: '2023-12-13T21:58:30.204+00:00',
    updatedDate: '2023-12-13T21:58:30.204+00:00',
    name: 'test group 1',
    groupId: 'groupId123',
    processingPriority: 7,
    loggedMembers: 0,
    role: 'READ_ONLY',
    customRole: {
      id: '1765e98c7b9446e2a5bdd4720e0e8913',
      createdDate: '2023-12-01T00:13:58.122+00:00',
      updatedDate: '2023-12-01T00:13:58.122+00:00',
      name: 'READ_ONLY',
      description: 'Read only Role',
      roleType: 'PRE_DEFINED',
      policyBased: false,
      frameworkRO: false
    }
  },
  {
    id: 'd60a491a3994463daafdc9a1cdfd3039',
    createdDate: '2023-12-13T21:33:45.970+00:00',
    updatedDate: '2023-12-13T21:37:56.583+00:00',
    name: 'test group 2',
    groupId: 'groupId888',
    processingPriority: 6,
    loggedMembers: 0,
    customRole: {
      id: '1765e98c7b9446e2a5bdd4720e0e8911',
      createdDate: '2023-12-01T00:13:58.122+00:00',
      updatedDate: '2023-12-01T00:13:58.122+00:00',
      description: 'Admin Role',
      roleType: 'PRE_DEFINED',
      policyBased: false,
      frameworkRO: false
    }
  }
]

const isPrimeAdmin : () => boolean = jest.fn().mockReturnValue(true)
const userProfileContextValues = {
  data: fakeUserProfile,
  isPrimeAdmin
} as UserProfileContextProps


describe('Admin Groups Table', () => {
  let params: { tenantId: string }
  const mockReqAdminsData = jest.fn()

  beforeEach(() => {
    mockReqAdminsData.mockReset()
    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getAdminGroups.url,
        (req, res, ctx) => {
          mockReqAdminsData()
          return res(ctx.json(fakedAdminGroupLsit))
        }
      ),
      rest.delete(
        AdministrationUrlsInfo.deleteAdminGroups.url,
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
          <AdminGroups
            isPrimeAdminUser={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockReqAdminsData).toBeCalled()
    })
    const table = await screen.findByTestId('AdminGroupTable')
    expect(table).toHaveTextContent(/IT_Admins/i)
    expect(table).toHaveTextContent(/@corporate.com/i)
    expect(await screen.findByRole('button', { name: 'Add SSO Group' })).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Add SSO Group' }))
    expect(await screen.findByText('Add SSO User Group')).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    const row = await screen.findByRole('row', { name: /IT_Admins/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    expect(await screen.findByText('Edit SSO User Group')).toBeInTheDocument()
  })
  it('should render correctly for non prime admin', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <AdminGroups
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
          <AdminGroups
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
          <AdminGroups
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
          <AdminGroups
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

