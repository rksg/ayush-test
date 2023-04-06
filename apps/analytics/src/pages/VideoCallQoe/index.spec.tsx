import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import VideoCallQoeListPage from '.'

describe('VideoCallQoeListPage', () => {
  const params = {
    tenantId: 'tenant-id'
  }
  it('should render page header', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider>
      <VideoCallQoeListPage />
    </Provider>, { route: { params } })
    expect(await screen.findByText('Video Call QoE')).toBeVisible()
  })
  it('should not render page if feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<Provider>
      <VideoCallQoeListPage />
    </Provider>, { route: { params } })
    expect(await screen.findByText('Video Call QoE is not enabled')).toBeInTheDocument()
  })
})
