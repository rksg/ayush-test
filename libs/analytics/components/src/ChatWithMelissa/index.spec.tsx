import { render, screen } from '@acx-ui/test-utils'

import { ChatWithMelissa } from '.'

describe('ChatWithMelissa', () => {
  it('renders properly', () => {
    render(<ChatWithMelissa />)
    expect(screen.getByText('Melissa')).toBeVisible()
  })
})
