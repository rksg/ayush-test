import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { HelpButton } from './'


describe('HelpButton', () => {
  it('should render properly', async () => {
    render(
      <Provider><HelpButton /></Provider>,
      { route: { params: { tenantId: 'tenant-id' } } }
    )
    await userEvent.click(screen.getByRole('button'))
    const links = screen.getAllByRole('link')
    const items = [
      // eslint-disable-next-line max-len
      { text: 'What’s New', href: 'https://docs.cloud.ruckuswireless.com/RUCKUS-AI/releasenotes/releasenotes.html' },
      // eslint-disable-next-line max-len
      { text: 'Documentation', href: 'https://docs.cloud.ruckuswireless.com/RUCKUS-AI/userguide/index.html' },
      // eslint-disable-next-line max-len
      { text: 'How-To Videos', href: 'https://www.youtube.com/playlist?list=PLySwoo7u9-KJeAI4VY_2ha4r9tjnqE3Zi' },
      // eslint-disable-next-line max-len
      { text: 'License Information', href: 'https://docs.cloud.ruckuswireless.com/RUCKUS-AI/licensingguide/index.html' },
      { text: 'Contact Support', href: 'https://support.ruckuswireless.com/contact-us' },
      { text: 'Open a Case', href: 'https://support.ruckuswireless.com/cases/new' },
      { text: 'Privacy', href: 'https://www.commscope.com/about-us/privacy-statement/' }
    ]
    items.forEach((item, i) => {
      expect(links[i]).toHaveTextContent(item.text)
      expect(links[i]).toHaveAttribute('href', item.href)
      expect(links[i]).toHaveAttribute('rel', 'noreferrer noopener')
      expect(links[i]).toHaveAttribute('target', '_blank')
    })
  })
})
