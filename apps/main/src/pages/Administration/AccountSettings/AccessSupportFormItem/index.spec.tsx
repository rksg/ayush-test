/* eslint-disable max-len */
import _        from 'lodash'
import { rest } from 'msw'

import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }              from '@acx-ui/store'
import {
  render,
  mockServer,
  screen,
  fireEvent,
  waitFor
} from '@acx-ui/test-utils'
import { UserProfileContext, UserProfileContextProps, setUserProfile } from '@acx-ui/user'

import { fakeUserProfile, fakeTenantDelegation } from '../__tests__/fixtures'

import  { AccessSupportFormItem } from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

jest.spyOn(Date, 'now').mockImplementation(() => {
  return new Date('2023-01-11T12:33:37.101+00:00').getTime()
})

const userProfileContextValues = {
  data: fakeUserProfile
} as UserProfileContextProps

describe('Access Support Form Item', () => {
  const mockedDisabledReq = jest.fn()

  beforeEach(async () => {
    setUserProfile({ profile: fakeUserProfile, allowedOperations: [] })
    mockedDisabledReq.mockClear()

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json(fakeTenantDelegation))
      ),
      rest.delete(
        AdministrationUrlsInfo.disableAccessSupport.url,
        (req, res, ctx) => {
          mockedDisabledReq()
          return res(ctx.json({}))
        })
    )
  })

  it('should be able to enable access support', async () => {
    const getTenantDelegationFn = jest.fn()

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => {
          getTenantDelegationFn(_req.url.search)
          return res(ctx.json([]))
        }
      ),
      rest.post(
        AdministrationUrlsInfo.enableAccessSupport.url,
        (req, res, ctx) => res(ctx.json({
          requestId: 'test-request',
          response: {}
        }))
      )
    )

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <AccessSupportFormItem
            hasMSPEcLabel={false}
            canMSPDelegation={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: 'Enable access to Ruckus Support' })
    await waitFor(() => {
      expect(getTenantDelegationFn).toBeCalledWith('?type=SUPPORT')
    })

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
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <AccessSupportFormItem
            hasMSPEcLabel={false}
            canMSPDelegation={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const infoText = await screen.findByText(/- Administrator-level access was granted on .*/)
    expect(infoText.innerHTML).toBe('- Administrator-level access was granted on 01/10/2023 - 11:26 UTC. Expires on 01/12/2023.')
  })



  it('should display revoke count down and datetime string by tooltip if it is enabled', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json(fakeTenantDelegation))
      )
    )

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <AccessSupportFormItem
            hasMSPEcLabel={false}
            canMSPDelegation={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const infoText = await screen.findByText('- Administrator-level access was granted on 01/10/2023 - 11:26 UTC. Expires on 01/12/2023.')
    expect(infoText).toBeInTheDocument()

    const formItem = screen.getByRole('checkbox', { name: 'Enable access to Ruckus Support' })
    expect(formItem).toBeChecked()
  })

  it('should display not allowed message when support user', async () => {
    const supportUser = {
      data: { ...fakeUserProfile, support: true }
    } as UserProfileContextProps

    render(
      <Provider>
        <UserProfileContext.Provider
          value={supportUser}
        >
          <AccessSupportFormItem
            hasMSPEcLabel={false}
            canMSPDelegation={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    screen.getByRole('checkbox', { name: 'Enable access to Ruckus Support' })
    fireEvent.mouseOver(screen.getByRole('checkbox', { name: 'Enable access to Ruckus Support' }))
    expect(screen.getByRole('checkbox', { name: 'Enable access to Ruckus Support' })).toBeDisabled()
    await waitFor(async () => {
      expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByRole('tooltip').textContent).toBe('You are not allowed to change this')
    })
  })

  it('should revoke support when its expiration is less than 60 seconds', async () => {
    const testRevokeExpire = _.cloneDeep(fakeTenantDelegation)
    testRevokeExpire[0].createdDate = '2022-12-21T12:33:50.101+00:00'
    testRevokeExpire[0].expiryDate = '2023-01-11T12:33:50.101+00:00'

    const mockedReqFn = jest.fn()
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => {
          mockedReqFn()
          return res(ctx.json(testRevokeExpire))
        })
    )

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <AccessSupportFormItem
            hasMSPEcLabel={false}
            canMSPDelegation={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => expect(mockedReqFn).toBeCalled())
    const infoText = await screen.findByText(/- Administrator-level access was granted on .*/)
    expect(infoText.innerHTML).toBe('- Administrator-level access was granted on 12/21/2022 - 12:33 UTC. Expires on 01/11/2023.')
    expect(mockedDisabledReq).toBeCalledTimes(1)
  })

  it('should not trigger revoke again when revoke the expired suport failed', async () => {
    const spyConsole = jest.spyOn(console, 'log')

    const testRevokeExpire = _.cloneDeep(fakeTenantDelegation)
    testRevokeExpire[0].createdDate = '2022-12-21T12:33:50.101+00:00'
    testRevokeExpire[0].expiryDate = '2023-01-11T12:33:50.101+00:00'

    const mockedGetFn = jest.fn()
    const mockedDisabledReq = jest.fn()
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => {
          mockedGetFn()
          return res(ctx.json(testRevokeExpire))
        }),
      rest.delete(
        AdministrationUrlsInfo.disableAccessSupport.url,
        (req, res, ctx) => {
          mockedDisabledReq()
          return res(ctx.status(500), ctx.json(null))
        }
      )
    )

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <AccessSupportFormItem
            hasMSPEcLabel={false}
            canMSPDelegation={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => expect(mockedGetFn).toBeCalled())
    const infoText = await screen.findByText(/- Administrator-level access was granted on .*/)
    expect(infoText.innerHTML).toBe('- Administrator-level access was granted on 12/21/2022 - 12:33 UTC. Expires on 01/11/2023.')
    expect(mockedDisabledReq).toBeCalled()

    await waitFor(() => {
      expect(spyConsole).toBeCalled()
    })

    expect(mockedDisabledReq).toBeCalledTimes(1)
  })
})

describe('Access Support Form Item - Msp Delegate EC', () => {
  it('should render correctly', async () => {
    const spyConsole = jest.spyOn(console, 'log')

    const MspECUser = {
      data: { ...fakeUserProfile, varTenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
    } as UserProfileContextProps

    const getTenantDelegationFn = jest.fn()

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => {
          getTenantDelegationFn(_req.url.search)
          return res(ctx.json([]))
        }
      ),
      rest.post(
        AdministrationUrlsInfo.enableAccessSupport.url,
        (req, res, ctx) => res(ctx.status(500), ctx.json(null))
      )
    )

    render(
      <Provider>
        <UserProfileContext.Provider
          value={MspECUser}
        >
          <AccessSupportFormItem
            hasMSPEcLabel={true}
            canMSPDelegation={false}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: 'Enable access to Ruckus Support' })

    await waitFor(() => {
      expect(getTenantDelegationFn).toBeCalledWith('?type=SUPPORT_EC')
    })
    expect(formItem).not.toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Enable access to Ruckus Support' })).not.toBeChecked()
    fireEvent.click(formItem)
    // FIXME: might need to fix when general error handler behavior changed.
    await waitFor(() => {
      expect(spyConsole).toBeCalled()
    })
  })
})
