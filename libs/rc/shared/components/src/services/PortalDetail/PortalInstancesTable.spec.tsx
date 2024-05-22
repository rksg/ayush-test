import { rest } from 'msw'

import { Features, useIsSplitOn }                                                                 from '@acx-ui/feature-toggle'
import { servicesConfigTemplateApi, serviceApi, networkApi }                                      from '@acx-ui/rc/services'
import { ConfigTemplateUrlsInfo, ServicesConfigTemplateUrlsInfo, PortalUrlsInfo, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                        from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockDetailResult, mockedNetworks, mockedNetworkTemplates } from './__tests__/fixtures'
import { PortalInstancesTable }                                     from './PortalInstancesTable'

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

describe('Portal Instances Table', () => {

  const params = {
    tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
    serviceId: '373377b0cb6e46ea8982b1c80aabe1fa' }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
    store.dispatch(servicesConfigTemplateApi.util.resetApiState())
    store.dispatch(serviceApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    mockServer.use(
      rest.post(
        ConfigTemplateUrlsInfo.getNetworkTemplateList.url,
        (req, res, ctx) => res(ctx.json(mockedNetworkTemplates))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(mockedNetworks))
      ),
      rest.get(
        PortalUrlsInfo.getPortal.url,
        (_, res, ctx) => res(ctx.json(mockDetailResult))
      ),
      rest.post(
        PortalUrlsInfo.getEnhancedPortalProfileList.url,
        (_, res, ctx) => res(ctx.json({
          content: [{ id: 'test', name: 'test', wifiNetworkIds: ['networkId'] }],
          paging: { page: 1, pageSize: 10, totalCount: 1 } }))
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the' }))
        }),
      rest.post(ServicesConfigTemplateUrlsInfo.getEnhancedPortalList.url,
        (_, res, ctx) => {
          return res(ctx.json({
            content: [{ id: 'test', name: 'test', wifiNetworkIds: ['networkId'] }],
            paging: { page: 1, pageSize: 10, totalCount: 1 } }))
        })
    )
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
  })

  it('should render detail page - not Template', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    const targetNetwork = mockedNetworks.data[3]
    const networkLink =
      `/${params.tenantId}/t/networks/wireless/${targetNetwork.id}/network-details/overview`

    render(<Provider>
      <PortalInstancesTable />
    </Provider>, {
      route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByText('NetD')).toBeVisible()
    expect(await screen.findByText((`Instances (${mockedNetworks.totalCount})`))).toBeVisible()
    const targetRow = await screen.findByRole('link', { name: targetNetwork.name })
    expect(targetRow).toHaveAttribute('href', networkLink)
  })

  //RBAC
  it('should render RBAC detail page - not Template', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    const targetNetwork = mockedNetworks.data[3]
    const networkLink =
      `/${params.tenantId}/t/networks/wireless/${targetNetwork.id}/network-details/overview`

    render(<Provider>
      <PortalInstancesTable />
    </Provider>, {
      route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByText('NetD')).toBeVisible()
    expect(await screen.findByText((`Instances (${mockedNetworks.totalCount})`))).toBeVisible()
    const targetRow = await screen.findByRole('link', { name: targetNetwork.name })
    expect(targetRow).toHaveAttribute('href', networkLink)
  })

  it('should render detail page - is Template', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const targetNetwork = mockedNetworkTemplates.data[0]
    const tenantId = params.tenantId
    const networkId = targetNetwork.id
    const networkLink =
      `/${tenantId}/v/configTemplates/networks/wireless/${networkId}/network-details/venues`

    render(<Provider>
      <PortalInstancesTable />
    </Provider>, {
      route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByText('NetT')).toBeVisible()
    expect(await screen.findByText((
      `Instances (${mockedNetworkTemplates.totalCount})`
    ))).toBeVisible()
    const targetRow = await screen.findByRole('link', { name: targetNetwork.name })
    expect(targetRow).toHaveAttribute('href', networkLink)
  })
})
