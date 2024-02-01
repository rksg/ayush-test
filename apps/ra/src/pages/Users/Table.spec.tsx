import '@testing-library/react'
import { Provider }                                     from '@acx-ui/store'
import { findTBody, fireEvent, render, screen, within } from '@acx-ui/test-utils'
import { noDataDisplay }                                from '@acx-ui/utils'

import { mockMangedUsers } from './__tests__/fixtures'
import { UsersTable }      from './Table'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn().mockImplementation(() => ({
    selectedTenant: { settings: { franchisor: 'testFranchisor' } },
    userId: '111',
    accountId: '12345'
  }))
}))
const toggleDrawer = jest.fn()
const setSelectedRow= jest.fn()
const getLatestUserDetails= jest.fn()
const handleDeleteUser= jest.fn()
const setUsersCount = jest.fn()
describe('UsersTable', () => {
  it('should render table correctly', async () => {
    render(<UsersTable
      toggleDrawer={toggleDrawer}
      setSelectedRow={setSelectedRow}
      getLatestUserDetails={getLatestUserDetails}
      handleDeleteUser={handleDeleteUser}
      data={mockMangedUsers}
      setUsersCount={setUsersCount} />,
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
    expect(setUsersCount).toHaveBeenCalledWith(5)
  })
  it('should render undefined data table correctly', async () => {
    render(<UsersTable
      toggleDrawer={toggleDrawer}
      setSelectedRow={setSelectedRow}
      getLatestUserDetails={getLatestUserDetails}
      handleDeleteUser={handleDeleteUser}
      data={undefined}
      setUsersCount={setUsersCount} />,
    { wrapper: Provider })
    const tbody = await findTBody()
    expect(await within(tbody).findAllByRole('row')).toHaveLength(1)
    expect(setUsersCount).toHaveBeenCalledWith(0)
  })
  it('should handle the edit callback', async () => {
    render(<UsersTable
      toggleDrawer={toggleDrawer}
      setSelectedRow={setSelectedRow}
      getLatestUserDetails={getLatestUserDetails}
      handleDeleteUser={handleDeleteUser}
      data={[mockMangedUsers[0]]}
      setUsersCount={setUsersCount} />,
    { wrapper: Provider })
    expect(await screen.findByTestId('EditOutlined')).toBeVisible()
    fireEvent.click(await screen.findByTestId('EditOutlined'))
    expect(toggleDrawer).toBeCalledTimes(1)
    expect(setUsersCount).toHaveBeenCalledWith(1)
  })
  it('should handle the delete callback', async () => {
    render(<UsersTable
      toggleDrawer={toggleDrawer}
      setSelectedRow={setSelectedRow}
      getLatestUserDetails={getLatestUserDetails}
      handleDeleteUser={handleDeleteUser}
      data={[mockMangedUsers[0]]}
      setUsersCount={setUsersCount} />,
    { wrapper: Provider })
    expect(await screen.findByTestId('DeleteOutlined')).toBeVisible()
    fireEvent.click(await screen.findByTestId('DeleteOutlined'))
    expect(handleDeleteUser).toBeCalledTimes(1)
    expect(setUsersCount).toHaveBeenCalledWith(1)
  })
  it('should handle the refresh callback', async () => {
    render(<UsersTable
      toggleDrawer={toggleDrawer}
      setSelectedRow={setSelectedRow}
      getLatestUserDetails={getLatestUserDetails}
      handleDeleteUser={handleDeleteUser}
      data={[mockMangedUsers[0]]}
      setUsersCount={setUsersCount} />,
    { wrapper: Provider })
    expect(await screen.findByTestId('Reload')).toBeVisible()
    fireEvent.click(await screen.findByTestId('Reload'))
    expect(getLatestUserDetails).toBeCalledTimes(1)
    expect(setUsersCount).toHaveBeenCalledWith(1)
  })
  it('should disable edit and delete for the same user', async () => {
    render(<UsersTable
      toggleDrawer={toggleDrawer}
      setSelectedRow={setSelectedRow}
      getLatestUserDetails={getLatestUserDetails}
      handleDeleteUser={handleDeleteUser}
      data={mockMangedUsers}
      setUsersCount={setUsersCount} />,
    { wrapper: Provider })
    expect((await screen.findAllByTestId('EditOutlinedDisabledIcon')).length).toEqual(4)
    expect((await screen.findAllByTestId('DeleteOutlinedDisabledIcon')).length).toEqual(4)
    expect(setUsersCount).toHaveBeenCalledWith(5)
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
      role: 'admin' as const,
      tenantId: '0015000000GlI7SAAV',
      resourceGroupId: '087b6de8-953f-405e-b2c2-000000000000',
      resourceGroupName: 'default',
      updatedAt: '2023-09-22T07:31:11.844Z',
      type: null,
      invitation: null
    }
    render(<UsersTable
      toggleDrawer={toggleDrawer}
      setSelectedRow={setSelectedRow}
      getLatestUserDetails={getLatestUserDetails}
      handleDeleteUser={handleDeleteUser}
      data={[user]}
      setUsersCount={setUsersCount} />,
    { wrapper: Provider })
    expect((await screen.findAllByTestId('EditOutlinedDisabledIcon')).length).toEqual(1)
    expect((await screen.findAllByTestId('DeleteOutlinedDisabledIcon')).length).toEqual(1)
    expect(setUsersCount).toHaveBeenCalledWith(1)
  })
})
