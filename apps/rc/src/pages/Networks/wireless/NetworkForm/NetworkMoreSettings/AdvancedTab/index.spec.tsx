import { Form } from 'antd'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { AdvancedTab } from '.'


describe('AdvancedTab', () => {

  jest.mocked(useIsSplitOn).mockReturnValue(true)

  it('should render Qos correctly', function () {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <AdvancedTab />
        </Form>
      </Provider>,
      { route: { params } }
    )

    expect(screen.getByText('QoS')).toBeInTheDocument()
    expect(screen.getByText('DTIM (Delivery Traffic Indication Message) Interval')).toBeVisible()
  })
})