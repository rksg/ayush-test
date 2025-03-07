import { render, screen } from '@acx-ui/test-utils'

import { ResourceBanner } from './'


describe('ResourceBanner', () => {
  it('should render context successfully', () => {
    render(<ResourceBanner
      context={
        <div data-testid='test-context'>
        Hello
        </div>}
    />)

    expect(screen.getByTestId('test-context')).toBeInTheDocument()
  })
})
