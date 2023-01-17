import { render, screen } from '@acx-ui/test-utils'

import { Details } from './Details'

describe('Details component', () => {
  it('should render correctly', async () => {
    render(<Details />)
    expect(await screen.findByText('Details')).toBeVisible()
  })
})
