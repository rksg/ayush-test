import '@testing-library/jest-dom'

import { Form } from 'antd'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { Provider }               from '@acx-ui/store'
import { render, screen }         from '@acx-ui/test-utils'

import { mockOpenNetworkSummary } from './__tests__/fixtures'
import { OpenSummaryForm }        from './OpenSummaryForm'

describe('OpenSummaryForm', () => {
  it('should render Open summary form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <OpenSummaryForm summaryData={mockOpenNetworkSummary} />
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect(await screen.findByText('Primary Server')).toBeVisible()
  })

  it('should render Open summary form successfully with accounting FF enabled', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    jest.mocked(useIsSplitOn).mockImplementation(
      ff => ff === Features.WIFI_NETWORK_RADIUS_ACCOUNTING_TOGGLE
    )
    render(
      <Provider>
        <Form>
          <OpenSummaryForm summaryData={mockOpenNetworkSummary} />
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect(await screen.findByText('Primary Server')).toBeVisible()

    expect(screen.getByText('Accounting Service')).toBeInTheDocument()
  })

})
