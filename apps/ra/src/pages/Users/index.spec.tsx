import '@testing-library/react'
import { rest } from 'msw'

import { rbacApi }                     from '@acx-ui/analytics/services'
import { ManagedUser }                 from '@acx-ui/analytics/utils'
import { rbacApiURL, store, Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  waitForElementToBeRemoved,
  screen,
  fireEvent
} from '@acx-ui/test-utils'


import { mockMangedUsers } from './__tests__/fixtures'

import Users from '.'

jest.mock('./Table', () => ({
  UsersTable: () => <div data-testid='usersTable'>UsersTable</div>
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
    const info = await screen.findByTestId('InformationOutlined')
    fireEvent.mouseOver(info)
    expect(await screen.findByText((content, element) => {
      return element?.tagName.toLowerCase() === 'div'
        && content.startsWith('"Invite 3rd Party"')
    })).toBeInTheDocument()
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
})
