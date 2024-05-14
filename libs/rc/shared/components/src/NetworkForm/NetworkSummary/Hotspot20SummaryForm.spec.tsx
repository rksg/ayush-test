import '@testing-library/jest-dom'

import { Form } from 'antd'
import { rest } from 'msw'

import { useIsSplitOn }                           from '@acx-ui/feature-toggle'
import { IdentityProviderUrls, WifiOperatorUrls } from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import { mockServer, render, screen }             from '@acx-ui/test-utils'

import {
  mockHotpost20IdentityProviderList,
  mockHotspot20MoreData,
  mockHotspot20OperatorList
} from '../__tests__/fixtures'

import { Hotspot20SummaryForm } from './Hotspot20SummaryForm'

describe('Hotspot20SummaryForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(IdentityProviderUrls.getIdentityProviderList.url,
        (_, res, ctx) => res(ctx.json(mockHotpost20IdentityProviderList))),
      rest.post(WifiOperatorUrls.getWifiOperatorList.url,
        (_, res, ctx) => res(ctx.json(mockHotspot20OperatorList))
      )
    )
  })

  it('should render Hotspot 2.0 summary correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <Hotspot20SummaryForm summaryData={mockHotspot20MoreData} />
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect(await screen.findByText('Security Protocol')).toBeVisible()
    expect(await screen.findByText('WPA2')).toBeVisible()
    expect(await screen.findByText('Wi-Fi Operator')).toBeVisible()
    expect(await screen.findByText('Identity Provider')).toBeVisible()
  })
})
