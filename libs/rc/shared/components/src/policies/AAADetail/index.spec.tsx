import { rest } from 'msw'

import { AaaUrls, ConfigTemplateContext, ConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                               from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }            from '@acx-ui/test-utils'

import { mockAAAPolicyTemplateListResponse, mockAAAPolicyTemplateResponse } from '../../NetworkForm/__tests__/fixtures'

import { aaaServerNetworkList, aaaServerDetail } from './__tests__/fixtures'

import { AAAPolicyDetail } from '.'

describe('AAA Detail Page', () => {
  const params = {
    tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
    policyId: '373377b0cb6e46ea8982b1c80aabe1fa'
  }

  it('should render breadcrumb correctly when it is config template', async () => {
    mockServer.use(
      rest.post(
        AaaUrls.getAAANetworkInstances.url,
        (req, res, ctx) => res(ctx.json(aaaServerNetworkList))
      ),
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
      rest.post(
        AaaUrls.getAAANetworkInstances.url,
        (req, res, ctx) => res(ctx.json(aaaServerNetworkList))
      ),
      rest.get(
        AaaUrls.getAAAPolicy.url,
        (req, res, ctx) => res(ctx.json({
          ...aaaServerDetail, type: 'AUTHENTICATION', networkIds: ['1','2']
        }))
      )
    )
    render(<Provider><AAAPolicyDetail /></Provider>, {
      route: { params, path: '/:tenantId/policies/aaa/:policyId/detail' }
    })
    expect(await screen.findByText('test')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText((`Instances (${aaaServerNetworkList.data.length})`))).toBeVisible()
    const body = await screen.findByRole('rowgroup', {
      name: (_, element) => element.classList.contains('ant-table-tbody')
    })
    await waitFor(() => expect(within(body).getAllByRole('row')).toHaveLength(4))
  })
})
