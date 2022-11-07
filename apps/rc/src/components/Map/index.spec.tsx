import { useIsSplitOn }                                                from '@acx-ui/feature-toggle'
import { CommonUrlsInfo }                                              from '@acx-ui/rc/utils'
import { Provider }                                                    from '@acx-ui/store'
import { render, screen, mockRestApiQuery, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { Map } from '.'

describe('Map', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url, 'get', {})
  })
  it('should not render map if feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<Provider><Map /></Provider>)
    await screen.findByText('Map is not enabled')
  })
  it('should render map if feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const { asFragment } = render(<Provider><Map /></Provider>, {
      route: { params }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
})
