import '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Roles }                                                    from '@acx-ui/analytics/utils'
import { Provider, rbacApiURL }                                     from '@acx-ui/store'
import { findTBody, fireEvent, mockServer, render, screen, within } from '@acx-ui/test-utils'
import { noDataDisplay }                                            from '@acx-ui/utils'

import { mockDisplayUsers } from './__tests__/fixtures'
import { UsersTable }       from './Table'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn().mockImplementation(() => ({
    selectedTenant: {
      settings: { franchisor: 'testFranchisor' },
      support: true
    },
    userId: '111',
    accountId: '12345'
  }))
}))
const setSelectedRow = jest.fn()
const refreshUserDetails = jest.fn()
const handleDeleteUser = jest.fn()
const setDrawerType = jest.fn()
const setOpenDrawer = jest.fn()
const setVisible = jest.fn()
const selectedRow = null
const openDrawer = false
const isUsersPageEnabled = true
const isEditMode = true
describe('UsersTable', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(`${rbacApiURL}/tenantSettings`, (_req, res, ctx) => res(
        ctx.json(
          [{ key: 'brand-name', value: 'testFranchisor' }]
        ))
      )
    )
  })
  it('should render table correctly', async () => {
    render(<UsersTable
      data={mockDisplayUsers}
      selectedRow={selectedRow}
      setSelectedRow={setSelectedRow}
      refreshUserDetails={refreshUserDetails}
      handleDeleteUser={handleDeleteUser}
      setDrawerType={setDrawerType}
      setOpenDrawer={setOpenDrawer}
      openDrawer={openDrawer}
      isUsersPageEnabled={isUsersPageEnabled}
      isEditMode={isEditMode}
      setVisible={setVisible}
    />,
    { wrapper: Provider })
    const tbody = await findTBody()
    expect(await within(tbody).findAllByRole('row')).toHaveLength(5)
    expect(await screen.findByText('firstName dog1')).toBeVisible()
    expect(await screen.findByText('FisrtName 1062')).toBeVisible()
    expect(await screen.findByText('FisrtName 12')).toBeVisible()
    expect(await screen.findByText('FisrtName rej')).toBeVisible()
    expect(await screen.findAllByText(noDataDisplay)).toHaveLength(4)
    expect(await screen.findByText('Pending')).toBeVisible()
    expect(await screen.findByText('Accepted')).toBeVisible()
    expect(await screen.findByText('Rejected')).toBeVisible()
    expect(await screen.findByText('userFirst userSecond')).toBeVisible()
    expect(await screen.findByText('userThird userFourth')).toBeVisible()
    expect(await screen.findByText('userRej userRej')).toBeVisible()
  })
  it('should render undefined data table correctly', async () => {
    render(<UsersTable
      data={undefined}
      selectedRow={selectedRow}
      setSelectedRow={setSelectedRow}
      refreshUserDetails={refreshUserDetails}
      handleDeleteUser={handleDeleteUser}
      setDrawerType={setDrawerType}
      setOpenDrawer={setOpenDrawer}
      openDrawer={openDrawer}
      isUsersPageEnabled={isUsersPageEnabled}
      isEditMode={isEditMode}
      setVisible={setVisible}
    />,
    { wrapper: Provider })
    const tbody = await findTBody()
    expect(await within(tbody).findAllByRole('row')).toHaveLength(1)
  })
  it('should handle the edit callback', async () => {
    render(<UsersTable
      data={[mockDisplayUsers[0]]}
      selectedRow={mockDisplayUsers[0]}
      setSelectedRow={setSelectedRow}
      refreshUserDetails={refreshUserDetails}
      handleDeleteUser={handleDeleteUser}
      setDrawerType={setDrawerType}
      setOpenDrawer={setOpenDrawer}
      openDrawer={openDrawer}
      isUsersPageEnabled={isUsersPageEnabled}
      isEditMode={isEditMode}
      setVisible={setVisible}
    />,
    { wrapper: Provider })

    const radio = await screen.findByRole('radio')
    fireEvent.click(radio)

    const editButton = await screen.findByRole('button', { name: 'Edit' })
    expect(editButton).toBeVisible()
    fireEvent.click(editButton)

    expect(setDrawerType).toHaveBeenCalledWith('edit')
  })

  it.each([
    [mockDisplayUsers[0]],
    [mockDisplayUsers[1]]
  ])('should handle the delete callback',
    async (mockUser) => {

      render(<UsersTable
        data={[mockUser]}
        selectedRow={mockUser}
        setSelectedRow={setSelectedRow}
        refreshUserDetails={refreshUserDetails}
        handleDeleteUser={handleDeleteUser}
        setDrawerType={setDrawerType}
        setOpenDrawer={setOpenDrawer}
        openDrawer={openDrawer}
        isUsersPageEnabled={isUsersPageEnabled}
        isEditMode={isEditMode}
        setVisible={setVisible}
      />,
      { wrapper: Provider })

      handleDeleteUser.mockClear()
      const radio = await screen.findByRole('radio')
      fireEvent.click(radio)

      const deleteButton = await screen.findByRole('button', { name: 'Delete' })
      expect(deleteButton).toBeVisible()
      fireEvent.click(deleteButton)

      expect(handleDeleteUser).toBeCalledTimes(1)
    })
  it('should handle the refresh callback', async () => {
    render(<UsersTable
      data={[mockDisplayUsers[1]]}
      selectedRow={mockDisplayUsers[1]}
      setSelectedRow={setSelectedRow}
      refreshUserDetails={refreshUserDetails}
      handleDeleteUser={handleDeleteUser}
      setDrawerType={setDrawerType}
      setOpenDrawer={setOpenDrawer}
      openDrawer={openDrawer}
      isUsersPageEnabled={isUsersPageEnabled}
      isEditMode={isEditMode}
      setVisible={setVisible}
    />,
    { wrapper: Provider })

    const radio = await screen.findByRole('radio')
    fireEvent.click(radio)

    const refreshButton = await screen.findByRole('button', { name: 'Refresh' })
    expect(refreshButton).toBeVisible()
    fireEvent.click(refreshButton)

    expect(refreshUserDetails).toBeCalledTimes(1)
  })
  it('should disable edit and delete for the same user', async () => {
    render(<UsersTable
      data={mockDisplayUsers}
      selectedRow={selectedRow}
      setSelectedRow={setSelectedRow}
      refreshUserDetails={refreshUserDetails}
      handleDeleteUser={handleDeleteUser}
      setDrawerType={setDrawerType}
      setOpenDrawer={setOpenDrawer}
      openDrawer={openDrawer}
      isUsersPageEnabled={isUsersPageEnabled}
      isEditMode={isEditMode}
      setVisible={setVisible}
    />,
    { wrapper: Provider })

    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])

    const editButton = await screen.findByRole('button', { name: 'Edit' })
    const deleteButton = await screen.findByRole('button', { name: 'Delete' })
    expect(editButton).toBeVisible()
    expect(deleteButton).toBeVisible()

    expect(editButton).toBeDisabled()
    expect(deleteButton).toBeDisabled()
  })
  it('should disable edit and delete for non host user', async () => {
    jest.mock('@acx-ui/analytics/utils', () => ({
      ...jest.requireActual('@acx-ui/analytics/utils'),
      getUserProfile: jest.fn().mockImplementation(() => ({
        selectedTenant: { settings: { franchisor: 'testFranchisor' } },
        userId: '111',
        accountId: '12345'
      }))
    }))
    const user = {
      id: '1',
      firstName: 'firstName dog1',
      lastName: 'lastName dog1',
      email: 'dog1@ruckuswireless.com.uat',
      accountId: '1234',
      accountName: 'RUCKUS NETWORKS, INC',
      role: Roles.PRIME_ADMINISTRATOR,
      tenantId: '0015000000GlI7SAAV',
      resourceGroupId: '087b6de8-953f-405e-b2c2-000000000000',
      resourceGroupName: 'default',
      updatedAt: '2023-09-22T07:31:11.844Z',
      type: null,
      invitation: null,
      displayType: 'Internal',
      displayInvitationState: '--',
      displayInvitor: '--',
      isSupport: false
    }
    render(<UsersTable
      data={[user]}
      selectedRow={user}
      setSelectedRow={setSelectedRow}
      refreshUserDetails={refreshUserDetails}
      handleDeleteUser={handleDeleteUser}
      setDrawerType={setDrawerType}
      setOpenDrawer={setOpenDrawer}
      openDrawer={openDrawer}
      isUsersPageEnabled={isUsersPageEnabled}
      isEditMode={isEditMode}
      setVisible={setVisible}
    />,
    { wrapper: Provider })

    const radio = await screen.findByRole('radio')
    fireEvent.click(radio)

    const editButton = await screen.findByRole('button', { name: 'Edit' })
    const deleteButton = await screen.findByRole('button', { name: 'Delete' })
    expect(editButton).toBeVisible()
    expect(deleteButton).toBeVisible()

    expect(editButton).toBeDisabled()
    expect(deleteButton).toBeDisabled()
  })
})
