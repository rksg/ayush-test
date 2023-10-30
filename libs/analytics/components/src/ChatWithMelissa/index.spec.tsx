import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { ChatWithMelissa } from '.'

describe('ChatWithMelissa', () => {
  it('renders properly', async () => {
    render(<ChatWithMelissa />)
    fireEvent.click(await screen.findByRole('button'))
    expect(screen.getByText('Melissa')).toBeVisible()
  })
})
