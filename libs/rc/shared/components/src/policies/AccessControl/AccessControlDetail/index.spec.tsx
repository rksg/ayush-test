import { rest } from 'msw'

import { AccessControlUrls, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                          from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { enhancedAccessControlList } from '../__tests__/fixtures'

import { AccessControlDetail } from './index'

const networksResponse = {
  fields: [
    'name',
    'venues',
    'id',
    'nwSubType'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      name: 'test-psk',
      id: 'd1a4ab014ca84d55a0e07c6565f3d06b',
      nwSubType: 'psk',
      venues: {
        count: 0,
        names: []
      }
    }
  ]
}


describe('Access Control Detail Page', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.getEnhancedAccessControlProfiles.url,
        (req, res, ctx) => res(ctx.json(enhancedAccessControlList))
      ),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse)))
    )
  })

  it('should render detail page', async () => {
    render(
      <Provider>
        <AccessControlDetail />
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1', policyId: 'policyId1' }
        }
      })

    await screen.findByText(enhancedAccessControlList.data[0].name)

    expect(screen.getByText('Layer 2')).toBeInTheDocument()
    expect(screen.getByText('Layer 3')).toBeInTheDocument()
    expect(screen.getByText('Device & OS')).toBeInTheDocument()
    expect(screen.getByText('Applications')).toBeInTheDocument()
    expect(screen.getByText('Client Rate Limit')).toBeInTheDocument()

    expect(await screen.findByText('test-psk')).toBeInTheDocument()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <AccessControlDetail />
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1', policyId: 'policyId1' }
        }
      })

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(await screen.findByText('Policies & Profiles')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Access Control'
    })).toBeVisible()
  })
})
