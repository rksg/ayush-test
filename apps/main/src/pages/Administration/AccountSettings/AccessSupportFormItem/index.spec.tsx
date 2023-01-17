/* eslint-disable max-len */
import _        from 'lodash'
import { rest } from 'msw'
import { act }  from 'react-dom/test-utils'

import { administrationApi }                   from '@acx-ui/rc/services'
import { UserProfile, AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store  }                    from '@acx-ui/store'
import {
  render,
  mockServer,
  screen,
  fireEvent,
  waitFor
} from '@acx-ui/test-utils'

import { fakeUserProfile, fakeTenantDelegation } from '../__tests__/fixtures'

import  { AccessSupportFormItem } from './'

// const mockedDisableAccessSupport = jest.fn()

jest.spyOn(Date, 'now').mockImplementation(() => {
  return new Date('2023-01-11T12:33:37.101+00:00').getTime()
})

// const createdDate = 'Jan 10 2023 11:26'
describe('Access Support Form Item', () => {
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

  beforeEach(() => {
    act(() => {
      store.dispatch(administrationApi.util.resetApiState())
    })
  })

  it('should be able to enable access support', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json([]))
      ),
      rest.post(
        AdministrationUrlsInfo.enableAccessSupport.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )

    render(
      <Provider>
        <AccessSupportFormItem
          userProfileData={fakeUserProfile as UserProfile}
          isMspEc={false}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: 'Enable access to Ruckus support' })
    await waitFor(() => expect(formItem).not.toBeDisabled())

    expect(formItem).not.toBeChecked()
    fireEvent.click(formItem)
  })

  it('should correctly display create date', async () => {
    const testExpiryDate = _.cloneDeep(fakeTenantDelegation)
    testExpiryDate[0].expiryDate = '2023-01-12T12:31:37.101+00:00'

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json(testExpiryDate))
      )
    )

    render(
      <Provider>
        <AccessSupportFormItem
          userProfileData={fakeUserProfile as UserProfile}
          isMspEc={false}
        />
      </Provider>, {
        route: { params }
      })

    const infoText = await screen.findByText(/- Administrator-level access is granted on .*/)
    expect(infoText.innerHTML).toBe('- Administrator-level access is granted on Jan 10 2023 11:26')
  })

  /*
  it('should correctly display expiry date in 1 day', async () => {
    const testExpiryDate = _.cloneDeep(fakeTenantDelegation)
    testExpiryDate[0].expiryDate = '2023-01-12T12:31:37.101+00:00'

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json(testExpiryDate))
      )
    )

    render(
      <Provider>
        <AccessSupportFormItem
          userProfileData={fakeUserProfile as UserProfile}
          isMspEc={false}
        />
      </Provider>, {
        route: { params }
      })

    const infoText = await screen.findByText(/Access permission will be revoked in .* day/)
    expect(infoText.innerHTML).toBe('Access permission will be revoked in 1 day')
  })

  it('should correctly display expiry date in hours', async () => {
    const testExpiryDate = _.cloneDeep(fakeTenantDelegation)
    testExpiryDate[0].expiryDate = '2023-01-11T14:33:37.101+00:00'


    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json(testExpiryDate))
      )
    )

    render(
      <Provider>
        <AccessSupportFormItem
          userProfileData={fakeUserProfile as UserProfile}
          isMspEc={false}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: 'Enable access to Ruckus support' })
    await waitFor(() => expect(formItem).not.toBeDisabled())
    const infoText = await screen.findByText('Access permission will be revoked in 2 hours')
    expect(infoText).toBeTruthy()
  })

  it('should correctly display expiry date in hour', async () => {
    const testExpiryDate = _.cloneDeep(fakeTenantDelegation)
    testExpiryDate[0].expiryDate = '2023-01-11T13:33:37.101+00:00'
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json(testExpiryDate))
      )
    )

    render(
      <Provider>
        <AccessSupportFormItem
          userProfileData={fakeUserProfile as UserProfile}
          isMspEc={false}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: 'Enable access to Ruckus support' })
    await waitFor(() => expect(formItem).not.toBeDisabled())
    // const infoText = await screen.findByText('Access permission will be revoked in 1 hour')
    const infoText = await screen.findByText('Administrator-level access is granted onJan 30 2023 11:26')
    expect(infoText).toBeTruthy()
  })

  it('should correctly display expiry date less than 1 hour', async () => {
    const testExpiryDate = _.cloneDeep(fakeTenantDelegation)
    testExpiryDate[0].expiryDate = '2023-01-11T12:45:37.000+00:00'

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json(testExpiryDate))
      )
    )

    render(
      <Provider>
        <AccessSupportFormItem
          userProfileData={fakeUserProfile as UserProfile}
          isMspEc={false}
        />
      </Provider>, {
        route: { params }
      })

    // const infoText = await screen.findByText('Access permission will be revoked in less than 1 hour')
    const infoText = await screen.findByText('Administrator-level access is granted on Jan 30 2023 11:26')
    expect(infoText).toBeTruthy()
  })

  it('should correctly display expiry date too close to current', async () => {
    jest.mock('@acx-ui/rc/services', () => ({
      ...jest.requireActual('@acx-ui/rc/services'),
      useDisableAccessSupportMutation: () => ([ mockedDisableAccessSupport ])
    }))

    const testExpiryDate = _.cloneDeep(fakeTenantDelegation)
    testExpiryDate[0].expiryDate = '2023-01-11T12:33:50.000+00:00'
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json(testExpiryDate))
      )
    )

    render(
      <Provider>
        <AccessSupportFormItem
          userProfileData={fakeUserProfile as UserProfile}
          isMspEc={false}
        />
      </Provider>, {
        route: { params }
      })

    // await screen.findByText(/Access permission will be revoked in $/)
    await screen.findByText('Administrator-level access is granted on Jan 30 2023 11:26')
    expect(mockedDisableAccessSupport).toBeCalled()
  })
*/
  it('should display revoke count down and datetime string by tooltip if it is enabled', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json(fakeTenantDelegation))
      )
    )

    render(
      <Provider>
        <AccessSupportFormItem
          userProfileData={fakeUserProfile as UserProfile}
          isMspEc={false}
        />
      </Provider>, {
        route: { params }
      })

    // const infoText = await screen.findByText(/Access permission will be revoked in .*/)
    const infoText = await screen.findByText('- Administrator-level access is granted on Jan 10 2023 11:26')
    expect(infoText).toBeInTheDocument()

    const formItem = screen.getByRole('checkbox', { name: 'Enable access to Ruckus support' })
    expect(formItem).toBeChecked()

    // fireEvent.mouseOver(infoText)
    // expect(
    //   await screen.findByText('Jan 30 2023 11:26')
    // ).toBeValid()
  })

  it('should display not allowed message if it is support user.', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json(fakeTenantDelegation))
      )
    )
    const fakeSupportUser = { ...fakeUserProfile, support: true }

    render(
      <Provider>
        <AccessSupportFormItem
          userProfileData={fakeSupportUser as UserProfile}
          isMspEc={false}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: 'Enable access to Ruckus support' })
    fireEvent.mouseOver(formItem)

    expect(
      await screen.findByText('You are not allowed to change this')
    ).toBeValid()
  })

  it('should render correctly when it is Msp Delegate EC', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json([]))
      )
    )

    const fakeUser = { ...fakeUserProfile, varTenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

    render(
      <Provider>
        <AccessSupportFormItem
          userProfileData={fakeUser as UserProfile}
          isMspEc={true}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: 'Enable access to Ruckus support' })
    expect(formItem.getAttribute('value')).toBe('false')
    fireEvent.click(formItem)
  })
})