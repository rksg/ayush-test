/* eslint-disable max-len */
import _        from 'lodash'
import { rest } from 'msw'
import { act }  from 'react-dom/test-utils'

import { mspApi }                 from '@acx-ui/msp/services'
import { MspUrlsInfo }            from '@acx-ui/msp/utils'
import { administrationApi }      from '@acx-ui/rc/services'
import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store  }       from '@acx-ui/store'
import {
  render,
  screen,
  mockServer
} from '@acx-ui/test-utils'
import { UserProfileContext, UserProfileContextProps, UserUrlsInfo, setUserProfile } from '@acx-ui/user'
import { isDelegationMode }                                                          from '@acx-ui/utils'

import {
  fakeRecoveryPassphrase,
  fakeMFATenantDetail,
  fakeMspEcProfile,
  fakeUserProfile
} from './__tests__/fixtures'

import AccountSettings from './'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useTenantId: () => 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  isDelegationMode: jest.fn().mockReturnValue(false)
}))

jest.mock('./AccessSupportFormItem', () => ({
  AccessSupportFormItem: () => <div data-testid={'rc-AccessSupportFormItem'} title='AccessSupportFormItem' />
}))
jest.mock('./DefaultSystemLanguageFormItem', () => ({
  DefaultSystemLanguageFormItem: () => <div data-testid={'rc-DefaultSystemLanguageFormItem'} title='DefaultSystemLanguageFormItem' />
}))
jest.mock('./MapRegionFormItem', () => ({
  MapRegionFormItem: () => <div data-testid={'rc-MapRegionFormItem'} title='MapRegionFormItem' />
}))
jest.mock('./MFAFormItem', () => ({
  MFAFormItem: () => <div data-testid={'rc-MFAFormItem'} title='MFAFormItem' />
}))
jest.mock('./RecoveryPassphraseFormItem', () => ({
  RecoveryPassphraseFormItem: () => <div data-testid={'rc-RecoveryPassphraseFormItem'} title='RecoveryPassphraseFormItem' />
}))
jest.mock('./AuthServerFormItem', () => ({
  AuthServerFormItem: () => <div data-testid={'rc-AuthServerFormItem'} title='AuthServerFormItem' />
}))
jest.mock('./AppTokenFormItem', () => ({
  AppTokenFormItem: () => <div data-testid={'rc-AppTokenFormItem'} title='AppTokenFormItem' />
}))

const isPrimeAdmin: () => boolean = jest.fn().mockReturnValue(true)
const userProfileContextValues = {
  data: fakeUserProfile,
  isPrimeAdmin
} as UserProfileContextProps

describe('Account Settings', () => {
  beforeEach(() => {
    setUserProfile({ profile: fakeUserProfile, allowedOperations: [] })

    act(() => {
      store.dispatch(administrationApi.util.resetApiState())
      store.dispatch(mspApi.util.resetApiState())
    })

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getRecoveryPassphrase.url,
        (_req, res, ctx) => res(ctx.json(fakeRecoveryPassphrase))
      ),
      rest.get(
        UserUrlsInfo.getMfaTenantDetails.url,
        (req, res, ctx) => res(ctx.json(fakeMFATenantDetail))
      ),
      rest.get(
        MspUrlsInfo.getMspEcProfile.url,
        (req, res, ctx) => res(ctx.json(fakeMspEcProfile))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <AccountSettings />
        </UserProfileContext.Provider>
      </Provider>
    )


    expect((await screen.findAllByTestId(/rc-.*/)).length).toBe(4)
  })

  it('should not display map region selector', async () => {
    const fakeNotAdminUser = _.cloneDeep(fakeUserProfile)
    fakeNotAdminUser.roles = []
    const notPrimeAdminUser: () => boolean = jest.fn().mockReturnValue(false)

    render(
      <Provider>
        <UserProfileContext.Provider
          value={{ data: fakeNotAdminUser, isPrimeAdmin: notPrimeAdminUser } as UserProfileContextProps}
        >
          <AccountSettings />
        </UserProfileContext.Provider>
      </Provider>
    )

    expect(screen.queryByTestId('rc-MapRegionFormItem')).not.toBeInTheDocument()
    expect((await screen.findAllByRole('separator')).length).toBe(2)
  })

  it('should not display language selector', async () => {
    const fakeNotAdminUser = _.cloneDeep(fakeUserProfile)
    fakeNotAdminUser.roles = []
    const notPrimeAdminUser: () => boolean = jest.fn().mockReturnValue(false)

    render(
      <Provider>
        <UserProfileContext.Provider
          value={{ data: fakeNotAdminUser, isPrimeAdmin: notPrimeAdminUser } as UserProfileContextProps}
        >
          <AccountSettings />
        </UserProfileContext.Provider>
      </Provider>)

    expect(screen.queryByTestId('rc-DefaultSystemLanguageFormItem')).not.toBeInTheDocument()
    expect((await screen.findAllByRole('separator')).length).toBe(2)
  })

  it('should not display access support checkbox', async () => {
    const fakeMspUser = _.cloneDeep(fakeMspEcProfile)
    fakeMspUser.msp_label = 'msp'

    mockServer.use(
      rest.get(
        MspUrlsInfo.getMspEcProfile.url,
        (req, res, ctx) => res(ctx.json(fakeMspUser))
      )
    )

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <AccountSettings />
        </UserProfileContext.Provider>
      </Provider>
    )

    await screen.findByTestId('rc-MapRegionFormItem')
    expect(screen.queryByTestId('rc-AccessSupportFormItem')).not.toBeInTheDocument()
    expect((await screen.findAllByRole('separator')).length).toBe(2)
  })
  it('should not display enable MFA checkbox', async () => {
    const fakeUser = _.cloneDeep(fakeUserProfile)
    fakeUser.varTenantId = 'test_tenant'
    jest.mocked(isDelegationMode).mockReturnValue(true)

    render(
      <Provider>
        <UserProfileContext.Provider
          value={{ data: fakeUser, isPrimeAdmin } as UserProfileContextProps}
        >
          <AccountSettings />
        </UserProfileContext.Provider>
      </Provider>
    )

    await screen.findByTestId('rc-MapRegionFormItem')
    expect(screen.queryByTestId('rc-MFAFormItem')).not.toBeInTheDocument()
    expect((await screen.findAllByRole('separator')).length).toBe(2)
  })
})
