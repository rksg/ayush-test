import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import * as config        from '@acx-ui/config'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { HelpButton } from './'

jest.mock('@acx-ui/config')
const get = jest.mocked(config.get)

describe('HelpButton', () => {
  beforeEach(() => {
    get.mockReturnValue('https://documentation.com')
  })
  it('should render properly', async () => {
    render(
      <Provider><HelpButton /></Provider>,
      { route: { params: { tenantId: 'tenant-id' } } }
    )
    await userEvent.click(screen.getByRole('button'))
    const links = screen.getAllByRole('link')
    const items = [
      { text: 'Documentation', href: 'https://documentation.com' },
      // eslint-disable-next-line max-len
      { text: 'How-To Videos', href: 'https://www.youtube.com/playlist?list=PLySwoo7u9-KJ4kZxhfoArNQfFDGWhwSJm' },
      // eslint-disable-next-line max-len
      { text: 'License Information', href: 'https://docs.cloud.ruckuswireless.com/RALicensingGuide/mapfile/index.html' },
      { text: 'Contact Support', href: 'https://support.ruckuswireless.com/contact-us' },
      { text: 'Open a Case', href: 'https://support.ruckuswireless.com/cases/new' },
      { text: 'Privacy', href: 'https://support.ruckuswireless.com/ruckus-cloud-privacy-policy' }
    ]
    items.forEach((item, i) => {
      expect(links[i]).toHaveTextContent(item.text)
      expect(links[i]).toHaveAttribute('href', item.href)
      expect(links[i]).toHaveAttribute('rel', 'noreferrer noopener')
      expect(links[i]).toHaveAttribute('target', '_blank')
    })
  })
})
