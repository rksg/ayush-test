import { Form } from 'antd'
import { rest } from 'msw'

import { useIsSplitOn, useIsTierAllowed }                                   from '@acx-ui/feature-toggle'
import { FirmwareUrlsInfo, NetworkSaveData, OpenWlanAdvancedCustomization } from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render, screen }                                       from '@acx-ui/test-utils'

import { mockedApModelFamilies } from '../../../../LanPortSettings/__tests__/fixtures'

import QoS from '.'


describe('QoS', () => {

  beforeEach(() => {
    mockServer.use(
      rest.post(FirmwareUrlsInfo.getApModelFamilies.url,
        (_, res, ctx) => {
          return res(ctx.json(mockedApModelFamilies))
        }
      )
    )
  })
  it('should render correctly', function () {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
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
