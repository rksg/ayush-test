import { useIsSplitOn }    from '@acx-ui/feature-toggle'
import { cleanup, render } from '@acx-ui/test-utils'

import NoData from '.'

describe('SearchResults - NoData', () => {

  afterEach(() => cleanup())

  it('should render correctly for snapshot test with toggles on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const { asFragment } = render(<NoData />, { route: { params: { tenantId: '1234' } } })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render correctly for snapshot test with toggles off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const { asFragment } = render(<NoData />, { route: { params: { tenantId: '1234' } } })
    expect(asFragment()).toMatchSnapshot()
  })
})