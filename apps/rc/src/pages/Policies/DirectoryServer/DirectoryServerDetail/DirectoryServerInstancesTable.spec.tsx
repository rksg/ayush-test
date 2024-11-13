import { rest } from 'msw'

import {
  DirectoryServerUrls,
  CommonUrlsInfo,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen, within } from '@acx-ui/test-utils'

import { mockDirectoryServerViewModelListResponse, mockDirectoryServerNetworkList } from './__tests__/fixtures'
import { DirectoryServerInstancesTable }                                            from './DirectoryServerInstancesTable'


describe('DirectoryServerInstancesTable', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    policyId: '49d2173ae5d943daa454af8de40fd4d9'
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.DIRECTORY_SERVER, oper: PolicyOperation.DETAIL })
  beforeEach(() => {
    mockServer.use(
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
  it('should render the table view', async () => {
    render(
      <Provider>
        <DirectoryServerInstancesTable/>
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    const targetRow = (await screen.findByText('test-network1')).closest('tr')
    expect(targetRow).toBeVisible()
    expect(within(targetRow!).getByText('Enterprise AAA (802.1X)')).toBeVisible()
    const targetRow2 = (await screen.findByText('test-network2')).closest('tr')
    expect(targetRow2).toBeVisible()
    expect(within(targetRow2!).getByText('Captive Portal - Captive Portal')).toBeVisible()
    const targetRow3 = (await screen.findByText('test-network3')).closest('tr')
    expect(targetRow3).toBeVisible()
    // eslint-disable-next-line max-len
    expect(within(targetRow3!).getByText('Captive Portal - Active Directory / LDAP Server')).toBeVisible()
  })
})
