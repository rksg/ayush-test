/* eslint-disable max-len */
import _        from 'lodash'
import { rest } from 'msw'
import { act }  from 'react-dom/test-utils'

import { administrationApi, mspApi, userApi }                  from '@acx-ui/rc/services'
import { CommonUrlsInfo, MspUrlsInfo, AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store  }                                    from '@acx-ui/store'
import {
  render,
  screen,
  mockServer
} from '@acx-ui/test-utils'

import {
  fakeRecoveryPassphrase,
  fakeMFATenantDetail,
  fakeMspEcProfile,
  fakeUserProfile
} from './__tests__/fixtures'


import AccountSettings from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

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

describe('Account Settings', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(administrationApi.util.resetApiState())
      store.dispatch(mspApi.util.resetApiState())
      store.dispatch(userApi.util.resetApiState())
    })

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getRecoveryPassphrase.url,
        (_req, res, ctx) => res(ctx.json(fakeRecoveryPassphrase))
      ),
      rest.get(
        AdministrationUrlsInfo.getMfaTenantDetails.url,
        (req, res, ctx) => res(ctx.json(fakeMFATenantDetail))
      ),
      rest.get(
        MspUrlsInfo.getMspEcProfile.url,
        (req, res, ctx) => res(ctx.json(fakeMspEcProfile))
      ),
      rest.get(
        CommonUrlsInfo.getUserProfile.url,
        (req, res, ctx) => res(ctx.json(fakeUserProfile))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <AccountSettings />
      </Provider>, {
        route: { params }
      })

    expect((await screen.findAllByTestId(/rc-.*/)).length).toBe(5)
  })

  it('should not display map region selector', async () => {
    const fakeNotAdminUser = _.cloneDeep(fakeUserProfile)
    fakeNotAdminUser.roles = []

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getUserProfile.url,
        (req, res, ctx) => res(ctx.json(fakeNotAdminUser))
      )
    )

    render(
      <Provider>
        <AccountSettings />
      </Provider>, {
        route: { params }
      })

    expect(screen.queryByTestId('rc-MapRegionFormItem')).not.toBeInTheDocument()
    expect((await screen.findAllByRole('separator')).length).toBe(3)
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
        <AccountSettings />
      </Provider>, {
        route: { params }
      })

    await screen.findByTestId('rc-MapRegionFormItem')
    expect(screen.queryByTestId('rc-AccessSupportFormItem')).not.toBeInTheDocument()
    expect((await screen.findAllByRole('separator')).length).toBe(3)
  })
  it('should not display enable MFA checkbox', async () => {
    const fakeUser = _.cloneDeep(fakeUserProfile)
    fakeUser.varTenantId = 'test_tenant'

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getUserProfile.url,
        (req, res, ctx) => res(ctx.json(fakeUser))
      )
    )

    render(
      <Provider>
        <AccountSettings />
      </Provider>, {
        route: { params }
      })

    await screen.findByTestId('rc-MapRegionFormItem')
    expect(screen.queryByTestId('rc-MFAFormItem')).not.toBeInTheDocument()
    expect((await screen.findAllByRole('separator')).length).toBe(3)
  })
})