import { render, screen, cleanup } from '@acx-ui/test-utils'

import AllRoutes from './AllRoutes'

describe('AllRoutes', () => {
  afterEach(() => cleanup())
  it('should render correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next/incidents' } })
    await screen.findByText('profile loaded for the user:', { exact: false })
  })
})