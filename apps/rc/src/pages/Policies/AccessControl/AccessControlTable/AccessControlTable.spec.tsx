import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  AccessControlUrls, CommonUrlsInfo,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import {
  aclList, applicationDetail, avcApp, avcCat,
  deviceDetailResponse, devicePolicyListResponse,
  enhancedAccessControlList,
  enhancedApplicationPolicyListResponse,
  enhancedDevicePolicyListResponse,
  enhancedLayer2PolicyListResponse,
  enhancedLayer3PolicyListResponse,
  layer2PolicyListResponse, layer2Response, layer3PolicyListResponse, layer3Response,
  networkListResponse, queryApplication
} from '../__tests__/fixtures'

import AccessControlTable from './AccessControlTable'

const mockTableResult = {
  totalCount: 1,
  page: 1,
  data: [{
    id: '7217d467353744d9aac8493324501be3',
    name: 'My Access Control 1',
    type: 'Access Control',
    scope: '1'
  }]
}

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('AccessControlTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.getEnhancedAccessControlProfiles.url,
        (req, res, ctx) => res(ctx.json(enhancedAccessControlList))
      ),
      rest.post(
        AccessControlUrls.getEnhancedL3AclPolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedLayer3PolicyListResponse))
      ),
      rest.post(
        AccessControlUrls.getEnhancedL2AclPolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedLayer2PolicyListResponse))
      ),
      rest.post(
        AccessControlUrls.getEnhancedDevicePolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedDevicePolicyListResponse))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(
          ctx.json(networkListResponse)
        )
      ),
      rest.get(
        AccessControlUrls.getDevicePolicy.url,
        (_, res, ctx) => res(
          ctx.json(deviceDetailResponse)
        )
      ),
      rest.get(
        AccessControlUrls.getDevicePolicyList.url,
        (_, res, ctx) => res(
          ctx.json(devicePolicyListResponse)
        )
      ),
      rest.post(
        AccessControlUrls.getEnhancedApplicationPolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedApplicationPolicyListResponse))
      ),
      rest.get(
        AccessControlUrls.getL2AclPolicyList.url,
        (_, res, ctx) => res(
          ctx.json(layer2PolicyListResponse)
        )
      ),rest.get(
        AccessControlUrls.getL3AclPolicyList.url,
        (_, res, ctx) => res(
          ctx.json(layer3PolicyListResponse)
        )
      ), rest.get(
        AccessControlUrls.getAccessControlProfileList.url,
        (_, res, ctx) => res(
          ctx.json(aclList)
        )
      ), rest.get(
        AccessControlUrls.getL2AclPolicy.url,
        (_, res, ctx) => res(
          ctx.json(layer2Response)
        )
      ), rest.get(
        AccessControlUrls.getL3AclPolicy.url,
        (_, res, ctx) => res(
          ctx.json(layer3Response)
        )
      ), rest.get(
        AccessControlUrls.getAppPolicyList.url,
        (_, res, ctx) => res(
          ctx.json(queryApplication)
        )
      ), rest.get(
        AccessControlUrls.getAppPolicy.url,
        (_, res, ctx) => res(
          ctx.json(applicationDetail)
        )
      ), rest.get(
        AccessControlUrls.getAvcCategory.url,
        (_, res, ctx) => res(
          ctx.json(avcCat)
        )
      ), rest.get(
        AccessControlUrls.getAvcApp.url,
        (_, res, ctx) => res(
          ctx.json(avcApp)
        )
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <AccessControlTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetName = mockTableResult.data[0].name
    expect(await screen.findByRole('button', { name: /Add Access Control Set/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetName) })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <AccessControlTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <AccessControlTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
  })

  // TODO Should implement this after API is ready
  it.todo('should delete selected row')

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <AccessControlTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const editPath = getPolicyDetailsLink({
      type: PolicyType.ACCESS_CONTROL,
      oper: PolicyOperation.EDIT,
      policyId: target.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    })
  })
})
