import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                                                            from '@acx-ui/msp/utils'
import { AccessControlUrls, CONFIG_TEMPLATE_PATH_PREFIX, ConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import { mockServer, render, screen }                                             from '@acx-ui/test-utils'

import {
  applicationDetailResponse,
  avcApp,
  avcCat,
  devicePolicyDetailResponse,
  enhancedApplicationPolicyListResponse,
  enhancedDevicePolicyListResponse,
  enhancedLayer2PolicyListResponse,
  enhancedLayer3PolicyListResponse,
  layer2PolicyDetailResponse,
  layer2PolicyListResponse,
  layer3PolicyDetailResponse,
  layer3PolicyListResponse,
  mockedConfigTemplateList,
  mockedMSPCustomerList
} from './__tests__/fixtures'
import { AccessControlSubPolicyDrawers, ACCESS_CONTROL_SUB_POLICY_INIT_STATE } from './AccessControlPolicy'

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
const mockLibSetting = jest.fn()


describe('AccessControlPolicy component', () => {
  const path = `/:tenantId/v/${CONFIG_TEMPLATE_PATH_PREFIX}/:activeTab`
  const params = { tenantId: '__TENANT_ID', activeTab: 'templates' }

  beforeEach(() => {
    mockServer.use(
      rest.post(ConfigTemplateUrlsInfo.getConfigTemplates.url,
        (req, res, ctx) => res(ctx.json({ ...mockedConfigTemplateList }))),
      rest.post(MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedMSPCustomerList }))),
      rest.get(AccessControlUrls.getL2AclPolicyList.url,
        (_, res, ctx) => res(ctx.json(layer2PolicyListResponse))),
      rest.post(AccessControlUrls.getEnhancedL2AclPolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedLayer2PolicyListResponse))),
      rest.get(AccessControlUrls.getL2AclPolicy.url,
        (_, res, ctx) => res(ctx.json(layer2PolicyDetailResponse))),
      rest.get(AccessControlUrls.getL3AclPolicyList.url,
        (_, res, ctx) => res(ctx.json(layer3PolicyListResponse))),
      rest.post(AccessControlUrls.getEnhancedL3AclPolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedLayer3PolicyListResponse))),
      rest.post(AccessControlUrls.getL3AclPolicy.url,
        (_, res, ctx) => res(ctx.json(layer3PolicyDetailResponse))),
      rest.get(AccessControlUrls.getDevicePolicyList.url,
        (req, res, ctx) => res(ctx.json([]))),
      rest.post(AccessControlUrls.getEnhancedDevicePolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedDevicePolicyListResponse))),
      rest.get(AccessControlUrls.getDevicePolicy.url,
        (_, res, ctx) => res(ctx.json(devicePolicyDetailResponse))),
      rest.get(AccessControlUrls.getAppPolicyList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.post(AccessControlUrls.getEnhancedApplicationPolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedApplicationPolicyListResponse))),
      rest.get(AccessControlUrls.getAppPolicy.url,
        (_, res, ctx) => res(ctx.json(applicationDetailResponse))),
      rest.get(AccessControlUrls.applicationLibrarySettings.url,
        (_, res, ctx) => {
          mockLibSetting()
          return res(ctx.json({ version: 'versionValue' }))
        }),
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
            ...ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
            'Layer 2 Policy': { visible: true, id: '' }
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
  it('should render layer 2 policy correct with editMode', async () => {
    render(
      <Provider>
        <AccessControlSubPolicyDrawers
          accessControlSubPolicyVisible={{
            ...ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
            'Layer 2 Policy': { visible: true, id: 'layer2PolicyId' }
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
            ...ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
            'Layer 3 Policy': { visible: true, id: '' }
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
            ...ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
            'Device Policy': { visible: true, id: '' }
          }}
          setAccessControlSubPolicyVisible={mockSetVisible}
        />
      </Provider>, {
        route: { params, path }
      }
    )

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
            ...ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
            'Application Policy': { visible: true, id: '' }
          }}
          setAccessControlSubPolicyVisible={mockSetVisible}
        />
      </Provider>, {
        route: { params, path }
      }
    )

    expect(await screen.findByText(/Application Access Settings/i)).toBeVisible()
    expect(mockLibSetting).not.toHaveBeenCalled()
    expect(mockAvcCategory).not.toHaveBeenCalled()
    expect(mockAvcApp).not.toHaveBeenCalled()
    const cancelButton = await screen.findByRole('button', { name: /cancel/i })
    await userEvent.click(cancelButton)
    expect(screen.queryByText(/Application Access Settings/i)).toBeNull()
  })
})
