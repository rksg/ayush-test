import { EntitlementDeviceType } from '@acx-ui/rc/utils'
import { render, screen }        from '@acx-ui/test-utils'

import { MspSubscriptionUtilizationWidget } from './MspSubscriptionUtilizationWidget'

jest.mock('./styledComponent', () => ({
  ...jest.requireActual('./styledComponent')
}))

describe('MSP Subscription utilization widget', () => {
  it('should correctly display utilization', async () => {
    render(<MspSubscriptionUtilizationWidget
      deviceType={EntitlementDeviceType.WIFI}
      title='Wi-Fi'
      used={10}
      assigned={5}
      total={105}
      tooltip='purchased:100, courtesy:5'
    />)

    await screen.findByText('Wi-Fi')
  })

  it('should correctly display zero quantity', async () => {
    render(<MspSubscriptionUtilizationWidget
      deviceType={EntitlementDeviceType.SWITCH}
      title='Switch'
      used={0}
      assigned={0}
      total={0}
    />)

    await screen.findByText('Switch')
    expect(await screen.findByText(/0\s+\/\s+0/i)).toBeVisible()
  })
})