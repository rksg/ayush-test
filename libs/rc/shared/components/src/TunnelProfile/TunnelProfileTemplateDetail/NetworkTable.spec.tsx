/* eslint-disable max-len */
import { rest } from 'msw'

import { ConfigTemplateUrlsInfo, getConfigTemplatePath, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { Provider }                                                                                       from '@acx-ui/store'
import { mockServer, render, screen }                                                                     from '@acx-ui/test-utils'

import { mockedNetworkViewData } from '../__tests__/fixtures'

import { NetworkTable } from './NetworkTable'

describe('TunnelProfileTemplateDetail - NetworkTable', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        ConfigTemplateUrlsInfo.getNetworkTemplateList.url,
        (req, res, ctx) => res(ctx.json(mockedNetworkViewData))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <NetworkTable networkIds={['networkId1', 'networkId2']} />
      </Provider>, {
        route: {
          path: '/tenantId/v/' + getConfigTemplatePath(
            getPolicyRoutePath({ type: PolicyType.TUNNEL_PROFILE, oper: PolicyOperation.DETAIL })
          ),
          params: { policyId: 'test-id' }
        }
      }
    )

    expect(await screen.findByText('Network Template')).toBeVisible()
    expect(screen.getByText('Type')).toBeVisible()
    expect(screen.getByText('Venues Template')).toBeVisible()
    expect(screen.getByRole('row', { name: 'TestNetwork1 Dynamic Pre-Shared Key (DPSK) 1' })).toBeVisible()
    expect(screen.getByRole('row', { name: 'TestNetwork2 Dynamic Pre-Shared Key (DPSK) 1' })).toBeVisible()
  })
})