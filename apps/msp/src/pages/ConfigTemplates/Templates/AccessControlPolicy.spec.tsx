import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                                                            from '@acx-ui/msp/utils'
import { AccessControlUrls, CONFIG_TEMPLATE_PATH_PREFIX, ConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                    from '@acx-ui/test-utils'

import { ConfigTemplateTabKey } from '..'
import {
  avcApp,
  avcCat,
  layer2PolicyListResponse,
  layer3PolicyListResponse,
  mockedConfigTemplateList,
  mockedMSPCustomerList
} from '../__tests__/fixtures'

import { AccessControlSubPolicyDrawers, INIT_STATE } from './AccessControlPolicy'

const mockedUsedNavigate = jest.fn()
const mockedLocation = '/test'
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => mockedLocation
}))

const mockSetVisible = jest.fn()
const mockAvcCategory = jest.fn()
const mockAvcApp = jest.fn()


describe('AccessControlPolicy component', () => {
  const path = `/:tenantId/v/${CONFIG_TEMPLATE_PATH_PREFIX}/:activeTab`
  const params = { tenantId: '__TENANT_ID', activeTab: ConfigTemplateTabKey.TEMPLATES }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        ConfigTemplateUrlsInfo.getConfigTemplates.url,
        (req, res, ctx) => res(ctx.json({ ...mockedConfigTemplateList }))
      ),
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedMSPCustomerList }))
      ),
      rest.get(
        AccessControlUrls.getL2AclPolicyList.url,
        (_, res, ctx) => res(
          ctx.json(layer2PolicyListResponse)
        )
      ),
      rest.get(AccessControlUrls.getL3AclPolicyList.url,
        (_, res, ctx) => res(
          ctx.json(layer3PolicyListResponse)
        )
      ),
      rest.get(AccessControlUrls.getDevicePolicyList.url,
        (req, res, ctx) => res(ctx.json([]))),
      rest.get(AccessControlUrls.getAppPolicyList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(AccessControlUrls.getAvcCategory.url,
        (_, res, ctx) => {
          mockAvcCategory()
          return res(ctx.json(avcCat))
        }),
      rest.get(AccessControlUrls.getAvcApp.url,
        (_, res, ctx) => {
          mockAvcApp()
          return res(ctx.json(avcApp))
        })

    )
  })
  it('should render layer 2 policy correct', async () => {
    render(
      <Provider>
        <AccessControlSubPolicyDrawers
          accessControlSubPolicyVisible={{
            ...INIT_STATE,
            'Layer 2 Policy': true
          }}
          setAccessControlSubPolicyVisible={mockSetVisible}
        />
      </Provider>, {
        route: { params, path }
      }
    )

    expect(await screen.findByText(/layer 2 settings/i)).toBeVisible()
    const cancelButton = await screen.findByRole('button', { name: /cancel/i })
    await userEvent.click(cancelButton)
    expect(screen.queryByText(/layer 2 settings/i)).toBeNull()
  })

  it.skip('should render layer 3 policy correct', async () => {
    render(
      <Provider>
        <AccessControlSubPolicyDrawers
          accessControlSubPolicyVisible={{
            ...INIT_STATE,
            'Layer 3 Policy': true
          }}
          setAccessControlSubPolicyVisible={mockSetVisible}
        />
      </Provider>, {
        route: { params, path }
      }
    )

    expect(await screen.findByText(/layer 3 settings/i)).toBeVisible()
    const cancelButton = await screen.findByRole('button', { name: /cancel/i })
    await userEvent.click(cancelButton)
    expect(screen.queryByText(/layer 3 settings/i)).toBeNull()
  })

  it('should render device policy correct', async () => {

    render(
      <Provider>
        <AccessControlSubPolicyDrawers
          accessControlSubPolicyVisible={{
            ...INIT_STATE,
            'Device Policy': true
          }}
          setAccessControlSubPolicyVisible={mockSetVisible}
        />
      </Provider>, {
        route: { params, path }
      }
    )

    await waitFor(() => expect(mockAvcCategory).toHaveBeenCalled())
    await waitFor(() => expect(mockAvcApp).toHaveBeenCalled())

    expect(await screen.findByText(/Device & OS Access Settings/i)).toBeVisible()
    const cancelButton = await screen.findByRole('button', { name: /cancel/i })
    await userEvent.click(cancelButton)
    expect(mockSetVisible).toHaveBeenCalled()
  })

  it('should render application policy correct', async () => {
    render(
      <Provider>
        <AccessControlSubPolicyDrawers
          accessControlSubPolicyVisible={{
            ...INIT_STATE,
            'Application Policy': true
          }}
          setAccessControlSubPolicyVisible={mockSetVisible}
        />
      </Provider>, {
        route: { params, path }
      }
    )

    expect(await screen.findByText(/Application Access Settings/i)).toBeVisible()
    const cancelButton = await screen.findByRole('button', { name: /cancel/i })
    await userEvent.click(cancelButton)
    expect(screen.queryByText(/Application Access Settings/i)).toBeNull()
  })
})
