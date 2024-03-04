import { rest } from 'msw'

import { networkApi, policyApi }            from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiOperatorUrls } from '@acx-ui/rc/utils'
import { Provider, store }                  from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { WifiOperatorDetailView } from './WifiOperatorDetailView'

const networkList = {
  totalCount: 2,
  totalPages: 1,
  page: 1,
  data: [{
    id: 'ebcccef6b366415dbb85073e5aa7248c',
    name: 'openNetwork1',
    nwSubType: 'open',
    venueApGroups: [{
      venueId: '9db255d7fea84757b06d349acf816999',
      apGroupIds: [
        '70a626b6364f4f8c983ff197eef572df'
      ],
      isAllApGroupsapCount: true
    }]
  },
  {
    id: '697e24a3cc2949eaae2f825b90469b52',
    name: 'openNetwork2',
    nwSubType: 'open',
    venueApGroups: [{
      venueId: '9db255d7fea84757b06d349acf816999',
      apGroupIds: [
        '70a626b6364f4f8c983ff197eef572df'
      ],
      isAllApGroupsapCount: true
    }]
  }]
}

const detailList = {
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '70ea860d29d34c218de1b42268b563dc',
      name: 'wo1',
      domainNames: [
        'rks.com',
        '*.rk.com'
      ],
      friendlyNames: [
        {
          name: 'dd',
          language: 'DUT'
        },
        {
          name: 'eng',
          language: 'ENG'
        }
      ],
      friendlyNameCount: 2,
      networkIds: ['ebcccef6b366415dbb85073e5aa7248c', '697e24a3cc2949eaae2f825b90469b52'],
      networkCount: 0
    }
  ]
}

describe('Wi-Fi Operator Detail Page', () => {
  let params: { tenantId: string, policyId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
      policyId: '70ea860d29d34c218de1b42268b563dc'
    }
    store.dispatch(policyApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getWifiNetworksList.url,
        (req, res, ctx) => {
          const body = req.body as { filters: { id: string[] } }
          const networkIds = body.filters.id
          return res(ctx.json({ ...networkList,
            data: networkList.data.filter(item => networkIds.includes(item.id)) }))
        }
      ),
      rest.post(
        WifiOperatorUrls.getWifiOperatorList.url,
        (req, res, ctx) => res(ctx.json(detailList))
      ),
      rest.get(
        WifiOperatorUrls.getWifiOperator.url,
        (req, res, ctx) => res(ctx.json(detailList?.data[0]))
      )
    )
  })

  it('should render Wi-Fi Operator Detail page correctly', async () => {
    render(<Provider><WifiOperatorDetailView /></Provider>, {
      route: { params, path: '/:tenantId/t/policies/wifiOperator/:policyId/detail' }
    })

    expect(await screen.findByText('wo1')).toBeVisible()
    expect(await screen.findByText((`Instances (${networkList.data.length})`))).toBeVisible()
    const body = await screen.findByRole('rowgroup', {
      name: (_, element) => element.classList.contains('ant-table-tbody')
    })
    await waitFor(() => expect(within(body).getAllByRole('row')).toHaveLength(2))
  })

  it('should render breadcrumb correctly', async () => {
    render(<Provider><WifiOperatorDetailView /></Provider>, {
      route: { params, path: '/:tenantId/t/policies/wifiOperator/:policyId/detail' }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Wi-Fi Operator'
    })).toBeVisible()
  })
})
