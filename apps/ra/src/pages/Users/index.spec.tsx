import '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { rbacApi }                     from '@acx-ui/analytics/services'
import { ManagedUser }                 from '@acx-ui/analytics/utils'
import { rbacApiURL, store, Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  waitForElementToBeRemoved,
  screen
} from '@acx-ui/test-utils'


import { mockMangedUsers } from './__tests__/fixtures'

import Users from '.'

jest.mock('./Table', () => ({
  UsersTable: () => <div data-testid='usersTable'>UsersTable</div>
}))
jest.mock('./UserDrawer', () => ({
  UserDrawer: ({ type }: { type: string }) => <div data-testid='userDrawer'>{`${type}`}</div>
}))

const mockRbacUserResponse = (data: ManagedUser[] | undefined) => {
  mockServer.use(
    rest.get(`${rbacApiURL}/users`,
      (_, res, ctx) => res(ctx.json(data))
    )
  )
}

describe('Users Page', () => {
  beforeEach(() => {
    store.dispatch(rbacApi.util.resetApiState())
  })
  it('should render correctly', async () => {
    mockRbacUserResponse(mockMangedUsers)
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Users (4)')).toBeVisible()
    expect(await screen.findByTestId('usersTable')).toBeVisible()
  })
  it('should render empty array correctly', async () => {
    mockRbacUserResponse([])
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Users (0)')).toBeVisible()
    expect(await screen.findByTestId('usersTable')).toBeVisible()
  })
  it('should render undefined correctly', async () => {
    mockRbacUserResponse(undefined)
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Users (0)')).toBeVisible()
    expect(await screen.findByTestId('usersTable')).toBeVisible()
  })
  it('should open user drawer for add internal user correctly', async () => {
    mockRbacUserResponse([])
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    const userBtn = await screen.findByText('Add User...')
    expect(userBtn).toBeVisible()
    await userEvent.click(userBtn)
    await userEvent.click(await screen.findByText('Internal'))
    expect(await screen.findByTestId('userDrawer')).toHaveTextContent('create')
  })
  it('should open user drawer for 3rd party user correctly', async () => {
    mockRbacUserResponse([])
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    const userBtn = await screen.findByText('Add User...')
    expect(userBtn).toBeVisible()
    await userEvent.click(userBtn)
    await userEvent.click(await screen.findByText('3rd Party'))
    expect(await screen.findByTestId('userDrawer')).toHaveTextContent('invite3rdParty')
  })
})
