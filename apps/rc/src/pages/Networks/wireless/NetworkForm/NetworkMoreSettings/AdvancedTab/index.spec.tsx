import { Form } from 'antd'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'


import { AdvancedTab } from '.'


describe('AdvancedTab', () => {
  it('should render Qos correctly when useIsSplitOn return true', function () {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

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
  })

  it('should not render Qos when useIsSplitOn return false', function () {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <AdvancedTab />
        </Form>
      </Provider>,
      { route: { params } }
    )

    expect(screen.queryByText('QoS')).not.toBeInTheDocument()
  })
})