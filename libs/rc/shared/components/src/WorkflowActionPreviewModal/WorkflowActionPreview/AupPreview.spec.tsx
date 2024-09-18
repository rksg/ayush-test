import { AupAction }      from '@acx-ui/rc/utils'
import { render, screen } from '@acx-ui/test-utils'

import { AupPreview } from './AupPreview'




describe('AUP Preview', () => {
  it('should render AUP preview correctly', async () => {
    const expectedTitle = 'Test Title'
    const expectedHtml = 'Test message html'
    render(<AupPreview
      data={{
        title: expectedTitle,
        messageHtml: expectedHtml
      } as AupAction}
    />)

    expect(screen.getByText(expectedTitle)).toBeInTheDocument()
    expect(screen.getByText(expectedHtml)).toBeInTheDocument()
    expect(await screen.findByRole('checkbox')).not.toBeChecked()
  })
})
