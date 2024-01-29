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

jest.mock('./ImportSSOFileDrawer', () => ({
  ImportSSOFileDrawer: () =>
    <div data-testid='importSSOFileDrawer'>ImportSSOFileDrawer</div>
}))

const mockRbacUserResponse = (data: ManagedUser[] | undefined) => {
  mockServer.use(
    rest.get(`${rbacApiURL}/users`,
      (_, res, ctx) => res(ctx.json(data))
    )
  )
}

const mockSSOResponse = (fileContents: string | object) => {
  mockServer.use(
    rest.get(`${rbacApiURL}/tenantSettings`,
      (_, res, ctx) => res(ctx.json([{
        key: 'sso',
        value: JSON.stringify({ type: 'saml2', metadata: fileContents })
      }]))
    )
  )
}

describe('Users Page', () => {
  beforeEach(() => {
    store.dispatch(rbacApi.util.resetApiState())
  })
  it('should render correctly', async () => {
    mockRbacUserResponse(mockMangedUsers)
    mockSSOResponse({})
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
    const setupSSOBtn = await screen.findByText('Setup SSO')
    expect(setupSSOBtn).toBeVisible()
    fireEvent.click(setupSSOBtn)
    expect(await screen.findByTestId('importSSOFileDrawer')).toBeVisible()
  })
  it('should render empty array correctly', async () => {
    mockRbacUserResponse([])
    mockSSOResponse({})
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Users (0)')).toBeVisible()
    expect(await screen.findByTestId('usersTable')).toBeVisible()
  })
  it('should render undefined correctly', async () => {
    mockRbacUserResponse(undefined)
    mockSSOResponse({})
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Users (0)')).toBeVisible()
    expect(await screen.findByTestId('usersTable')).toBeVisible()
  })
  it('should show update sso button correctly', async () => {
    mockRbacUserResponse(mockMangedUsers)
    mockSSOResponse('samlFile')
    render(<Users />, { wrapper: Provider })
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('img', { name: 'loader' }))
    const updateSSOBtn = await screen.findByText('Update SSO')
    expect(updateSSOBtn).toBeVisible()
    fireEvent.click(updateSSOBtn)
    expect(await screen.findByTestId('importSSOFileDrawer')).toBeVisible()
  })
})
