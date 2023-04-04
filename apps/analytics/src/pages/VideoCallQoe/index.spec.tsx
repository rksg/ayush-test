import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import VideoCallQoePage from '.'

describe('VideoCallQoePage', () => {
  const params = {
    tenantId: 'tenant-id'
  }
  it('should render page header', async () => {
    render(<Provider>
      <VideoCallQoePage />
    </Provider>, { route: { params } })
    expect(await screen.findByText('Video Call QoE')).toBeVisible()
  })
})
