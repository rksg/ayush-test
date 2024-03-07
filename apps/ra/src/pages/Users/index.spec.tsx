import '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { rbacApi }                     from '@acx-ui/analytics/services'
import { ManagedUser }                 from '@acx-ui/analytics/utils'
import { useIsSplitOn }                from '@acx-ui/feature-toggle'
import { rbacApiURL, store, Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  waitForElementToBeRemoved,
  screen,
  fireEvent,
  within,
  findTBody
} from '@acx-ui/test-utils'


import { mockMangedUsers } from './__tests__/fixtures'

import Users from '.'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn().mockImplementation(() => ({
    selectedTenant: { settings: { franchisor: 'testFranchisor' } },
    userId: '111'
  }))
}))

jest.mock('./ImportSSOFileDrawer', () => ({
  ImportSSOFileDrawer: () =>
    <div data-testid='importSSOFileDrawer'>ImportSSOFileDrawer</div>
}))

jest.mock('./UserDrawer', () => ({
  UserDrawer: ({ type }: { type: string }) => <div data-testid='userDrawer'>{`${type}`}</div>
}))

const mockRGResponse = () => {
  mockServer.use(
    rest.get(`${rbacApiURL}/resourceGroups`,
      (_, res, ctx) => res(ctx.json([{
        id: 1,
        tenantId: 'resourceGroupTenant',
        filter: {},
        name: 'default',
        isDefault: false,
        description: 'test',
        updatedAt: '01-01-2024'
      }]))
    )
  )
}

const mockRbacUserResponse = (data: ManagedUser[] | undefined) => {
  mockServer.use(
    rest.get(`${rbacApiURL}/users`,
      (_, res, ctx) => res(ctx.json(data))
    )
  )
}

const mockSSOResponse = (fileContents?: string) => {
  mockServer.use(
    rest.get(`${rbacApiURL}/tenantSettings`,
      (_, res, ctx) => res(ctx.json([{
        key: 'sso',
        value: fileContents
          ? JSON.stringify({ type: 'saml2', metadata: fileContents })
          : JSON.stringify({})
      }]))
    )
  )
}

const mockRefreshUserResponse = (data?: { error?: string; userId: string }) => {
  mockServer.use(rest.put(`${rbacApiURL}/users/refresh/1`, (_, res, ctx) => res(ctx.json(data))))
}
const mockDeleteUserDetailsResponse = (data = {}) => {
  mockServer.use(
    rest.delete(`${rbacApiURL}/users/resourceGroup`, (_, res, ctx) => res(ctx.json({ ...data })))
  )
}
const mockDeleteInvitationResponse = (data = {}) => {
  mockServer.use(rest.delete(`${rbacApiURL}/invitations`, (_, res, ctx) => res(ctx.json(data))))
}

