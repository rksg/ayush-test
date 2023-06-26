import { render, screen, cleanup } from '@acx-ui/test-utils'

import AllRoutes from './AllRoutes'

describe('AllRoutes', () => {
  beforeEach(() => {
    global.window.innerWidth = 1920
    global.window.innerHeight = 1080
  })
  afterEach(() => cleanup())
  it('should render correctly', async () => {
    render(<AllRoutes />, { route: { path: '/analytics/next/incidents' } })
    await screen.findByText('profile loaded for the user:', { exact: false })
  })
})