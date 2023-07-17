/* eslint-disable max-len */
import { rest } from 'msw'

import { MspUrlsInfo }            from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'
import { UserProfileContext, UserProfileContextProps, setUserProfile } from '@acx-ui/user'

import { fakeUserProfile, fakeMspEcProfile, fakeTenantDetails } from './__tests__/fixtures'

import Administrators from './index'

const isPrimeAdmin : () => boolean = jest.fn().mockReturnValue(true)
const userProfileContextValues = {
  data: fakeUserProfile,
  isPrimeAdmin
} as UserProfileContextProps

jest.mock('./DelegationsTable', () => ({
  ...jest.requireActual('./DelegationsTable'),
  __esModule: true,
  default: () => {
    return <div data-testid='mocked-DelegationsTable'></div>
  }
}))
jest.mock('./AdministratorsTable', () => ({
  ...jest.requireActual('./AdministratorsTable'),
  __esModule: true,
  default: () => {
    return <div data-testid='mocked-AdministratorsTable'></div>
  }
}))
describe('Administrators', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    setUserProfile({ profile: fakeUserProfile, allowedOperations: [] })

    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDetails.url,
        (req, res, ctx) => res(ctx.json(fakeTenantDetails))
      ),
      rest.get(
        MspUrlsInfo.getMspEcProfile.url,
        (req, res, ctx) => res(ctx.json(fakeMspEcProfile))
      )
    )
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administrators />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await screen.findByTestId('mocked-AdministratorsTable')
    await screen.findByTestId('mocked-DelegationsTable')
  })

  it('should correctly render when delegation not ready', async () => {
    const fakeVARUSer = { ...fakeUserProfile }
    fakeVARUSer.var = true

    render(
      <Provider>
        <UserProfileContext.Provider
          value={{
            data: fakeVARUSer,
            isPrimeAdmin
          } as UserProfileContextProps}
        >
          <Administrators />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await screen.findByTestId('mocked-AdministratorsTable')
    expect(screen.queryByTestId('mocked-DelegationsTable')).toBeNull()
  })
})
