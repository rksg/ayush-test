import { rest } from 'msw'

import { serviceApi, networkApi }         from '@acx-ui/rc/services'
import { CommonUrlsInfo, PortalUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import {
  findTBody,
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockList, mockDetailResult, mockDetailChangeResult } from './__tests__/fixtures'

import PortalServiceDetail from '.'

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

describe('Portal Detail Page', () => {
  const params = {
    tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
    serviceId: '373377b0cb6e46ea8982b1c80aabe1fa' }
  beforeEach(async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    store.dispatch(serviceApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(mockList))
      ),
      rest.get(
        `${window.location.origin}/api/file/tenant/:tenantId/:imageId/url`,
        (req, res, ctx) => {
          return res(ctx.json({ signedUrl: 'url' }))
        }
      ),
      rest.put('/api/test',
        (_, res, ctx) => {
          return res(ctx.json({}))
        }),
      rest.get(
        PortalUrlsInfo.getPortalProfileDetail.url,
        (_, res, ctx) => res(ctx.json(mockDetailResult))
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the' }))
        })
    )
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
  })

  it('should render detail page', async () => {
    render(<Provider><PortalServiceDetail /></Provider>, {
      route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByText('English')).toBeVisible()
    expect(await screen.findByText((`Instances (${mockList.data.length})`))).toBeVisible()
    const body = await findTBody()
    await waitFor(() => expect(within(body).getAllByRole('row')).toHaveLength(4))
  })

  it('should render breadcrumb correctly', async () => {
    render(<Provider><PortalServiceDetail /></Provider>, {
      route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Guest Portal'
    })).toBeVisible()
  })

  it('should render detail changed page', async () => {
    mockServer.use(
      rest.get(
        PortalUrlsInfo.getPortalProfileDetail.url,
        (_, res, ctx) => res(ctx.json(mockDetailChangeResult))
      )
    )
    render(<Provider><PortalServiceDetail /></Provider>, {
      route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByText('English')).toBeVisible()
    expect(await screen.findByText((`Instances (${mockList.data.length})`))).toBeVisible()
  })
})
