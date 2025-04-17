/* eslint-disable max-len */
import { rest } from 'msw'

import { SwitchUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { SwitchAccessControlSetDetail } from './SwitchAccessControlSetDetail'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('SwitchAccessControlSetDetail', () => {
  const params = { tenantId: 'tenant-id', accessControlId: 'access-control-id' }

  beforeEach(() => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchAccessControlSetById.url, (req, res, ctx) => {
        return res(ctx.json({
          id: 'test-id',
          policyName: 'Test Policy',
          description: 'Test Description',
          layer2AclPolicyName: 'Layer 2 Policy',
          layer2AclPolicyId: 'layer2-id'
        }))
      })
    )
  })

  it('renders the detail view with policy information', async () => {
    render(
      <Provider>
        <SwitchAccessControlSetDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/:accessControlId/overview' }
      }
    )

    expect(await screen.findByText('Test Policy')).toBeInTheDocument()
    expect(screen.getByText('Layer 2')).toBeInTheDocument()
    expect(screen.getByText('ON')).toBeInTheDocument()
  })

  it('renders OFF for Layer 2 when no layer2AclPolicyId exists', async () => {
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchAccessControlSetById.url, (req, res, ctx) => {
        return res(ctx.json({
          id: 'test-id',
          policyName: 'Test Policy',
          description: 'Test Description',
          layer2AclPolicyName: '',
          layer2AclPolicyId: ''
        }))
      })
    )

    render(
      <Provider>
        <SwitchAccessControlSetDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/:accessControlId/overview' }
      }
    )

    expect(await screen.findByText('Test Policy')).toBeInTheDocument()
    expect(screen.getByText('Layer 2')).toBeInTheDocument()
    expect(screen.getByText('OFF')).toBeInTheDocument()
  })

  it('displays configure button when user has permission', async () => {
    // Mock the permission functions to return true
    jest.mock('@acx-ui/user', () => ({
      ...jest.requireActual('@acx-ui/user'),
      hasCrossVenuesPermission: () => true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filterByAccess: (arr: any) => arr
    }))

    render(
      <Provider>
        <SwitchAccessControlSetDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/accessControl/switch/:accessControlId/overview' }
      }
    )

    expect(await screen.findByText('Configure')).toBeInTheDocument()
  })
})