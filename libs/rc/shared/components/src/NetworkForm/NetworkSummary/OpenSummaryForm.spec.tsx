import '@testing-library/jest-dom'

import { Form } from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

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

})
