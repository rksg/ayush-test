import { rest } from 'msw'

import { AaaUrls, CertificateUrls, CommonUrlsInfo, ConfigTemplateContext, ConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }                                             from '@acx-ui/test-utils'

import {
  aaaServerNetworkList, aaaServerDetail,
  mockAAAPolicyTemplateListResponse, mockAAAPolicyTemplateResponse,
  mockAAAPolicyViewModelListResponse
} from './__tests__/fixtures'

import { AAAPolicyDetail } from '.'

describe('AAA Detail Page', () => {
  const params = {
    tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
    policyId: '373377b0cb6e46ea8982b1c80aabe1fa'
  }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        AaaUrls.getAAAPolicyViewModelList.url,
        (_, res, ctx) => res(ctx.json(mockAAAPolicyViewModelListResponse))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(aaaServerNetworkList))
      ),
      rest.post(
        CertificateUrls.getCAs.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CertificateUrls.getCertificateList.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should render breadcrumb correctly when it is config template', async () => {
    mockServer.use(
      rest.post(
        ConfigTemplateUrlsInfo.getAAAPolicyTemplateList.url,
        (_, res, ctx) => res(ctx.json(mockAAAPolicyTemplateListResponse))
      ),
      rest.get(
        ConfigTemplateUrlsInfo.getAAAPolicyTemplate.url,
        (_, res, ctx) => res(ctx.json(mockAAAPolicyTemplateResponse))
      )
    )
    render(<ConfigTemplateContext.Provider value={{ isTemplate: true }}>
      <Provider><AAAPolicyDetail /></Provider></ConfigTemplateContext.Provider>, {
      route: { params, path: '/:tenantId/policies/aaa/:policyId/detail' }
    })

    expect(await screen.findByRole('link', { name: /Configuration Templates/i })).toBeVisible()
  })

  it('should render aaa detail page', async () => {
    mockServer.use(
      rest.get(
        AaaUrls.getAAAPolicy.url,
        (req, res, ctx) => res(ctx.json({
          ...aaaServerDetail, type: 'AUTHENTICATION'
        }))
      )
    )
    render(<Provider><AAAPolicyDetail /></Provider>, {
      route: { params, path: '/:tenantId/policies/aaa/:policyId/detail' }
    })
    expect(await screen.findByText('NotOnlyAAA')).toBeVisible()
    const networkCount = aaaServerNetworkList.data.length
    expect(await screen.findByText((`Instances (${networkCount})`))).toBeVisible()
    const body = await screen.findByRole('rowgroup', {
      name: (_, element) => element.classList.contains('ant-table-tbody')
    })
    await waitFor(() => expect(within(body).getAllByRole('row')).toHaveLength(networkCount))
  })
})
