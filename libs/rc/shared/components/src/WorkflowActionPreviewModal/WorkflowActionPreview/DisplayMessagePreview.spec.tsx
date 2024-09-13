import { DisplayMessageAction } from '@acx-ui/rc/utils'
import { render, screen }       from '@acx-ui/test-utils'

import { DisplayMessagePreview } from './DisplayMessagePreview'


describe('Display Message Preview', () => {
  it('should render Display message correctly', () => {
    const expectedTitle = 'Test Title'
    const expectedHtml = 'Test message html'
    render(<DisplayMessagePreview
      data={{
        title: expectedTitle,
        messageHtml: expectedHtml
      } as DisplayMessageAction}
    />)

    expect(screen.getByText(expectedTitle)).toBeInTheDocument()
    expect(screen.getByText(expectedHtml)).toBeInTheDocument()
  })
})
