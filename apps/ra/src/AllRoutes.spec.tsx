import { render, screen, cleanup, waitFor } from '@acx-ui/test-utils'

import AllRoutes from './AllRoutes'

describe('AllRoutes', () => {
  afterEach(() => cleanup())
  it('should render correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next' } })
    await waitFor(() =>
      expect(screen.getByText('profile loaded for the user:', { exact: false })).toBeVisible())
  })
})