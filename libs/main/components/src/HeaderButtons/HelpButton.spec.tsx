import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import HelpButton from './HelpButton'

const params = { tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1' }

describe('HelpButton', () => {
  it('should render HelpButton correctly', async () => {
    render(<Provider>
      <HelpButton/>
    </Provider>, { route: { params } })
    expect(screen.getByRole('button')).toBeVisible()
  })
})