describe('Users Page', () => {
  beforeEach(() => {
    store.dispatch(rbacApi.util.resetApiState())
  })
  it('should render correctly', async () => {
    mockRbacUserResponse(mockMangedUsers)
    mockSSOResponse()
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Users (5)')).toBeVisible()
    const tbody = await findTBody()
    expect(await within(tbody).findAllByRole('row')).toHaveLength(5)
  })
  it('should render empty array correctly', async () => {
    mockRbacUserResponse([])
    mockSSOResponse()
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Users (0)')).toBeVisible()
    const tbody = await findTBody()
    expect(await within(tbody).findAllByRole('row')).toHaveLength(1)
  })
  it('should render undefined correctly', async () => {
    mockRbacUserResponse(undefined)
    mockSSOResponse()
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Users (0)')).toBeVisible()
    const tbody = await findTBody()
    expect(await within(tbody).findAllByRole('row')).toHaveLength(1)
  })
  it('should handle refresh user details correctly', async () => {
    mockRbacUserResponse([mockMangedUsers[0]])
    mockRefreshUserResponse({ userId: '1111' })
    mockSSOResponse()
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('Reload')).toBeVisible()
    fireEvent.click(await screen.findByTestId('Reload'))
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Refreshed user details successfully')).toBeVisible()
  })

  it('should handle refresh user details failure correctly', async () => {
    mockRbacUserResponse([mockMangedUsers[0]])
    mockRefreshUserResponse()
    mockSSOResponse()
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('Reload')).toBeVisible()
    fireEvent.click(await screen.findByTestId('Reload'))
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Refresh user details is unsuccessful')).toBeVisible()
  })
  it('should handle delete user details correctly for internal user', async () => {
    mockRbacUserResponse([mockMangedUsers[0]])
    mockDeleteUserDetailsResponse({ data: 'ok' })
    mockSSOResponse()
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('DeleteOutlined')).toBeVisible()
    fireEvent.click(await screen.findByTestId('DeleteOutlined'))
    expect(
      await screen.findByText('Do you really want to remove firstName dog1 lastName dog1?')
    ).toBeVisible()
    fireEvent.click(await screen.findByText('OK'))
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Deleted user details successfully')).toBeVisible()
  })
  it('should handle delete user details failure correctly for internal user', async () => {
    mockRbacUserResponse([mockMangedUsers[0]])
    mockSSOResponse()
    mockServer.use(
      rest.delete(`${rbacApiURL}/users/resourceGroup`, (_, res, ctx) => res(ctx.status(404)))
    )
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('DeleteOutlined')).toBeVisible()
    fireEvent.click(await screen.findByTestId('DeleteOutlined'))
    expect(
      await screen.findByText('Do you really want to remove firstName dog1 lastName dog1?')
    ).toBeVisible()
    fireEvent.click(await screen.findByText('OK'))
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Delete user details is unsuccessful')).toBeVisible()
  })
  it('should handle delete invitation correctly for external user', async () => {
    mockRbacUserResponse([mockMangedUsers[2]])
    mockDeleteInvitationResponse({ data: 'ok' })
    mockSSOResponse()
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('DeleteOutlined')).toBeVisible()
    fireEvent.click(await screen.findByTestId('DeleteOutlined'))
    expect(
      await screen.findByText('Do you really want to remove FisrtName 12 LastName 12?')
    ).toBeVisible()
    fireEvent.click(await screen.findByText('OK'))
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Deleted user details successfully')).toBeVisible()
  })
  it('should open drawer to edit user', async () => {
    mockRbacUserResponse([mockMangedUsers[0]])
    mockSSOResponse()
    mockRGResponse()
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('EditOutlined')).toBeVisible()
    fireEvent.click(await screen.findByTestId('EditOutlined'))
    expect(await screen.findByTestId('userDrawer')).toHaveTextContent('edit')
  })
  it('should open user drawer for add internal user correctly', async () => {
    mockRbacUserResponse([])
    mockSSOResponse('samlFile')
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    const userBtn = await screen.findByText('Add User...')
    expect(userBtn).toBeVisible()
    await userEvent.click(userBtn)
    await userEvent.click(await screen.findByText('Internal'))
    expect(await screen.findByTestId('userDrawer')).toHaveTextContent('addInternal')
  })
  it('should open user drawer for 3rd party user correctly', async () => {
    mockRbacUserResponse([])
    mockSSOResponse('samlFile')
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    const userBtn = await screen.findByText('Add User...')
    expect(userBtn).toBeVisible()
    await userEvent.click(userBtn)
    await userEvent.click(await screen.findByText('3rd Party'))
    expect(await screen.findByTestId('userDrawer')).toHaveTextContent('invite3rdParty')
  })
  it('should show ConfigureSSO button correctly when ruckus-ai-sso-toggle is enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockRbacUserResponse(mockMangedUsers)
    mockSSOResponse('samlFile')
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    const updateSSOBtn = await screen.findByText('Configure SSO')
    expect(updateSSOBtn).toBeVisible()
    fireEvent.click(updateSSOBtn)
    expect(await screen.findByTestId('importSSOFileDrawer')).toBeVisible()
  })
  it('should hide ConfigureSSO correctly when ruckus-ai-sso-toggle is disabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockRbacUserResponse(mockMangedUsers)
    mockSSOResponse('samlFile')
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    const updateSSOBtn = await screen.findByText('Configure SSO')
    expect(updateSSOBtn).not.toBeVisible()
  })
})
