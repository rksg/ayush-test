import '@testing-library/react'
import userEvent   from '@testing-library/user-event'
import { message } from 'antd'
import { rest }    from 'msw'

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
import { RaiPermissions, raiPermissionsList, setRaiPermissions } from '@acx-ui/user'

import { mockManagedUsers } from './__tests__/fixtures'

import { useUsers } from '.'

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

const mockRefreshUserResponse = () => {
  mockServer.use(rest.put(`${rbacApiURL}/users/refresh/1`, (_, res, ctx) => res(ctx.text('OK'))))
}
const mockDeleteUserDetailsResponse = () => {
  mockServer.use(
    rest.delete(`${rbacApiURL}/users`, (_, res, ctx) => res(ctx.text('OK')))
  )
}
const mockDeleteInvitationResponse = () => {
  mockServer.use(rest.delete(`${rbacApiURL}/invitations`, (_, res, ctx) => res(ctx.text(''))))
}

describe('Users Page', () => {
  const permissions = Object.keys(raiPermissionsList)
    .filter(v => isNaN(Number(v)))
    .reduce((permissions, name) => ({ ...permissions, [name]: true }), {}) as RaiPermissions

  beforeEach(() => {
    setRaiPermissions(permissions)
    store.dispatch(rbacApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })
  afterEach(() => message.destroy())
  it('should render correctly', async () => {
    mockRbacUserResponse(mockManagedUsers)
    mockSSOResponse()
    const Component = () => {
      const { component } = useUsers()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const tbody = await findTBody()
    expect(await within(tbody).findAllByRole('row')).toHaveLength(5)
  })
  it('should render empty array correctly', async () => {
    mockRbacUserResponse([])
    mockSSOResponse()
    const Component = () => {
      const { component } = useUsers()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const tbody = await findTBody()
    expect(await within(tbody).findAllByRole('row')).toHaveLength(1)
  })
  it('should render undefined correctly', async () => {
    mockRbacUserResponse(undefined)
    mockSSOResponse()
    const Component = () => {
      const { component } = useUsers()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const tbody = await findTBody()
    expect(await within(tbody).findAllByRole('row')).toHaveLength(1)
  })
  it('should handle refresh user details correctly', async () => {
    mockRbacUserResponse([mockManagedUsers[0]])
    mockRefreshUserResponse()
    mockSSOResponse()
    const Component = () => {
      const { component } = useUsers()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const radio = await screen.findByRole('radio')
    fireEvent.click(radio)

    const refreshButton = await screen.findByRole('button', { name: 'Refresh' })
    expect(refreshButton).toBeVisible()
    fireEvent.click(refreshButton)

    expect(await screen.findByText('Refreshed user details successfully')).toBeVisible()
  })
  it('should handle refresh user details failure with error message correctly', async () => {
    mockRbacUserResponse([mockManagedUsers[0]])
    mockSSOResponse()
    const error = { status: 500, message: 'Internal Server Error.' }
    mockServer.use(
      rest.put(`${rbacApiURL}/users/refresh/1`, (_, res, ctx) => res(
        ctx.status(error.status),
        ctx.text(error.message)
      ))
    )
    const Component = () => {
      const { component } = useUsers()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const radio = await screen.findByRole('radio')
    fireEvent.click(radio)

    const refreshButton = await screen.findByRole('button', { name: 'Refresh' })
    expect(refreshButton).toBeVisible()
    fireEvent.click(refreshButton)

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const message = `Error: ${error.message}. (status code: ${error.status})`
    expect(await screen.findByText(message)).toBeVisible()
  })
  it('should handle delete user details correctly for internal user', async () => {
    mockRbacUserResponse([mockManagedUsers[0]])
    mockDeleteUserDetailsResponse()
    mockSSOResponse()
    const Component = () => {
      const { component } = useUsers()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const radio = await screen.findByRole('radio')
    await userEvent.click(radio)

    const deleteButton = await screen.findByRole('button', { name: 'Delete' })
    expect(deleteButton).toBeVisible()
    await userEvent.click(deleteButton)

    expect(
      await screen.findByText('Do you really want to remove firstName dog1 lastName dog1?')
    ).toBeVisible()
    await userEvent.click(await screen.findByText('OK'))
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Deleted user details successfully')).toBeVisible()
  })
  it('should handle delete user details failure correctly for internal user', async () => {
    mockRbacUserResponse([mockManagedUsers[0]])
    mockSSOResponse()
    mockServer.use(
      rest.delete(`${rbacApiURL}/users`, (_, res, ctx) => res(ctx.status(404)))
    )
    const Component = () => {
      const { component } = useUsers()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })

    const radio = await screen.findByRole('radio')
    await userEvent.click(radio)

    const deleteButton = await screen.findByRole('button', { name: 'Delete' })
    expect(deleteButton).toBeVisible()
    await userEvent.click(deleteButton)

    expect(
      await screen.findByText('Do you really want to remove firstName dog1 lastName dog1?')
    ).toBeVisible()
    await userEvent.click(await screen.findByText('OK'))
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Delete user details is unsuccessful')).toBeVisible()
  })

  // eslint-disable-next-line max-len
  it('should handle delete user details failure with error message correctly for internal user', async () => {
    mockRbacUserResponse([mockManagedUsers[0]])
    mockSSOResponse()
    const error = { status: 422, message: 'error message' }
    mockServer.use(
      rest.delete(`${rbacApiURL}/users`, (_, res, ctx) => res(
        ctx.status(error.status),
        ctx.json({ error: error.message })
      ))
    )
    const Component = () => {
      const { component } = useUsers()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })

    const radio = await screen.findByRole('radio')
    await userEvent.click(radio)

    const deleteButton = await screen.findByRole('button', { name: 'Delete' })
    expect(deleteButton).toBeVisible()
    await userEvent.click(deleteButton)

    expect(
      await screen.findByText('Do you really want to remove firstName dog1 lastName dog1?')
    ).toBeVisible()
    await userEvent.click(await screen.findByText('OK'))
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const message = `Error: ${error.message}. (status code: ${error.status})`
    expect(await screen.findByText(message)).toBeVisible()
  })
  it('should handle delete invitation correctly for external user', async () => {
    mockRbacUserResponse([mockManagedUsers[2]])
    mockDeleteInvitationResponse()
    mockSSOResponse()
    const Component = () => {
      const { component } = useUsers()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })

    const radio = await screen.findByRole('radio')
    await userEvent.click(radio)

    const deleteButton = await screen.findByRole('button', { name: 'Delete' })
    expect(deleteButton).toBeVisible()
    await userEvent.click(deleteButton)

    expect(
      await screen.findByText('Do you really want to remove FisrtName 12 LastName 12?')
    ).toBeVisible()
    await userEvent.click(await screen.findByText('OK'))
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Deleted user details successfully')).toBeVisible()
  })
  it('should open drawer to edit user', async () => {
    mockRbacUserResponse([mockManagedUsers[0]])
    mockSSOResponse()
    mockRGResponse()
    const Component = () => {
      const { component } = useUsers()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const radio = await screen.findByRole('radio')
    fireEvent.click(radio)

    const editButton = await screen.findByRole('button', { name: 'Edit' })
    expect(editButton).toBeVisible()
    fireEvent.click(editButton)

    expect(await screen.findByTestId('userDrawer')).toHaveTextContent('edit')
  })
  it('should open user drawer for add internal user correctly', async () => {
    mockRbacUserResponse([])
    mockSSOResponse('samlFile')
    const Component = () => {
      const { component } = useUsers()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    await userEvent.click(await screen.findByText('Add Internal'))
    expect(await screen.findByTestId('userDrawer')).toHaveTextContent('addInternal')
  })
  it('should open user drawer for 3rd party user correctly', async () => {
    mockRbacUserResponse([])
    mockSSOResponse('samlFile')
    const Component = () => {
      const { component } = useUsers()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    await userEvent.click(await screen.findByText('Add Third Party'))
    expect(await screen.findByTestId('userDrawer')).toHaveTextContent('invite3rdParty')
  })
  it('should show Setup SSO button when ruckus-ai-sso-toggle is enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockRbacUserResponse(mockManagedUsers)
    mockSSOResponse()
    const Component = () => {
      const { component } = useUsers()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    const updateSSOBtn = await screen.findByText('Setup SSO')
    expect(updateSSOBtn).toBeVisible()
    fireEvent.click(updateSSOBtn)
    expect(await screen.findByTestId('importSSOFileDrawer')).toBeVisible()
  })
  it('should show Configure SSO button when ruckus-ai-sso-toggle is enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockRbacUserResponse(mockManagedUsers)
    mockSSOResponse('samlFile')
    const Component = () => {
      const { component } = useUsers()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    const updateSSOBtn = await screen.findByText('Configure SSO')
    expect(updateSSOBtn).toBeVisible()
    fireEvent.click(updateSSOBtn)
    expect(await screen.findByTestId('importSSOFileDrawer')).toBeVisible()
  })
  it('should hide Configure SSO when ruckus-ai-sso-toggle is disabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockRbacUserResponse(mockManagedUsers)
    mockSSOResponse('samlFile')
    const Component = () => {
      const { component } = useUsers()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    const updateSSOBtn = screen.queryByText('Configure SSO')
    expect(updateSSOBtn).toBeNull()
  })
})
