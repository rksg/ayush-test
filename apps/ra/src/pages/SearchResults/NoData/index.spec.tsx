import { useIsSplitOn }            from '@acx-ui/feature-toggle'
import { cleanup, render, screen } from '@acx-ui/test-utils'

import NoData from '.'

describe('SearchResults - NoData', () => {

  afterEach(() => cleanup())

  const allLinks = [
    'Dashboard',
    'Incidents',
    'Network Assurance',
    'Reports',
    'Data Studio'
  ]

  it('should render correctly for snapshot test with toggles on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<NoData />, { route: { params: { tenantId: '1234' } } })
    await Promise.all(allLinks.map(async (val) => {
      expect(await screen.findByText(val)).toBeInTheDocument()
    }))
  })

})