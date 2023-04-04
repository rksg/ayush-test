import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import VideoCallQoeListPage from '.'

describe('VideoCallQoeListPage', () => {
  const params = {
    tenantId: 'tenant-id'
  }
  it('should render page header', async () => {
    render(<Provider>
      <VideoCallQoeListPage />
    </Provider>, { route: { params } })
    expect(await screen.findByText('Video Call QoE')).toBeVisible()
  })
})
