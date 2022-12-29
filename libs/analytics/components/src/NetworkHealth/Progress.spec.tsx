import { render, screen } from '@acx-ui/test-utils'

import { Progress } from './Progress'

describe('Progress component', () => {
  it('should render correctly', async () => {
    render(<Progress />)
    expect(await screen.findByText('Progress')).toBeVisible()
  })
})
