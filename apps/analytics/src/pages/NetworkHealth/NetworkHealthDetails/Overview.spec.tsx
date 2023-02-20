import { render, screen } from '@acx-ui/test-utils'

import { Overview } from './Overview'

describe('Overview component', () => {
  it('should render correctly', async () => {
    render(<Overview />)
    expect(await screen.findByText('Overview')).toBeVisible()
  })
})
