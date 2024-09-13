import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { EnrollmentPortalLink } from '.'





describe('Enrollment Portal Link', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <EnrollmentPortalLink url='test'/>
    </Provider>)
    await screen.findByRole('link', { name: 'test' })
  })
})
