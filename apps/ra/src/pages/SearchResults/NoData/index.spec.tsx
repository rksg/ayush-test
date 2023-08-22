import { useIsSplitOn }            from '@acx-ui/feature-toggle'
import { cleanup, render, screen } from '@acx-ui/test-utils'

import NoData from '.'

describe('SearchResults - NoData', () => {

  afterEach(() => cleanup())

  const allLinks = [
    'Venues',
    'Networks',
    'APs',
    'Switches',
    'Wi-Fi Clients',
    'Switch Clients',
    'Dashboard'
  ]

  const toggleOffLinks = [
    'Venues',
    'Networks',
    'Dashboard'
  ]

  it('should render correctly for snapshot test with toggles on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<NoData />, { route: { params: { tenantId: '1234' } } })
    await Promise.all(allLinks.map(async (val) => {
      expect(await screen.findByText(val)).toBeInTheDocument()
    }))
  })

  it('should render correctly for snapshot test with toggles off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<NoData />, { route: { params: { tenantId: '1234' } } })
    await Promise.all(toggleOffLinks.map(async (val) => {
      expect(await screen.findByText(val)).toBeInTheDocument()
    }))
  })
})