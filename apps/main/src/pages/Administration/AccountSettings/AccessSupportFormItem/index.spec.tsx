/* eslint-disable max-len */
import _        from 'lodash'
import { rest } from 'msw'

import { UserProfileContext, UserProfileContextProps } from '@acx-ui/user'
import { AdministrationUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider  }                                   from '@acx-ui/store'
import {
  render,
  mockServer,
  screen,
  fireEvent,
  waitFor
} from '@acx-ui/test-utils'

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
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json(fakeTenantDelegation))
      )

    )
  })

  it('should be able to enable access support', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json([]))
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
            isMspEc={false}
            canMSPDelegation={true}
          />
        </UserProfileContext.Provider>
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
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <AccessSupportFormItem
            isMspEc={false}
            canMSPDelegation={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const infoText = await screen.findByText(/- Administrator-level access is granted on .*/)
    expect(infoText.innerHTML).toBe('- Administrator-level access is granted on 01/10/2023 - 11:26 UTC')
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
            isMspEc={false}
            canMSPDelegation={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const infoText = await screen.findByText('- Administrator-level access is granted on 01/10/2023 - 11:26 UTC')
    expect(infoText).toBeInTheDocument()

    const formItem = screen.getByRole('checkbox', { name: 'Enable access to Ruckus support' })
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
            isMspEc={false}
            canMSPDelegation={true}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    screen.getByRole('checkbox', { name: 'Enable access to Ruckus support' })
    fireEvent.mouseOver(screen.getByRole('checkbox', { name: 'Enable access to Ruckus support' }))
    expect(screen.getByRole('checkbox', { name: 'Enable access to Ruckus support' })).toBeDisabled()
    await waitFor(async () => {
      expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByRole('tooltip').textContent).toBe('You are not allowed to change this')
    })
  })
})

describe('Access Support Form Item - Msp Delegate EC', () => {
  it('should render correctly', async () => {
    const MspECUser = {
      data: { ...fakeUserProfile, varTenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
    } as UserProfileContextProps

    const getTenantDelegationFn = jest.fn()

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => {
          getTenantDelegationFn()
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
            isMspEc={true}
            canMSPDelegation={false}
          />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: 'Enable access to Ruckus support' })

    await waitFor(() => {
      expect(getTenantDelegationFn).toBeCalled()
    })
    expect(formItem).not.toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Enable access to Ruckus support' })).not.toBeChecked()
    fireEvent.click(formItem)
    expect(await screen.findByText('An error occurred')).toBeVisible()
  })
})
