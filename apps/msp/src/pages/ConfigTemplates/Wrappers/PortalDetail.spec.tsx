import { rest } from 'msw'

import { servicesConfigTemplateApi, serviceApi,  networkApi }      from '@acx-ui/rc/services'
import { ServiceType,
  getServiceDetailsLink,
  ServiceOperation,
  ServicesConfigTemplateUrlsInfo, CommonUrlsInfo, PortalUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  findTBody,
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockPortalList, mockPortalDetailResult, mockPortalDetailChangeResult } from '../__tests__/fixtures'

import PortalDetail from './PortalDetail'

describe('Portal Detail Page', () => {
  const params = {
    tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
    serviceId: '373377b0cb6e46ea8982b1c80aabe1fa'
  }
  const mockedDetailPath = '/:tenantId/:serviceId/'
  beforeEach(() => {
    store.dispatch(servicesConfigTemplateApi.util.resetApiState())
    store.dispatch(serviceApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    mockServer.use(
      rest.get(
        ServicesConfigTemplateUrlsInfo.getPortal.url,
        (req, res, ctx) => res(ctx.json(mockPortalDetailResult))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(mockPortalList))
      ),
      rest.get(
        PortalUrlsInfo.getPortalProfileDetail.url,
        (_, res, ctx) => res(ctx.json(mockPortalDetailResult))
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the' }))
        })
    )
  })

  it('should render detail page', async () => {
    render(<Provider><PortalDetail /></Provider>, {
      route: { params, path: mockedDetailPath }
    })
    expect(await screen.findByText('English')).toBeVisible()
    expect(await screen.findByText((`Instances (${mockPortalList.data.length})`))).toBeVisible()
    const body = await findTBody()
    await waitFor(() => expect(within(body).getAllByRole('row')).toHaveLength(4))
  })

  it('should render breadcrumb correctly', async () => {
    render(<Provider><PortalDetail /></Provider>, {
      route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByText('Configuration Templates')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Configuration Templates'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Configure'
    })).toBeVisible()
  })

  it('should render detail changed page', async () => {
    mockServer.use(
      rest.get(
        PortalUrlsInfo.getPortalProfileDetail.url,
        (_, res, ctx) => res(ctx.json(mockPortalDetailChangeResult))
      )
    )
    render(<Provider><PortalDetail /></Provider>, {
      route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByText('English')).toBeVisible()
    expect(await screen.findByText((`Instances (${mockPortalList.data.length})`))).toBeVisible()
  })

  it('should navigate to the edit page', async () => {
    const editLink = `/${params.tenantId}/v/configTemplates/` + getServiceDetailsLink({
      type: ServiceType.PORTAL,
      oper: ServiceOperation.EDIT,
      serviceId: params.serviceId
    })

    render(
      <Provider>
        <PortalDetail />
      </Provider>, {
        route: { params: params, path: mockedDetailPath }
      }
    )

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Configure' })).toHaveAttribute('href', editLink)
  })
})
