import { useIsSplitOn }             from '@acx-ui/feature-toggle'
import { Provider }                 from '@acx-ui/store'
import {  render, screen, waitFor } from '@acx-ui/test-utils'

import { MdnsProxyFormItem } from '.'

describe('Edge Cluster Network Control Tab > mDNS', () => {
  let params: { tenantId: string, clusterId: string, activeTab?: string }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)


    params = {
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: '1',
      activeTab: 'networkControl'
    }

  })

  it('dhcp toggle should be off when no dhcp returned', async () => {

    render(
      <Provider>
        <MdnsProxyFormItem/>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    await waitFor(() => {
      expect(screen.getAllByRole('switch')[0]).not.toBeChecked()
    })
    await waitFor(() => {
      expect(screen.getAllByRole('switch')[1]).toBeChecked()
    })

  })
})