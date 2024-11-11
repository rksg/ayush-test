import { rest } from 'msw'

import {
  DirectoryServerUrls,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType

} from '@acx-ui/rc/utils'
import { CommonUrlsInfo }                              from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import {
  mockDirectoryServerDetail,
  mockDirectoryServerNetworkList,
  mockDirectoryServerViewModelListResponse
} from './__tests__/fixtures'
import DirectoryServerDetail from './DirectoryServerDetail'

describe('DirectoryServerDetail', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    policyId: '49d2173ae5d943daa454af8de40fd4d9'
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.DIRECTORY_SERVER, oper: PolicyOperation.DETAIL })
  beforeEach(() => {
    mockServer.use(
      rest.get(
        DirectoryServerUrls.getDirectoryServer.url,
        (req, res, ctx) => {
          return res(ctx.json({ ...mockDirectoryServerDetail }))
        }
      ),
      rest.post(
        DirectoryServerUrls.getDirectoryServerViewDataList.url,
        (req, res, ctx) => {
          return res(ctx.json({ ...mockDirectoryServerViewModelListResponse }))
        }
      ),
      rest.post(
        CommonUrlsInfo.getWifiNetworksList.url,
        (req, res, ctx) => res(ctx.json({ ...mockDirectoryServerNetworkList }))
      )
    )
  })

  it('should render the detail view', async () => {
    render(
      <Provider>
        <DirectoryServerDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    // Verify the settings
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('heading', { level: 1, name: mockDirectoryServerDetail.name })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText(mockDirectoryServerDetail.tlsEnabled ? 'On' : 'Off')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText(`${mockDirectoryServerDetail.host}:${mockDirectoryServerDetail.port}`)).toBeVisible()
    expect(await screen.findByText(mockDirectoryServerDetail.adminDomainName)).toBeVisible()

    // Verify the instances
    expect(await screen.findByText('test-network3')).toBeVisible()
    const networkCount = mockDirectoryServerNetworkList.data.length
    expect(await screen.findByText((`Instances (${networkCount})`))).toBeVisible()
    const body = await screen.findByRole('rowgroup', {
      name: (_, element) => element.classList.contains('ant-table-tbody')
    })
    await waitFor(() => expect(within(body).getAllByRole('row')).toHaveLength(networkCount))
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <DirectoryServerDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Directory Server'
    })).toBeVisible()
  })

  it('should navigate to the edit page', async () => {
    const editLink = `/${params.tenantId}/t/` + getPolicyDetailsLink({
      type: PolicyType.DIRECTORY_SERVER,
      oper: PolicyOperation.EDIT,
      policyId: params.policyId
    })

    render(
      <Provider>
        <DirectoryServerDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Configure' })).toHaveAttribute('href', editLink)
  })
})
