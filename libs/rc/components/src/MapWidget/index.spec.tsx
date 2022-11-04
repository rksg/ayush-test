import { useSplitTreatment }                                           from '@acx-ui/feature-toggle'
import { CommonUrlsInfo }                                              from '@acx-ui/rc/utils'
import { Provider }                                                    from '@acx-ui/store'
import { render, screen, mockRestApiQuery, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { MapWidget } from '.'

describe('Map', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url, 'get', {})
  })
  it('should not render map if feature flag is off', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(false)
    render(<Provider><MapWidget /></Provider>)
    await screen.findByText('Map is not enabled')
  })
  it('should render map if feature flag is on', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(true)

    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const { asFragment } = render(<Provider><MapWidget /></Provider>, {
      route: { params }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
})
