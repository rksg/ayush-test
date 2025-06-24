/* eslint-disable max-len */
import { rest } from 'msw'

import { AdministrationUrlsInfo, TenantType } from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
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
const services = require('@acx-ui/msp/services')
const rcServices = require('@acx-ui/rc/services')

describe('Administrators', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    setUserProfile({ profile: fakeUserProfile, allowedOperations: [] })

    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f'
    }

    services.useGetMspEcProfileQuery = jest.fn().mockImplementation(() => {
      return { data: fakeMspEcProfile }
    })

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDetails.url,
        (req, res, ctx) => res(ctx.json(fakeTenantDetails))
      ),
      rest.get(
        AdministrationUrlsInfo.getTenantAuthentications.url,
        (req, res, ctx) => res(ctx.json([
          {
            id: '9db335ef808',
            clientID: '8358489e',
            clientSecret: '6bb84ba',
            scopes: 'PRIME_ADMIN',
            authenticationType: 'GOOGLE_WORKSPACE',
            name: 'Prime',
            clientIDStatus: 'ACTIVE',
            samlSignatureEnabled: false
          }
        ]))
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
    const tenantDetails = { ...fakeTenantDetails, tenantType: TenantType.VAR }
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: tenantDetails }
    })

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
    expect(screen.queryByTestId('mocked-DelegationsTable')).toBeNull()
  })

  it('should correctly render in delegated mode', async () => {
    services.useGetMspEcProfileQuery = jest.fn().mockImplementation(() => {
      return {
        data: {
          ...fakeMspEcProfile,
          msp_label: 'msp_ec'
        }
      }
    })

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
})
