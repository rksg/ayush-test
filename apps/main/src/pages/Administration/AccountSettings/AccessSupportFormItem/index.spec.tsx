/* eslint-disable max-len */
import _        from 'lodash'
import { rest } from 'msw'

import { UserProfileProvider }                    from '@acx-ui/rc/components'
import { AdministrationUrlsInfo, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }                              from '@acx-ui/store'
import {
  render,
  mockServer,
  screen,
  fireEvent,
  waitFor,
  cleanup
} from '@acx-ui/test-utils'

import { fakeUserProfile, fakeTenantDelegation } from '../__tests__/fixtures'

import  { AccessSupportFormItem } from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

jest.spyOn(Date, 'now').mockImplementation(() => {
  return new Date('2023-01-11T12:33:37.101+00:00').getTime()
})
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: () => ( params )
}))

describe('Access Support Form Item', () => {

  it('should be able to enable access support', async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getUserProfile.url,
        (req, res, ctx) => res(ctx.json(fakeUserProfile))
      ),
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
        <UserProfileProvider>
          <AccessSupportFormItem
            isMspEc={false}
            canMSPDelegation={true}
          />
        </UserProfileProvider>
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
        <UserProfileProvider>
          <AccessSupportFormItem
            isMspEc={false}
            canMSPDelegation={true}
          />
        </UserProfileProvider>
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
        <UserProfileProvider>
          <AccessSupportFormItem
            isMspEc={false}
            canMSPDelegation={true}
          />
        </UserProfileProvider>
      </Provider>, {
        route: { params }
      })

    const infoText = await screen.findByText('- Administrator-level access is granted on 01/10/2023 - 11:26 UTC')
    expect(infoText).toBeInTheDocument()

    const formItem = screen.getByRole('checkbox', { name: 'Enable access to Ruckus support' })
    expect(formItem).toBeChecked()
  })

  it.skip('should display not allowed message if it is support user.', async () => {
    const fakeSupportUser = { ...fakeUserProfile, support: true }

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getUserProfile.url,
        (req, res, ctx) => res(ctx.json(fakeSupportUser))
      ),
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json(fakeTenantDelegation))
      )
    )

    render(
      <Provider>
        <UserProfileProvider>
          <AccessSupportFormItem
            isMspEc={false}
            canMSPDelegation={true}
          />
        </UserProfileProvider>
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: 'Enable access to Ruckus support' })
    expect(formItem).toBeDisabled()
    fireEvent.mouseOver(formItem)

    await waitFor(async () => {
      expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByRole('tooltip').textContent).toBe('You are not allowed to change this')
    })
  })

  it('should render correctly when it is Msp Delegate EC', async () => {
    cleanup()
    const fakeMspECUser = { ...fakeUserProfile, varTenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getUserProfile.url,
        (req, res, ctx) => res(ctx.json(fakeMspECUser))
      ),
      rest.get(
        AdministrationUrlsInfo.getTenantDelegation.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json([]))
      ),
      rest.post(
        AdministrationUrlsInfo.enableAccessSupport.url,
        (req, res, ctx) => res(ctx.status(500), ctx.json(null))
      )
    )

    render(
      <Provider>
        <UserProfileProvider>
          <AccessSupportFormItem
            isMspEc={true}
            canMSPDelegation={false}
          />
        </UserProfileProvider>
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: 'Enable access to Ruckus support' })
    await waitFor(() => expect(formItem).not.toBeDisabled())
    expect(formItem).not.toBeChecked()
    fireEvent.click(formItem)
    expect(await screen.findByText('An error occurred')).toBeVisible()
  })
})
