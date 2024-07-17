import { rest } from 'msw'

import { useIsSplitOn, Features }                                                                                                               from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, ConfigTemplateContext, ConfigTemplateUrlsInfo, DHCPUrls, ServicesConfigTemplateUrlsInfo, VenueConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                             from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  configTemplateWifiDhcpPoolUsages,
  detailResult,
  getConfigTemplateDhcpProfileDetail,
  list,
  mockVenueData,
  queryConfigTemplate
} from './__tests__/fixtures'

import { DHCPDetail } from '.'

describe('DHCP Detail Page', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'e3d0c24e808d42b1832d47db4c2a7914',
      serviceId: '78f92fbf80334e8b83cddd3210db4920'
    }
    mockServer.use(
      rest.get(
        DHCPUrls.getDHCProfileDetail.url,
        (req, res, ctx) => res(ctx.json(detailResult))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
  })

  it('should render detail page', async () => {
    render(
      <Provider>
        <DHCPDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/:serviceId/detail' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(('Number of Pools'))).toBeInTheDocument()
    expect(await screen.findByText((`Instances (${list.data.length})`))).toBeInTheDocument()

    const targetData = list.data[0]
    expect(screen.getByRole('row', { name: new RegExp(targetData.name) })).toBeInTheDocument()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <DHCPDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/:serviceId/detail' }
      })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', { name: 'My Services' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'DHCP for Wi-Fi' })).toBeVisible()
  })

  it('should render detail page with rbac api for config template correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
    mockServer.use(
      rest.post(ServicesConfigTemplateUrlsInfo.queryDhcpProfiles.url, (_, res, ctx) =>
        res(ctx.json(queryConfigTemplate))
      ),
      rest.get(ServicesConfigTemplateUrlsInfo.getDHCProfileDetail.url, (_, res, ctx) =>
        res(ctx.json(getConfigTemplateDhcpProfileDetail))
      ),
      rest.get(VenueConfigTemplateUrlsInfo.getDhcpUsagesRbac.url, (_, res, ctx) =>
        res(ctx.json(configTemplateWifiDhcpPoolUsages))
      ),
      rest.post(ConfigTemplateUrlsInfo.getVenuesTemplateList.url, (_, res, ctx) =>
        res(ctx.json(mockVenueData))
      )
    )
    render(
      <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
        <Provider>
          <DHCPDetail />
        </Provider>
      </ConfigTemplateContext.Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/:serviceId/detail' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(('Each APs'))).toBeInTheDocument()
    expect(await screen.findByText(('Instances (1)'))).toBeInTheDocument()
    expect(screen.getByRole('row', { name: new RegExp('testVenue') })).toBeInTheDocument()
  })
})
