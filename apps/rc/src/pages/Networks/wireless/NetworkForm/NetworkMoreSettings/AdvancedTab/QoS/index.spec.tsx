import { Form } from 'antd'

import { useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { NetworkSaveData, OpenWlanAdvancedCustomization } from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { render, screen }                                 from '@acx-ui/test-utils'

import QoS from '.'


describe('QoS', () => {
  it('should render correctly', function () {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const mockWlanData = {
      name: 'test',
      type: 'open',
      wlan: {
        advancedCustomization: {
        } as OpenWlanAdvancedCustomization
      }
    } as NetworkSaveData

    render(
      <Provider>
        <Form>
          <QoS wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } }
    )

    expect(screen.getByText('QoS')).toBeInTheDocument()
    expect(screen.getByText('QoS Mirroring')).toBeInTheDocument()
    expect(screen.getByText('QoS Map Set')).toBeInTheDocument()
  })
})