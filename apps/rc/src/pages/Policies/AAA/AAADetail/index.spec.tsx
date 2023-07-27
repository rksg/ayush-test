import { rest } from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { AaaUrls }      from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import AAAPolicyDetail from '.'

const list = {
  fields: [
    'networkId',
    'networkName'
  ],
  totalCount: 4,
  page: 1,
  data: [
    {
      id: 1,
      networkId: '6',
      networkName: 'Network A',
      networkType: 'OPEN'
    },
    {
      id: 2,
      networkId: '3b11bcaffd6f4f4f9b2805b6fe24bf8d',
      networkName: 'Network B',
      networkType: 'GUEST',
      guestNetworkType: 'WISPr'
    },
    {
      id: 3,
      networkId: '3b11bcaffd6f4f4f9b2805b6fe24bf8f',
      networkName: 'Network C',
      networkType: 'AAA'
    },
    {
      id: 4,
      networkId: '3b11bcaffd6f4f4f9b2805b6fe24bf8g',
      networkName: 'Network E',
      networkType: 'GUEST',
      guestNetworkType: 'Cloudpath'
    }
  ]
}
const detailResult = {
  id: 1,
  networkIds: [] as string[],
  name: 'test',
  type: 'AUTHENTICATION',
  primary: {
    ip: '2.2.2.2',
    port: 101,
    sharedSecret: 'xxxxxxxx'
  },
  secondary: {
    ip: '2.2.2.2',
    port: 102,
    sharedSecret: 'xxxxxxxx'
  },
  tags: ['123','345']
}
let params: { tenantId: string, policyId: string }
params = {
  tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
  policyId: '373377b0cb6e46ea8982b1c80aabe1fa'
}
describe('AAA Detail Page', () => {
  it('should render aaa detail page', async () => {
    mockServer.use(
      rest.post(
        AaaUrls.getAAANetworkInstances.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        AaaUrls.getAAAProfileDetail.url,
        (req, res, ctx) => res(ctx.json({ ...detailResult, type: 'AUTHENTICATION',
          networkIds: ['1','2'] }))
      )
    )
    render(<Provider><AAAPolicyDetail /></Provider>, {
      route: { params, path: '/:tenantId/policies/aaa/:policyId/detail' }
    })
    expect(await screen.findByText('test')).toBeVisible()
    expect(await screen.findByText((`Instances (${list.data.length})`))).toBeVisible()
    const body = await screen.findByRole('rowgroup', {
      name: (_, element) => element.classList.contains('ant-table-tbody')
    })
    await waitFor(() => expect(within(body).getAllByRole('row')).toHaveLength(4))
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockServer.use(
      rest.post(
        AaaUrls.getAAANetworkInstances.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        AaaUrls.getAAAProfileDetail.url,
        (req, res, ctx) => res(ctx.json({ ...detailResult, type: 'AUTHENTICATION',
          networkIds: ['1','2'] }))
      )
    )
    render(<Provider><AAAPolicyDetail /></Provider>, {
      route: { params, path: '/:tenantId/policies/aaa/:policyId/detail' }
    })
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('Policies & Profiles')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'RADIUS Server'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        AaaUrls.getAAANetworkInstances.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        AaaUrls.getAAAProfileDetail.url,
        (req, res, ctx) => res(ctx.json({ ...detailResult, type: 'AUTHENTICATION',
          networkIds: ['1','2'] }))
      )
    )
    render(<Provider><AAAPolicyDetail /></Provider>, {
      route: { params, path: '/:tenantId/policies/aaa/:policyId/detail' }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'RADIUS Server'
    })).toBeVisible()
  })
})
