import '@testing-library/jest-dom'

import { Form } from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { mockAaaNetworkSummary } from './__tests__/fixtures'
import { AaaSummary }            from './AaaSummary'

describe('AaaSummary', () => {
  it('should render AAA summary form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <AaaSummary summaryData={mockAaaNetworkSummary} />
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect(await screen.findByText('Primary Server')).toBeVisible()
  })

  it('should render AAA summary with accounting enabled', async () => {
    mockAaaNetworkSummary.enableAccountingService = true
    mockAaaNetworkSummary.enableAuthProxy = false
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <AaaSummary summaryData={mockAaaNetworkSummary} />
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect((await screen.findAllByText('Primary Server'))[1]).toBeVisible()
  })
})
