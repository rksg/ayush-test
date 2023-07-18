import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'


import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { MspUrlsInfo }  from '@acx-ui/msp/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'
import {
  DetailLevel,
  UserProfileContext,
  UserProfileContextProps
} from '@acx-ui/user'


import RegionButton from './index'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useTenantId: () => '8c36a0a9ab9d4806b060e112205add6f'
}))

const mspUserData = {
  msp_label: '',
  name: '',
  service_effective_date: '',
  service_expiration_date: '',
  is_active: false
}

const fakeUserProfile = {
  region: '[NA]',
  allowedRegions: [
    {
      name: 'US',
      description: 'United States of America',
      link: 'https://dev.ruckus.cloud',
      current: true
    },
    {
      current: false,
      description: 'APAC region',
      link: 'https://asia.qaalto.ruckuswireless.com',
      name: 'Asia'
    }
  ],
  externalId: '0032h00000LUqcoAAD',
  pver: 'acx-hybrid',
  companyName: 'Dog Company 1551',
  firstName: 'FisrtName 1551',
  lastName: 'LastName 1551',
  username: 'dog1551@email.com',
  role: 'PRIME_ADMIN',
  roles: ['PRIME_ADMIN'],
  detailLevel: DetailLevel.DEBUGGING,
  dateFormat: 'mm/dd/yyyy',
  email: 'dog1551@email.com',
  var: true,
  tenantId: '8c36a0a9ab9d4806b060e112205add6f',
  varTenantId: '8c36a0a9ab9d4806b060e112205add6f',
  adminId: '4159559db15c4027903d9c3d4bdb8a7e',
  support: false,
  dogfood: false
}

const isPrimeAdmin: () => boolean = jest.fn().mockReturnValue(true)
const userProfileContextValues = {
  data: fakeUserProfile,
  isPrimeAdmin
} as UserProfileContextProps

describe('Region Button Component', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        MspUrlsInfo.getMspEcProfile.url,
        (req, res, ctx) => res(ctx.json(mspUserData))
      )
    )
  })

  it('should render Region Button Correctly', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}>
          <RegionButton/>
        </UserProfileContext.Provider>
      </Provider>
    )

    await userEvent.click(await screen.findByText('US'))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'US' }))
  })

  it('selected other region for Region Component', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}>
          <RegionButton/>
        </UserProfileContext.Provider>
      </Provider>
    )

    await userEvent.click(await screen.findByText('US'))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Asia' }))
  })
})
