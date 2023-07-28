import { render, screen } from '@acx-ui/test-utils'

import Dashboard from '.'

jest.mock('@acx-ui/analytics/components', () => {
  const sets = Object
    .keys(jest.requireActual('@acx-ui/analytics/components'))
    .map(key => [key, () => <div data-testid={key} />])
  return Object.fromEntries(sets)
})

describe('Dashboard', () => {
  it('renders correct components', async () => {
    render(<Dashboard />, { route: true })

    expect(screen.getByTestId('DidYouKnow')).toBeVisible()
    expect(screen.getByTestId('IncidentsCountBySeverities')).toBeVisible()
  })
})
