import { render, screen, cleanup, waitFor } from '@acx-ui/test-utils'

import AllRoutes from './AllRoutes'

describe('AllRoutes', () => {
  afterEach(() => cleanup())
  it('should render correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next/incidents' } })
    await waitFor(() =>
      expect(screen.getByText('DATA API:')).toBeVisible())
  })
})