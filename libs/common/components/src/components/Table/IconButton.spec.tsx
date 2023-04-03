import userEvent from '@testing-library/user-event'

import { DownloadOutlined, MoreVertical } from '@acx-ui/icons'
import { render, screen }                 from '@acx-ui/test-utils'

import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('should render', async () => {
    const onClick = jest.fn()
    render(<IconButton
      icon={<DownloadOutlined />}
      onClick={onClick}
    />)
    await userEvent.click(screen.getByTestId('DownloadOutlined'))
    expect(onClick).toBeCalled()
  })
  it('should render menu', async () => {
    const onClick = jest.fn()
    render(<IconButton
      icon={<MoreVertical />}
      dropdownMenu={{
        items: [
          { key: 'item1', label: 'Item 1', onClick },
          { key: 'item2', label: 'Item 2' },
          { key: 'item3', label: 'Item 3' }
        ]
      }}
    />)
    await userEvent.click(screen.getByTestId('MoreVertical'))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Item 1' }))
    expect(onClick).toBeCalled()
  })
})
